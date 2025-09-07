import {
    ArrowRightOnRectangleIcon,
    BellIcon,
    CalendarIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { doctorService, PatientSummary } from '../services/doctorService';
import { patientDataService, PatientSeizure } from '../services/patientDataService';
import { onForegroundMessage, requestFcmToken } from '../firebase.config';
import { doc as fsDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { ConnectionRequests } from './ConnectionRequests';
import { PatientManagement } from './PatientManagement';
import { PatientSearch } from './PatientSearch';

export const Dashboard: React.FC = () => {
  const { user, doctorData, logout } = useAuth();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [seizureTrends, setSeizureTrends] = useState<{ month: string; seizures: number }[]>([]);
  const [growthRatePct, setGrowthRatePct] = useState<number | null>(null);
  const [expandedPatientIds, setExpandedPatientIds] = useState<Set<string>>(new Set());
  const [patientDetailsById, setPatientDetailsById] = useState<Record<string, { profile: any; seizures: PatientSeizure[]; medications: any[] }>>({});
  const [patientDetailsLoading, setPatientDetailsLoading] = useState<Record<string, boolean>>({});
  const [seizureTypeDist, setSeizureTypeDist] = useState<{ type: string; value: number }[]>([]);
  const [patientSparkById, setPatientSparkById] = useState<Record<string, { day: string; count: number }[]>>({});
  const [patientSparkMetaById, setPatientSparkMetaById] = useState<Record<string, { last7: number; prev7: number; deltaPct: number }>>({});
  const [notifications, setNotifications] = useState<Array<{ id: string; patientId: string; patientName: string; date: string; type: string; seizureId?: string; severity?: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const subscriptionsRef = React.useRef<Array<() => void>>([]);
  const seenNotifIdsRef = React.useRef<Set<string>>(new Set());
  // No local usage after switching to URL navigation
  const [toast, setToast] = useState<{ title: string; body: string; href?: string } | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const hasArmedAudioRef = React.useRef(false);

  const loadPatients = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const assignedPatients = await doctorService.getAssignedPatients(user.uid);

      // Enrich with real seizure stats and video counts
      const enrichedPatients = await Promise.all(
        assignedPatients.map(async (p) => {
          try {
            const [stats, seizures] = await Promise.all([
              patientDataService.getSeizureStatistics(p.userId),
              patientDataService.getPatientSeizures(p.userId)
            ]);

            const videoCount = seizures.filter((s: PatientSeizure) => !!s.videoUrl).length;

            return {
              ...p,
              totalSeizures: stats.totalSeizures,
              lastSeizureDate: stats.lastSeizureDate || undefined,
              videoCount
            } as PatientSummary;
          } catch (e) {
            // Fall back to basic profile data if detailed fetch fails
            return p;
          }
        })
      );

      setPatients(enrichedPatients);

      // Compute seizure trends (last 6 months aggregate across patients)
      const now = new Date();
      const months: { key: string; label: string }[] = Array.from({ length: 6 }).map((_, idx) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString(undefined, { month: 'short' });
        return { key, label };
      });

      const counts: Record<string, number> = months.reduce((acc, m) => {
        acc[m.key] = 0;
        return acc;
      }, {} as Record<string, number>);

      // We already fetched per-patient seizures above; fetch again for aggregation
      try {
        const allSeizuresArrays = await Promise.all(
          assignedPatients.map((p) => patientDataService.getPatientSeizures(p.userId))
        );
        const flatSeizures = allSeizuresArrays.flat();
        flatSeizures.forEach((s) => {
          const d = new Date(s.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (key in counts) counts[key] += 1;
        });
        // Seizure type distribution (aggregate)
        const typeCounts: Record<string, number> = {};
        flatSeizures.forEach((s: any) => {
          const t = (s.type || 'Unknown') as string;
          typeCounts[t] = (typeCounts[t] || 0) + 1;
        });
        setSeizureTypeDist(Object.entries(typeCounts).map(([type, value]) => ({ type, value })));

        // Per-patient last 7 days sparkline data
        const dayMsSpark = 24 * 60 * 60 * 1000;
        const nowTsSpark = Date.now();
        const last7Refs: Date[] = Array.from({ length: 7 }).map((_, idx) => new Date(nowTsSpark - (6 - idx) * dayMsSpark));
        const sparkMap: Record<string, { day: string; count: number }[]> = {};
        const sparkMeta: Record<string, { last7: number; prev7: number; deltaPct: number }> = {};
        const prev7StartTs = nowTsSpark - 13 * dayMsSpark; // 14 days window start
        const prev7Refs: Date[] = Array.from({ length: 7 }).map((_, idx) => new Date(prev7StartTs + idx * dayMsSpark));
        assignedPatients.forEach((p, idx) => {
          const seizures = allSeizuresArrays[idx] || [];
          const countsByDay: Record<string, number> = {};
          last7Refs.forEach((d) => {
            const key = d.toISOString().slice(0, 10);
            countsByDay[key] = 0;
          });
          seizures.forEach((s) => {
            const key = new Date(s.date).toISOString().slice(0, 10);
            if (key in countsByDay) countsByDay[key] += 1;
          });
          sparkMap[p.userId] = last7Refs.map((d) => ({
            day: d.toLocaleDateString(undefined, { weekday: 'short' }),
            count: countsByDay[d.toISOString().slice(0, 10)] || 0,
          }));

          // Meta: last7 and prev7 totals for WoW delta
          const last7Total = last7Refs.reduce((sum, d) => sum + (countsByDay[d.toISOString().slice(0, 10)] || 0), 0);
          // Build prev7 map
          const prevCountsByDay: Record<string, number> = {};
          prev7Refs.forEach((d) => {
            prevCountsByDay[d.toISOString().slice(0, 10)] = 0;
          });
          seizures.forEach((s) => {
            const key = new Date(s.date).toISOString().slice(0, 10);
            if (key in prevCountsByDay) prevCountsByDay[key] += 1;
          });
          const prev7Total = prev7Refs.reduce((sum, d) => sum + (prevCountsByDay[d.toISOString().slice(0, 10)] || 0), 0);
          const deltaPct = prev7Total === 0 ? (last7Total > 0 ? 100 : 0) : ((last7Total - prev7Total) / prev7Total) * 100;
          sparkMeta[p.userId] = { last7: last7Total, prev7: prev7Total, deltaPct: Math.round(deltaPct * 10) / 10 };
        });
        setPatientSparkById(sparkMap);
        setPatientSparkMetaById(sparkMeta);
        // Calculate growth rate: last 30 days vs previous 30 days
        const nowTsGrowth = Date.now();
        const dayMsGrowth = 24 * 60 * 60 * 1000;
        const last30Start = new Date(nowTsGrowth - 30 * dayMsGrowth);
        const prev30Start = new Date(nowTsGrowth - 60 * dayMsGrowth);

        const last30 = flatSeizures.filter((s) => new Date(s.date) >= last30Start);
        const prev30 = flatSeizures.filter((s) => new Date(s.date) >= prev30Start && new Date(s.date) < last30Start);

        const lastCount = last30.length;
        const prevCount = prev30.length;
        const growth = prevCount === 0 ? (lastCount > 0 ? 100 : 0) : ((lastCount - prevCount) / prevCount) * 100;
        setGrowthRatePct(Number.isFinite(growth) ? Math.round(growth * 10) / 10 : 0);
      } catch {
        // Ignore trend aggregation errors; UI will fallback to zeros
      }

      setSeizureTrends(months.map((m) => ({ month: m.label, seizures: counts[m.key] || 0 })));
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Register service worker and FCM (optional) once
  useEffect(() => {
    (async () => {
      try {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        }
        const vapid = (process.env.REACT_APP_VAPID_KEY as string) || '';
        if (vapid) {
          const token = await requestFcmToken(vapid);
          if (token && user?.uid) {
            await setDoc(fsDoc(db, 'doctorFcmTokens', user.uid), {
              token,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        }
        onForegroundMessage?.((payload) => {
          const data = payload?.data || {};
          const id = data.id || `${Date.now()}-${Math.random()}`;
          if (seenNotifIdsRef.current.has(id)) return;
          seenNotifIdsRef.current.add(id);
          setNotifications((prev) => [{
            id,
            patientId: data.patientId || 'unknown',
            patientName: data.patientName || 'Patient',
            date: data.date || new Date().toISOString(),
            type: data.type || 'Seizure',
            seizureId: data.seizureId,
            severity: data.severity
          }, ...prev].slice(0, 20));
          setUnreadCount((c) => c + 1);

          // Floating toast + sound
          const href = data.patientId ? `/patient/${data.patientId}?tab=seizures${data.seizureId ? `&seizureId=${encodeURIComponent(data.seizureId)}` : ''}` : undefined;
          setToast({
            title: `${data.patientName || 'Patient'} logged a ${data.type || 'Seizure'}`,
            body: data.severity ? `Severity: ${data.severity}` : new Date((data.date as string) || Date.now()).toLocaleString(),
            href
          });
          try { playPing(); } catch {}
        });
      } catch (e) {
        // Non-blocking
      }
    })();
  }, [user?.uid]);

  // Set up real-time notifications for seizures in last 24h per patient
  useEffect(() => {
    // cleanup previous
    subscriptionsRef.current.forEach((u) => u());
    subscriptionsRef.current = [];
    if (patients.length === 0) return;

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    patients.forEach((p) => {
      const unsubscribe = patientDataService.subscribeToPatientSeizures(p.userId, (seizures) => {
        seizures
          .filter((s) => new Date(s.date) >= dayAgo)
          .forEach((s) => {
            const nid = s.id || `${p.userId}-${s.date}-${s.type}`;
            if (seenNotifIdsRef.current.has(nid)) return;
            seenNotifIdsRef.current.add(nid);
            setNotifications((prev) => ([{
              id: nid,
              patientId: p.userId,
              patientName: p.name,
              date: s.date,
              type: s.type,
              seizureId: s.id,
              severity: s.severity
            }, ...prev]).slice(0, 20));
            setUnreadCount((c) => c + 1);

            // Floating toast + sound for in-app real-time
            const href = `/patient/${p.userId}?tab=seizures${s.id ? `&seizureId=${encodeURIComponent(s.id)}` : ''}`;
            setToast({
              title: `${p.name} logged a ${s.type}`,
              body: s.severity ? `Severity: ${s.severity}` : new Date(s.date).toLocaleString(),
              href
            });
            try { playPing(); } catch {}
          });
      });
      subscriptionsRef.current.push(unsubscribe);
    });

    return () => {
      subscriptionsRef.current.forEach((u) => u());
      subscriptionsRef.current = [];
    };
  }, [patients]);

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Arm audio context on first interaction
  useEffect(() => {
    const arm = () => {
      if (!hasArmedAudioRef.current) {
        try {
          // @ts-ignore
          const Ctx = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new Ctx();
          hasArmedAudioRef.current = true;
        } catch {}
      }
      document.removeEventListener('click', arm);
      document.removeEventListener('keydown', arm);
    };
    document.addEventListener('click', arm);
    document.addEventListener('keydown', arm);
    return () => {
      document.removeEventListener('click', arm);
      document.removeEventListener('keydown', arm);
    };
  }, []);

  const playPing = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.42);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Real data for charts (computed from Firestore)
  const seizureData = seizureTrends;

  const patientAgeData = (() => {
    const buckets: { [label: string]: number } = {
      '0-5': 0,
      '6-10': 0,
      '11-15': 0,
      '16-20': 0,
      '21-30': 0,
      '31+': 0,
    };
    patients.forEach((p) => {
      const age = p.age || 0;
      if (age <= 5) buckets['0-5'] += 1;
      else if (age <= 10) buckets['6-10'] += 1;
      else if (age <= 15) buckets['11-15'] += 1;
      else if (age <= 20) buckets['16-20'] += 1;
      else if (age <= 30) buckets['21-30'] += 1;
      else buckets['31+'] += 1;
    });
    return Object.entries(buckets).map(([age, count]) => ({ age, count }));
  })();

  const toggleExpandPatient = async (patientId: string) => {
    setExpandedPatientIds((prev) => {
      const next = new Set(prev);
      if (next.has(patientId)) next.delete(patientId); else next.add(patientId);
      return next;
    });

    if (!patientDetailsById[patientId]) {
      setPatientDetailsLoading((prev) => ({ ...prev, [patientId]: true }));
      try {
        const data = await patientDataService.getCompletePatientData(patientId);
        setPatientDetailsById((prev) => ({
          ...prev,
          [patientId]: {
            profile: data.profile,
            seizures: data.seizures as PatientSeizure[],
            medications: data.medications,
          },
        }));
      } catch (e) {
        // swallow; row will show minimal info
      } finally {
        setPatientDetailsLoading((prev) => ({ ...prev, [patientId]: false }));
      }
    }
  };

  const renderOverview = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                  <dd className="text-lg font-medium text-gray-900">{patients.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recent Seizures</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {patients.filter(p => p.lastSeizureDate && new Date(p.lastSeizureDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">High Risk Patients</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {patients.filter(p => p.totalSeizures > 10).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Seizures/Month</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.totalSeizures, 0) / patients.length) : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Seizure Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={seizureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="seizures" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientAgeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Seizure Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={seizureTypeDist} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={90} label>
                {seizureTypeDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#14b8a6"][index % 6]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth KPI */}
      <div className="grid grid-cols-1 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Seizure Growth (last 30 days)</dt>
                    <dd className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                      {growthRatePct !== null ? `${growthRatePct}%` : '—'}
                      {growthRatePct !== null && (
                        <span className={growthRatePct >= 0 ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                          {growthRatePct >= 0 ? '▲' : '▼'}
                        </span>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="text-xs text-gray-500">vs previous 30 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Connected Patients</h3>
          {patients.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patients connected yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Use the &quot;Search Patients&quot; tab to find and connect with patients.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seizure Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last 7 days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Seizures</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seizure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Videos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients
                    .slice()
                    .sort((a, b) => {
                      const aDate = a.lastSeizureDate ? new Date(a.lastSeizureDate).getTime() : 0;
                      const bDate = b.lastSeizureDate ? new Date(b.lastSeizureDate).getTime() : 0;
                      return bDate - aDate;
                    })
                    .map((patient) => (
                    <React.Fragment key={patient.userId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-medical-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-medical-600">
                                {patient.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">{patient.gender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.age} years</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.seizureType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="w-40 h-10">
                          <ResponsiveContainer width="100%" height={40}>
                            <AreaChart data={patientSparkById[patient.userId] || []}>
                              <defs>
                                <linearGradient id={`colorSpark-${patient.userId}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5}/>
                                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="day" hide/>
                              <YAxis hide/>
                              <Tooltip />
                              <Area type="monotone" dataKey="count" stroke="#0ea5e9" fillOpacity={1} fill={`url(#colorSpark-${patient.userId})`} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-xs mt-1 flex items-center gap-2">
                          <span className="text-gray-500">7d:</span>
                          <span className="font-medium">{patientSparkMetaById[patient.userId]?.last7 ?? 0}</span>
                          {typeof patientSparkMetaById[patient.userId]?.deltaPct === 'number' && (
                            <span className={patientSparkMetaById[patient.userId].deltaPct >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {patientSparkMetaById[patient.userId].deltaPct >= 0 ? '▲' : '▼'} {Math.abs(patientSparkMetaById[patient.userId].deltaPct)}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.totalSeizures}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.lastSeizureDate ? new Date(patient.lastSeizureDate).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>{patient.videoCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => toggleExpandPatient(patient.userId)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {expandedPatientIds.has(patient.userId) ? 'Hide' : 'Details'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.userId);
                            setActiveTab('manage');
                          }}
                          className="text-medical-600 hover:text-medical-900"
                        >
                          View more
                        </button>
                      </td>
                    </tr>
                    {expandedPatientIds.has(patient.userId) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-4">
                              <h4 className="text-sm font-semibold text-gray-800 mb-2">Profile</h4>
                              <div className="text-sm text-gray-600">
                                <div><span className="text-gray-500">Name:</span> {patient.name}</div>
                                <div><span className="text-gray-500">Gender:</span> {patient.gender}</div>
                                <div><span className="text-gray-500">Age:</span> {patient.age}</div>
                                <div><span className="text-gray-500">Diagnosis:</span> {patient.seizureType || '—'}</div>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                              <h4 className="text-sm font-semibold text-gray-800 mb-2">Medications</h4>
                              {patientDetailsLoading[patient.userId] ? (
                                <div className="text-sm text-gray-500">Loading...</div>
                              ) : (
                                <div className="text-sm text-gray-600">
                                  {patientDetailsById[patient.userId]?.medications?.length ? (
                                    <div>
                                      <div className="mb-2">Active: {patientDetailsById[patient.userId].medications.filter((m: any) => m.isActive).length}</div>
                                      <div>Total: {patientDetailsById[patient.userId].medications.length}</div>
                                    </div>
                                  ) : (
                                    <div>No medications found</div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                              <h4 className="text-sm font-semibold text-gray-800 mb-2">Recent Seizures</h4>
                              {patientDetailsLoading[patient.userId] ? (
                                <div className="text-sm text-gray-500">Loading...</div>
                              ) : (
                                <div className="text-sm text-gray-600 space-y-1">
                                  {patientDetailsById[patient.userId]?.seizures?.slice(0, 3).map((s, idx) => (
                                    <div key={idx} className="flex justify-between">
                                      <span>{new Date(s.date).toLocaleDateString()}</span>
                                      <span className="text-gray-500">{s.type}</span>
                                    </div>
                                  )) || <div>No seizures found</div>}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                setSelectedPatientId(patient.userId);
                                setActiveTab('manage');
                              }}
                              className="text-medical-600 hover:text-medical-900 text-sm"
                            >
                              Open Full Report →
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 relative">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {doctorData?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{doctorData?.specialty}</span>
              <button
                onClick={() => { setShowNotifications((v) => !v); setUnreadCount(0); }}
                className="relative px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b text-sm font-semibold">Recent Seizures (24h)</div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No recent activity</div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setShowNotifications(false);
                          // Navigate via URL so we can pass params cleanly
                          window.location.href = `/patient/${n.patientId}?tab=seizures${n.seizureId ? `&seizureId=${encodeURIComponent(n.seizureId)}` : ''}`;
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div className="mt-1">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                          </svg>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{n.patientName}</div>
                          <div className="text-gray-600">Logged a {n.type} seizure{n.severity ? ` (${n.severity})` : ''}</div>
                          <div className="text-gray-400 text-xs">{new Date(n.date).toLocaleString()}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-medical-500 text-medical-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-medical-500 text-medical-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Search Patients
                </div>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-medical-500 text-medical-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BellIcon className="h-5 w-5" />
                  Connection Requests
                </div>
              </button>
              {selectedPatientId && (
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'manage'
                      ? 'border-medical-500 text-medical-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5" />
                    Manage Patient
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'search' && <PatientSearch />}
        {activeTab === 'requests' && <ConnectionRequests />}
        {activeTab === 'manage' && selectedPatientId && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setSelectedPatientId(null);
                }}
                className="text-medical-600 hover:text-medical-900 flex items-center gap-2"
              >
                ← Back to Overview
              </button>
            </div>
            <PatientManagement patientId={selectedPatientId} />
          </div>
        )}
        {/* Floating toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white shadow-xl rounded-lg border border-gray-200 p-4 w-80">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{toast.title}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{toast.body}</div>
                  {toast.href && (
                    <button
                      onClick={() => { window.location.href = toast.href!; }}
                      className="mt-2 text-sm text-medical-600 hover:text-medical-900"
                    >
                      View details →
                    </button>
                  )}
                </div>
                <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
