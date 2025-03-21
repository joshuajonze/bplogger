'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  systolic: number;
  diastolic: number;
  pulse: number | null;
  notes: string | null;
  measuredAt: string;
}

interface AddReadingModalProps {
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
}

export default function AddReadingModal({ onClose, onSave }: AddReadingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      measuredAt: (() => {
        // Get current time in Chicago (Central Time)
        const chicagoTime = new Date().toLocaleString("en-US", {
          timeZone: "America/Chicago",
        });
        // Format as YYYY-MM-DDThh:mm for datetime-local input
        return new Date(chicagoTime).toISOString().slice(0, 16);
      })(),
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error('Error saving reading:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
          <h2 className="text-xl font-bold text-gray-800">Add New Blood Pressure Reading</h2>
          <button 
            onClick={onClose} 
            className="text-gray-700 hover:text-red-600 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-2 font-medium text-gray-800">Systolic (upper)</label>
              <input
                type="number"
                {...register('systolic', { 
                  required: 'Systolic value is required',
                  min: { value: 70, message: 'Value seems too low' },
                  max: { value: 250, message: 'Value seems too high' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                placeholder="120"
                style={{ color: '#1a202c' }}
              />
              {errors.systolic && <p className="text-red-600 text-sm mt-1 font-medium">{errors.systolic.message}</p>}
            </div>
            
            <div className="flex-1">
              <label className="block mb-2 font-medium text-gray-800">Diastolic (lower)</label>
              <input
                type="number"
                {...register('diastolic', { 
                  required: 'Diastolic value is required',
                  min: { value: 40, message: 'Value seems too low' },
                  max: { value: 150, message: 'Value seems too high' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                placeholder="80"
                style={{ color: '#1a202c' }}
              />
              {errors.diastolic && <p className="text-red-600 text-sm mt-1 font-medium">{errors.diastolic.message}</p>}
            </div>
            
            <div className="flex-1">
              <label className="block mb-2 font-medium text-gray-800">Pulse (optional)</label>
              <input
                type="number"
                {...register('pulse', { 
                  min: { value: 40, message: 'Value seems too low' },
                  max: { value: 200, message: 'Value seems too high' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="75"
                style={{ color: '#1a202c' }}
              />
              {errors.pulse && <p className="text-red-600 text-sm mt-1 font-medium">{errors.pulse.message}</p>}
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-800">Date & Time</label>
            <input
              type="datetime-local"
              {...register('measuredAt', { required: 'Date and time are required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            {errors.measuredAt && <p className="text-red-600 text-sm mt-1 font-medium">{errors.measuredAt.message}</p>}
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-800">Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-vertical text-gray-900"
              placeholder="Any additional information about this reading..."
              style={{ color: '#1a202c' }}
            />
          </div>
          
          <div className="flex gap-4 pt-3 border-t border-gray-200 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? 'Saving...' : 'Save Reading'}
            </button>
            
            <button 
              type="button"
              onClick={onClose} 
              className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}