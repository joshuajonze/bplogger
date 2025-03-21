'use client';

import { format } from 'date-fns';
import { useState } from 'react';

interface BPReading {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  notes: string | null;
  createdAt: string;
  measuredAt: string;
}

interface HistoryTabProps {
  readings: BPReading[];
  loading: boolean;
  getBPCategory: (systolic: number, diastolic: number) => string;
  onRefresh: () => void;
}

export default function HistoryTab({ readings, loading, getBPCategory, onRefresh }: HistoryTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const getCategoryColorClass = (category: string) => {
    switch(category) {
      case 'Normal': return 'text-green-400';
      case 'Elevated': return 'text-yellow-400';
      case 'Stage 1': return 'text-orange-400';
      case 'Stage 2': return 'text-red-400';
      case 'Crisis': return 'text-red-600 font-bold';
      default: return 'text-gray-400';
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/readings/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        onRefresh();
      } else {
        throw new Error('Failed to delete reading');
      }
    } catch (error) {
      console.error('Error deleting reading:', error);
      alert('Failed to delete reading');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch(e) {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch(e) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading readings...</p>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">No readings recorded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="p-4 w-1/6">Date</th>
            <th className="p-4 w-1/6">Time</th>
            <th className="p-4 w-1/6">Systolic</th>
            <th className="p-4 w-1/6">Diastolic</th>
            <th className="p-4 w-1/6">Pulse</th>
            <th className="p-4 w-1/6">Category</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => {
            const category = getBPCategory(reading.systolic, reading.diastolic);
            const categoryColor = getCategoryColorClass(category);
            
            return (
              <tr key={reading.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-4">{formatDate(reading.measuredAt)}</td>
                <td className="p-4">{formatTime(reading.measuredAt)}</td>
                <td className="p-4">{reading.systolic}</td>
                <td className="p-4">{reading.diastolic}</td>
                <td className="p-4">{reading.pulse || '-'}</td>
                <td className={`p-4 ${categoryColor}`}>{category}</td>
                <td className="p-4 text-right">
                  {showDeleteConfirm === reading.id ? (
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={() => handleDelete(reading.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(reading.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}