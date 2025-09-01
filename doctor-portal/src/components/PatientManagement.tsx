import {
    BeakerIcon,
    CalendarIcon,
    ChartBarIcon,
    PlusIcon,
    TrashIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { patientDataService, PatientMedication, PatientProfile, PatientSeizure } from '../services/patientDataService';

interface PatientManagementProps {
  patientId: string;
}

export const PatientManagement: React.FC<PatientManagementProps> = ({ patientId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState<{
    profile: PatientProfile | null;
    seizures: PatientSeizure[];
    medications: PatientMedication[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddSeizure, setShowAddSeizure] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);

  const loadPatientData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await patientDataService.getCompletePatientData(patientId);
      setPatientData(data);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  const handleAddSeizure = async (seizureData: Omit<PatientSeizure, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await patientDataService.addPatientSeizure(patientId, seizureData);
      await loadPatientData();
      setShowAddSeizure(false);
    } catch (error) {
      console.error('Error adding seizure:', error);
    }
  };

  const handleAddMedication = async (medicationData: Omit<PatientMedication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await patientDataService.addPatientMedication(patientId, medicationData);
      await loadPatientData();
      setShowAddMedication(false);
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const handleDeleteSeizure = async (seizureId: string) => {
    if (window.confirm('Are you sure you want to delete this seizure record?')) {
      try {
        await patientDataService.deletePatientSeizure(seizureId);
        await loadPatientData();
      } catch (error) {
        console.error('Error deleting seizure:', error);
      }
    }
  };

  const handleDeleteMedication = async (medicationId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await patientDataService.deletePatientMedication(medicationId);
        await loadPatientData();
      } catch (error) {
        console.error('Error deleting medication:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading patient data...</div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No patient data found</div>
      </div>
    );
  }

  const { profile, seizures, medications } = patientData;

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profile?.child?.name || 'Unknown Patient'}
            </h2>
            <p className="text-gray-600">
              Age: {profile?.child?.age || 'Unknown'} • {profile?.child?.gender || 'Unknown'}
            </p>
            <p className="text-sm text-gray-500">
              Patient ID: {patientId}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'seizures', name: 'Seizures', icon: CalendarIcon },
              { id: 'medications', name: 'Medications', icon: BeakerIcon },
              { id: 'profile', name: 'Profile', icon: UserIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CalendarIcon className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Seizures</p>
                      <p className="text-2xl font-bold text-blue-900">{seizures.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <BeakerIcon className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Active Medications</p>
                      <p className="text-2xl font-bold text-green-900">
                        {medications.filter(m => m.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Last Seizure</p>
                      <p className="text-sm font-bold text-purple-900">
                        {seizures.length > 0 
                          ? new Date(seizures[0].date).toLocaleDateString()
                          : 'None'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {seizures.slice(0, 3).map((seizure) => (
                    <div key={seizure.id} className="flex items-center justify-between bg-white rounded p-3">
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium">Seizure - {seizure.type}</p>
                          <p className="text-sm text-gray-500">{new Date(seizure.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{seizure.duration || 'Unknown duration'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Seizures Tab */}
          {activeTab === 'seizures' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Seizure Records</h3>
                <button
                  onClick={() => setShowAddSeizure(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Seizure</span>
                </button>
              </div>

              {seizures.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No seizure records found
                </div>
              ) : (
                <div className="space-y-3">
                  {seizures.map((seizure) => (
                    <div key={seizure.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{seizure.type}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(seizure.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <span className="ml-2">{seizure.duration || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Severity:</span>
                              <span className="ml-2">{seizure.severity || 'Unknown'}</span>
                            </div>
                          </div>
                          {seizure.notes && (
                            <p className="text-sm text-gray-600 mt-2">{seizure.notes}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteSeizure(seizure.id!)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Medications</h3>
                <button
                  onClick={() => setShowAddMedication(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Medication</span>
                </button>
              </div>

              {medications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No medications found
                </div>
              ) : (
                <div className="space-y-3">
                  {medications.map((medication) => (
                    <div key={medication.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{medication.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              medication.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {medication.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Dosage:</span>
                              <span className="ml-2">{medication.dosage}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Frequency:</span>
                              <span className="ml-2">{medication.frequency}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Start Date:</span>
                              <span className="ml-2">{new Date(medication.startDate).toLocaleDateString()}</span>
                            </div>
                            {medication.endDate && (
                              <div>
                                <span className="text-gray-500">End Date:</span>
                                <span className="ml-2">{new Date(medication.endDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          {medication.notes && (
                            <p className="text-sm text-gray-600 mt-2">{medication.notes}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteMedication(medication.id!)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Patient Profile</h3>
              {profile ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.child?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Age</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.child?.age || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.child?.gender || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Seizure Type</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.diagnosis?.type || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Diagnosis Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.diagnosis?.date ? new Date(profile.diagnosis.date).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assigned Doctor</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.doctorId || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No profile information available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Seizure Modal */}
      {showAddSeizure && (
        <AddSeizureModal
          onClose={() => setShowAddSeizure(false)}
          onSave={handleAddSeizure}
        />
      )}

      {/* Add Medication Modal */}
      {showAddMedication && (
        <AddMedicationModal
          onClose={() => setShowAddMedication(false)}
          onSave={handleAddMedication}
        />
      )}
    </div>
  );
};

// Add Seizure Modal Component
const AddSeizureModal: React.FC<{
  onClose: () => void;
  onSave: (data: Omit<PatientSeizure, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
}> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    duration: '',
    severity: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Seizure Record</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Tonic-Clonic, Absence"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., 2 minutes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Severity</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select severity</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Seizure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Medication Modal Component
const AddMedicationModal: React.FC<{
  onClose: () => void;
  onSave: (data: Omit<PatientMedication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
}> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Medication</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Medication Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Levetiracetam"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dosage</label>
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., 500mg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Frequency</label>
            <input
              type="text"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Twice daily"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active medication
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
