import React from 'react';
import { format } from 'date-fns';

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
  onDelete?: (id: number) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ 
  readings, 
  loading, 
  getBPCategory,
  onRefresh,
  onDelete
}) => {
  // Function to get class name based on BP category
  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'Normal':
        return 'bg-green-800 text-green-100';
      case 'Elevated':
        return 'bg-yellow-700 text-yellow-100';
      case 'Stage 1':
        return 'bg-orange-700 text-orange-100';
      case 'Stage 2':
        return 'bg-red-700 text-red-100';
      case 'Crisis':
        return 'bg-purple-700 text-purple-100';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  };

  // Handle delete function
  const handleDelete = (id: number) => {
    if (onDelete) {
      if (window.confirm('Are you sure you want to delete this reading?')) {
        onDelete(id);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-medium">Reading History</h3>
        <button 
          onClick={onRefresh}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition"
          aria-label="Refresh readings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
            <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p className="text-gray-400">Loading readings...</p>
        </div>
      ) : readings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-300">Date & Time</th>
                <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-medium text-gray-300">Reading</th>
                <th className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-300">Pulse</th>
                <th className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-300">Category</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-300">Notes</th>
                {onDelete && (
                  <th className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-300">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {readings.map((reading) => {
                const category = getBPCategory(reading.systolic, reading.diastolic);
                return (
                  <tr key={reading.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                      {format(new Date(reading.measuredAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="p-2 sm:p-3 text-right whitespace-nowrap text-xs sm:text-sm">
                      <span className="font-bold">{reading.systolic}</span>/<span className="font-bold">{reading.diastolic}</span>
                      <span className="text-gray-400 ml-1">mmHg</span>
                    </td>
                    <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                      {reading.pulse ? (
                        <>{reading.pulse} <span className="text-gray-400">bpm</span></>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-2 sm:p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryClass(category)}`}>
                        {category}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-left text-xs sm:text-sm text-gray-300 max-w-xs truncate">
                      {reading.notes || <span className="text-gray-500">-</span>}
                    </td>
                    {onDelete && (
                      <td className="p-2 sm:p-3 text-center">
                        <button 
                          onClick={() => handleDelete(reading.id)}
                          className="text-red-400 hover:text-red-300 transition"
                          aria-label="Delete reading"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No readings found</p>
          <p className="text-gray-500 text-sm mt-2">Add your first blood pressure reading to see your history</p>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;