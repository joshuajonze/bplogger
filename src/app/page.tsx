'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import AddReadingModal from './components/AddReadingModal';
import EditReadingModal from './components/EditReadingModal';

interface BPReading {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  notes: string | null;
  createdAt: string;
  measuredAt: string;
}

export default function Home() {
  const [readings, setReadings] = useState<BPReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentReading, setCurrentReading] = useState<BPReading | null>(null);

  useEffect(() => {
    async function fetchReadings() {
      try {
        const response = await fetch('/api/readings');
        if (!response.ok) {
          throw new Error('Failed to fetch readings');
        }
        const data = await response.json();
        setReadings(data);
      } catch (error) {
        console.error('Error fetching readings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReadings();
  }, []);

  // Function to determine BP category
  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { category: 'Normal', color: 'text-green-700' };
    if ((systolic >= 120 && systolic <= 129) && diastolic < 80) return { category: 'Elevated', color: 'text-yellow-700' };
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return { category: 'Stage 1', color: 'text-orange-700' };
    if (systolic >= 140 || diastolic >= 90) return { category: 'Stage 2', color: 'text-red-700' };
    if (systolic > 180 || diastolic > 120) return { category: 'Crisis', color: 'text-red-800 font-bold' };
    return { category: 'Unknown', color: 'text-gray-700' };
  };

  // Add these handler functions
  const handleAddReading = async (data: Omit<BPReading, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create reading');
      }

      const newReading = await response.json();
      setReadings([newReading, ...readings]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating reading:', error);
      alert('Failed to save reading. Please try again.');
    }
  };

  const handleUpdateReading = async (data: BPReading) => {
    try {
      const response = await fetch(`/api/readings/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update reading');
      }

      const updatedReading = await response.json();
      setReadings(readings.map(r => r.id === updatedReading.id ? updatedReading : r));
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating reading:', error);
      alert('Failed to update reading. Please try again.');
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Blood Pressure Tracker</h1>
      
      <div className="mb-8">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Reading
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : readings.length === 0 ? (
        <p>No readings yet. Add your first blood pressure reading.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-4 py-3 text-left">Date/Time</th>
                <th className="px-4 py-3 text-left">Reading</th>
                <th className="px-4 py-3 text-left">Pulse</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Notes</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {readings.map((reading, index) => {
                const { category, color } = getBPCategory(reading.systolic, reading.diastolic);
                return (
                  <tr key={reading.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 border-b border-gray-200">
                      {format(new Date(reading.measuredAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 font-medium">
                      {reading.systolic}/{reading.diastolic}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      {reading.pulse || '-'}
                    </td>
                    <td className={`px-4 py-3 border-b border-gray-200 font-medium ${color}`}>
                      {category}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 max-w-xs truncate">
                      {reading.notes || '-'}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <button
                        onClick={() => {
                          setCurrentReading(reading);
                          setShowEditModal(true);
                        }}
                        className="text-blue-700 hover:text-blue-900 mr-3 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this reading?')) {
                            try {
                              const response = await fetch(`/api/readings/${reading.id}`, {
                                method: 'DELETE',
                              });
                              
                              if (response.ok) {
                                setReadings(readings.filter(r => r.id !== reading.id));
                              } else {
                                alert('Failed to delete reading');
                              }
                            } catch (error) {
                              console.error('Error deleting reading:', error);
                              alert('Failed to delete reading');
                            }
                          }
                        }}
                        className="text-red-700 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && <AddReadingModal onClose={() => setShowAddModal(false)} onSave={handleAddReading} />}
      
      {/* Edit Modal */}
      {showEditModal && currentReading && (
        <EditReadingModal 
          reading={currentReading} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleUpdateReading} 
        />
      )}
    </main>
  );
}