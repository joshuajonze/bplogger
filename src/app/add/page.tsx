'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

interface FormData {
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
  measuredAt: string;
}

export default function AddReadingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      measuredAt: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
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

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error creating reading:', error);
      alert('Failed to save reading. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Blood Pressure Reading</h1>
      
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
            {isSubmitting ? 'Saving...' : 'Save Reading'}
          </button>
          
          <Link href="/" className="px-4 py-2 border border-gray-300 rounded">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}