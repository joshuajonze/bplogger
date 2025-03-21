'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface BPReading {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  notes: string | null;
  createdAt: string;
  measuredAt: string;
}

interface FormData {
    systolic: number;
    diastolic: number;
    pulse?: number; // Use undefined instead of null for optional form fields
    notes?: string; // Use undefined instead of null for optional form fields
    measuredAt: string;
  }

interface EditReadingModalProps {
  reading: BPReading;
  onClose: () => void;
  onSave: (data: BPReading) => Promise<void>;
}

export default function EditReadingModal({ reading, onClose, onSave }: EditReadingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  useEffect(() => {
    // Format the date for the datetime-local input
    const measuredAt = new Date(reading.measuredAt)
      .toISOString()
      .slice(0, 16); // Format: YYYY-MM-DDThh:mm
    
    // Convert null values to undefined for react-hook-form
    reset({
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      pulse: reading.pulse === null ? undefined : reading.pulse,
      notes: reading.notes === null ? undefined : reading.notes,
      measuredAt,
    });
  }, [reading, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSave({
        ...data,
        id: reading.id,
        createdAt: reading.createdAt,
      } as BPReading);
    } catch (error) {
      console.error('Error updating reading:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Blood Pressure Reading</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Systolic (upper)</label>
              <input
                type="number"
                {...register('systolic', { 
                  required: 'Systolic value is required',
                  min: { value: 70, message: 'Value seems too low' },
                  max: { value: 250, message: 'Value seems too high' }
                })}
                className="w-full px-3 py-2 border rounded"
                placeholder="120"
              />
              {errors.systolic && <p className="text-red-600 text-sm mt-1">{errors.systolic.message}</p>}
            </div>
            
            <div className="flex-1">
              <label className="block mb-1 font-medium">Diastolic (lower)</label>
              <input
                type="number"
                {...register('diastolic', { 
                  required: 'Diastolic value is required',
                  min: { value: 40, message: 'Value seems too low' },
                  max: { value: 150, message: 'Value seems too high' }
                })}
                className="w-full px-3 py-2 border rounded"
                placeholder="80"
              />
              {errors.diastolic && <p className="text-red-600 text-sm mt-1">{errors.diastolic.message}</p>}
            </div>
            
            <div className="flex-1">
              <label className="block mb-1 font-medium">Pulse (optional)</label>
              <input
                type="number"
                {...register('pulse', { 
                  min: { value: 40, message: 'Value seems too low' },
                  max: { value: 200, message: 'Value seems too high' }
                })}
                className="w-full px-3 py-2 border rounded"
                placeholder="75"
              />
              {errors.pulse && <p className="text-red-600 text-sm mt-1">{errors.pulse.message}</p>}
            </div>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Date & Time</label>
            <input
              type="datetime-local"
              {...register('measuredAt', { required: 'Date and time are required' })}
              className="w-full px-3 py-2 border rounded"
            />
            {errors.measuredAt && <p className="text-red-600 text-sm mt-1">{errors.measuredAt.message}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border rounded"
              placeholder="Any additional information about this reading..."
            />
          </div>
          
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Saving...' : 'Update Reading'}
            </button>
            
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 border border-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}