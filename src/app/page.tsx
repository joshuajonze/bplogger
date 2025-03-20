'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

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
    if (systolic < 120 && diastolic < 80) return { category: 'Normal', color: 'text-green-600' };
    if ((systolic >= 120 && systolic <= 129) && diastolic < 80) return { category: 'Elevated', color: 'text-yellow-600' };
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return { category: 'Stage 1', color: 'text-orange-600' };
    if (systolic >= 140 || diastolic >= 90) return { category: 'Stage 2', color: 'text-red-600' };
    if (systolic > 180 || diastolic > 120) return { category: 'Crisis', color: 'text-red-800 font-bold' };
    return { category: 'Unknown', color: 'text-gray-600' };
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Blood Pressure Tracker</h1>
      
      <div className="mb-8">
        <Link 
          href="/add" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Reading
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : readings.length === 0 ? (
        <p>No readings yet. Add your first blood pressure reading.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Date/Time</th>
                <th className="px-4 py-2 border">Reading</th>
                <th className="px-4 py-2 border">Pulse</th>
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Notes</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading) => {
                const { category, color } = getBPCategory(reading.systolic, reading.diastolic);
                return (
                  <tr key={reading.id}>
                    <td className="px-4 py-2 border">
                      {format(new Date(reading.measuredAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-4 py-2 border font-semibold">
                      {reading.systolic}/{reading.diastolic}
                    </td>
                    <td className="px-4 py-2 border">
                      {reading.pulse || '-'}
                    </td>
                    <td className={`px-4 py-2 border ${color}`}>
                      {category}
                    </td>
                    <td className="px-4 py-2 border">
                      {reading.notes || '-'}
                    </td>
                    <td className="px-4 py-2 border">
                      <Link 
                        href={`/edit/${reading.id}`}
                        className="text-blue-600 hover:underline mr-2"
                      >
                        Edit
                      </Link>
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
                        className="text-red-600 hover:underline"
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
    </main>
  );
}