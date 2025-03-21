'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import HistoryTab from './components/HistoryTab';
import TrendsTab from './components/TrendsTab';

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
  const [activeTab, setActiveTab] = useState('history');
  
  // Form state
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [notes, setNotes] = useState('');

  // Latest reading
  const [latestReading, setLatestReading] = useState<BPReading | null>(null);

  useEffect(() => {
    fetchReadings();
  }, []);

  async function fetchReadings() {
    try {
      setLoading(true);
      const response = await fetch('/api/readings?limit=20');
      if (!response.ok) {
        throw new Error('Failed to fetch readings');
      }
      const data = await response.json();
      setReadings(data);
      
      // Set latest reading if available
      if (data.length > 0) {
        setLatestReading(data[0]);
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
    }
  }

  // Function to determine BP category
  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return 'Normal';
    if ((systolic >= 120 && systolic <= 129) && diastolic < 80) return 'Elevated';
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return 'Stage 1';
    if (systolic >= 140 || diastolic >= 90) return 'Stage 2';
    if (systolic > 180 || diastolic > 120) return 'Crisis';
    return 'Unknown';
  };

  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!systolic || !diastolic) {
      alert('Systolic and diastolic values are required');
      return;
    }
    
    const systolicValue = parseInt(systolic);
    const diastolicValue = parseInt(diastolic);
    
    // Validate numbers
    if (isNaN(systolicValue) || isNaN(diastolicValue)) {
      alert('Please enter valid numbers for blood pressure readings');
      return;
    }
    
    // Create timestamp from date and time
    const measuredAt = new Date(`${date}T${time}`).toISOString();
    
    const newReading = {
      systolic: systolicValue,
      diastolic: diastolicValue,
      pulse: pulse ? parseInt(pulse) : null,
      notes: notes || null,
      measuredAt,
      category: getBPCategory(systolicValue, diastolicValue)
    };
    
    try {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReading),
      });

      if (!response.ok) {
        throw new Error('Failed to save reading');
      }

      // Remove the unused variable
      await response.json();
      
      // Reset form
      setSystolic('');
      setDiastolic('');
      setPulse('');
      setNotes('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setTime(format(new Date(), 'HH:mm'));
      
      // Refresh readings
      fetchReadings();
    } catch (error) {
      console.error('Error saving reading:', error);
      alert('Failed to save reading. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Blood Pressure Tracker</h1>
            <p className="text-gray-400 text-sm sm:text-base">Track and monitor your blood pressure readings over time</p>
          </div>
          <button className="p-2 bg-gray-800 rounded-full self-end sm:self-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <circle cx="12" cy="12" r="5"></circle>
              <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
            </svg>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Add New Reading Panel */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Add New Reading</h2>
            <p className="text-gray-400 text-sm mb-4">Record your latest blood pressure measurement</p>
            
            <form onSubmit={handleSaveReading} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="systolic" className="block mb-1 sm:mb-2 text-sm">Systolic (mmHg)</label>
                  <input 
                    type="number" 
                    id="systolic" 
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-base" 
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="120"
                  />
                </div>
                <div>
                  <label htmlFor="diastolic" className="block mb-1 sm:mb-2 text-sm">Diastolic (mmHg)</label>
                  <input 
                    type="number" 
                    id="diastolic" 
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-base" 
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="80"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="pulse" className="block mb-1 sm:mb-2 text-sm">Pulse (bpm)</label>
                <input 
                  type="number" 
                  id="pulse" 
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-base" 
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  placeholder="72"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block mb-1 sm:mb-2 text-sm">Date</label>
                  <input 
                    type="date" 
                    id="date" 
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-base" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block mb-1 sm:mb-2 text-sm">Time</label>
                  <input 
                    type="time" 
                    id="time" 
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-base" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="notes" className="block mb-1 sm:mb-2 text-sm">Notes (optional)</label>
                <textarea 
                  id="notes" 
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-20 sm:h-24 text-base" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded hover:bg-blue-700 transition text-base"
              >
                Save Reading
              </button>
            </form>
          </div>
          
          {/* Latest Reading Panel */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Latest Reading</h2>
            <p className="text-gray-400 text-sm mb-4">Your most recent blood pressure measurement</p>
            
            {latestReading ? (
              <div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Systolic</p>
                    <p className="text-xl sm:text-2xl font-bold">{latestReading.systolic} <span className="text-xs text-gray-400">mmHg</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Diastolic</p>
                    <p className="text-xl sm:text-2xl font-bold">{latestReading.diastolic} <span className="text-xs text-gray-400">mmHg</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Pulse</p>
                    <p className="text-xl sm:text-2xl font-bold">{latestReading.pulse || '-'} <span className="text-xs text-gray-400">bpm</span></p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-400 text-xs sm:text-sm">Category</p>
                  <p className="text-lg sm:text-xl font-medium">{getBPCategory(latestReading.systolic, latestReading.diastolic)}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-400 text-xs sm:text-sm">Date & Time</p>
                  <p className="text-base sm:text-lg">{format(new Date(latestReading.measuredAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
                
                {latestReading.notes && (
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Notes</p>
                    <p className="text-gray-200 text-sm sm:text-base">{latestReading.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No readings recorded yet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Tabs for History and Trends */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 py-2 sm:py-3 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === 'history' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
            <button
              className={`flex-1 py-2 sm:py-3 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === 'trends' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('trends')}
            >
              Trends
            </button>
          </div>
          
          <div className="p-0">
            {activeTab === 'history' ? (
              <HistoryTab 
                readings={readings} 
                loading={loading} 
                getBPCategory={getBPCategory}
                onRefresh={fetchReadings}
              />
            ) : (
              <TrendsTab readings={readings} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}