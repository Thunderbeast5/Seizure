import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { doctorService, PatientSummary } from '../services/doctorService';
import { patientDataService, PatientSeizure } from '../services/patientDataService';
import { PageHeader } from '../components/Layout/PageHeader';

export const PatientListPage: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { load(); }, [load]);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.seizureType?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} connected patient${patients.length !== 1 ? 's' : ''}`}
        actions={
          <Link
            to="/patients/search"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Patient
          </Link>
        }
      />

      {/* Filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by name or seizure type..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">
            {filter ? 'No patients match your filter' : 'No patients connected yet'}
          </p>
          {!filter && (
            <Link to="/patients/search" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800">
              Search for patients →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.userId}
              to={`/patients/${p.userId}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <span className="text-lg font-bold text-blue-700">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    {p.age}y • {p.gender} • {p.seizureType || 'Unknown type'}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-lg font-bold text-gray-900">{p.totalSeizures}</p>
                  <p className="text-xs text-gray-500">Seizures</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-lg font-bold text-gray-900">{p.videoCount || 0}</p>
                  <p className="text-xs text-gray-500">Videos</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-xs font-medium text-gray-900 leading-tight mt-1">
                    {p.lastSeizureDate ? new Date(p.lastSeizureDate).toLocaleDateString() : '—'}
                  </p>
                  <p className="text-xs text-gray-500">Last Seizure</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};