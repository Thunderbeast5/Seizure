import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { doctorService, PatientSummary } from '../services/doctorService';
import { patientDataService, PatientSeizure } from '../services/patientDataService';
import { PageHeader } from '../components/Layout/PageHeader';
import { Link } from 'react-router-dom';

/* ---------- helpers (extracted for perf) ---------- */

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}> = React.memo(({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
));

/* ---------- page ---------- */

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [seizureTrends, setSeizureTrends] = useState<{ month: string; seizures: number }[]>([]);
  const [seizureTypeDist, setSeizureTypeDist] = useState<{ type: string; value: number }[]>([]);
  const [growthRatePct, setGrowthRatePct] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const assigned = await doctorService.getAssignedPatients(user.uid);

      const enriched = await Promise.all(
        assigned.map(async (p) => {
          try {
            const [stats, seizures] = await Promise.all([
              patientDataService.getSeizureStatistics(p.userId),
              patientDataService.getPatientSeizures(p.userId),
            ]);
            return {
              ...p,
              totalSeizures: stats.totalSeizures,
              lastSeizureDate: stats.lastSeizureDate || undefined,
              videoCount: seizures.filter((s: PatientSeizure) => !!s.videoUrl).length,
            } as PatientSummary;
          } catch {
            return p;
          }
        }),
      );

      setPatients(enriched);

      // Trends
      const now = new Date();
      const months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: d.toLocaleString(undefined, { month: 'short' }),
        };
      });
      const counts: Record<string, number> = {};
      months.forEach((m) => (counts[m.key] = 0));

      const allSeizures = (
        await Promise.all(assigned.map((p) => patientDataService.getPatientSeizures(p.userId)))
      ).flat();

      allSeizures.forEach((s) => {
        const d = new Date(s.date);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (k in counts) counts[k] += 1;
      });
      setSeizureTrends(months.map((m) => ({ month: m.label, seizures: counts[m.key] || 0 })));

      // Type distribution
      const tc: Record<string, number> = {};
      allSeizures.forEach((s: any) => {
        const t = (s.type || 'Unknown') as string;
        tc[t] = (tc[t] || 0) + 1;
      });
      setSeizureTypeDist(Object.entries(tc).map(([type, value]) => ({ type, value })));

      // Growth
      const dayMs = 86400000;
      const last30 = allSeizures.filter((s) => new Date(s.date) >= new Date(Date.now() - 30 * dayMs));
      const prev30 = allSeizures.filter(
        (s) => new Date(s.date) >= new Date(Date.now() - 60 * dayMs) && new Date(s.date) < new Date(Date.now() - 30 * dayMs),
      );
      const g = prev30.length === 0
        ? last30.length > 0 ? 100 : 0
        : ((last30.length - prev30.length) / prev30.length) * 100;
      setGrowthRatePct(Math.round(g * 10) / 10);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { loadData(); }, [loadData]);

  const patientAgeData = useMemo(() => {
    const b: Record<string, number> = { '0-5': 0, '6-10': 0, '11-15': 0, '16-20': 0, '21-30': 0, '31+': 0 };
    patients.forEach((p) => {
      const a = p.age || 0;
      if (a <= 5) b['0-5']++;
      else if (a <= 10) b['6-10']++;
      else if (a <= 15) b['11-15']++;
      else if (a <= 20) b['16-20']++;
      else if (a <= 30) b['21-30']++;
      else b['31+']++;
    });
    return Object.entries(b).map(([age, count]) => ({ age, count }));
  }, [patients]);

  const recentSeizures = patients.filter(
    (p) => p.lastSeizureDate && new Date(p.lastSeizureDate) > new Date(Date.now() - 7 * 86400000),
  ).length;

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-80 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Overview of your patients and seizure activity" showBreadcrumbs={false} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={UserGroupIcon} label="Total Patients" value={patients.length} color="bg-blue-500" />
        <StatCard icon={CalendarIcon} label="Recent Seizures (7d)" value={recentSeizures} color="bg-amber-500" />
        <StatCard icon={ExclamationTriangleIcon} label="High Risk" value={patients.filter((p) => p.totalSeizures > 10).length} color="bg-red-500" />
        <StatCard
          icon={ChartBarIcon}
          label="Avg Seizures/Patient"
          value={patients.length ? Math.round(patients.reduce((s, p) => s + p.totalSeizures, 0) / patients.length) : 0}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Seizure Trends</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={seizureTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="seizures" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={patientAgeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="age" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Seizure Types</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={seizureTypeDist} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={85} label>
                {seizureTypeDist.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth KPI */}
      {growthRatePct !== null && (
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">30-Day Seizure Growth</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {growthRatePct}%
                  <span className={`text-sm ${growthRatePct >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {growthRatePct >= 0 ? '▲' : '▼'}
                  </span>
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400">vs previous 30 days</span>
          </div>
        </div>
      )}

      {/* Patient Quick List */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Connected Patients</h3>
          <Link to="/patients" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All →
          </Link>
        </div>
        {patients.length === 0 ? (
          <div className="text-center py-12 px-6">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-900">No patients connected yet</p>
            <p className="text-sm text-gray-500 mt-1">
              <Link to="/patients/search" className="text-blue-600 hover:text-blue-800">Search for patients</Link> to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  {['Patient', 'Age', 'Type', 'Total Seizures', 'Last Seizure', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patients
                  .slice()
                  .sort((a, b) => {
                    const ad = a.lastSeizureDate ? new Date(a.lastSeizureDate).getTime() : 0;
                    const bd = b.lastSeizureDate ? new Date(b.lastSeizureDate).getTime() : 0;
                    return bd - ad;
                  })
                  .slice(0, 10)
                  .map((p) => (
                    <tr key={p.userId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-700">{p.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{p.age}y</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{p.seizureType}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.totalSeizures}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {p.lastSeizureDate ? new Date(p.lastSeizureDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/patients/${p.userId}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};