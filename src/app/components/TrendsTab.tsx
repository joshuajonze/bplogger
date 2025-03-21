import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

interface TrendsTabProps {
  readings: BPReading[];
}

// Define chart data type
interface ChartDataPoint {
  date: string;
  dateObj: Date;
  systolic: number;
  diastolic: number;
  pulse: number;
}

const TrendsTab: React.FC<TrendsTabProps> = ({ readings }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (readings.length > 0) {
      // Move the function inside useEffect to avoid the dependency warning
      const prepareChartData = () => {
        // Sort readings by date
        const sortedReadings = [...readings].sort((a, b) => 
          new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
        );
        
        // Process readings data for the chart
        return sortedReadings.map(reading => ({
          date: format(new Date(reading.measuredAt), 'MMM d'),
          dateObj: new Date(reading.measuredAt),
          systolic: reading.systolic,
          diastolic: reading.diastolic,
          pulse: reading.pulse || 0
        }));
      };
      
      const data = prepareChartData();
      setChartData(data);
    }
  }, [readings]); // Now we only need readings as a dependency

  // Alternative solution using useCallback (commented out)
  /*
  const prepareChartData = useCallback(() => {
    if (readings.length === 0) return [];
    
    // Sort readings by date
    const sortedReadings = [...readings].sort((a, b) => 
      new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );
    
    // Process readings data for the chart
    return sortedReadings.map(reading => ({
      date: format(new Date(reading.measuredAt), 'MMM d'),
      dateObj: new Date(reading.measuredAt),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      pulse: reading.pulse || 0
    }));
  }, [readings]);

  useEffect(() => {
    if (readings.length > 0) {
      const data = prepareChartData();
      setChartData(data);
    }
  }, [readings, prepareChartData]);
  */

  return (
    <div className="p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-medium mb-4">Blood Pressure Trends</h3>
      
      {readings.length > 0 ? (
        <div className="h-64 sm:h-80 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis 
                dataKey="date" 
                stroke="#ccc"
                fontSize={12}
              />
              <YAxis stroke="#ccc" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                labelStyle={{ color: '#ccc' }}
              />
              <Legend wrapperStyle={{ color: '#ccc' }} />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#ef4444" 
                activeDot={{ r: 8 }} 
                name="Systolic"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#3b82f6" 
                name="Diastolic"
                strokeWidth={2}
              />
              {chartData.some(item => item.pulse > 0) && (
                <Line 
                  type="monotone" 
                  dataKey="pulse" 
                  stroke="#10b981" 
                  name="Pulse"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400">No data available to display trends</p>
          <p className="text-gray-500 text-sm mt-2">Add readings to see your blood pressure trends over time</p>
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="text-base sm:text-lg font-medium mb-3">Insights</h4>
        {readings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Average readings card */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-300 mb-2">Average Readings</h5>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-400">Systolic</p>
                  <p className="text-xl font-bold">
                    {Math.round(
                      readings.reduce((sum, reading) => sum + reading.systolic, 0) / readings.length
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Diastolic</p>
                  <p className="text-xl font-bold">
                    {Math.round(
                      readings.reduce((sum, reading) => sum + reading.diastolic, 0) / readings.length
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Pulse</p>
                  <p className="text-xl font-bold">
                    {readings.some(r => r.pulse) 
                      ? Math.round(
                          readings.reduce((sum, reading) => sum + (reading.pulse || 0), 0) / 
                          readings.filter(r => r.pulse).length
                        )
                      : '-'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* Trends summary card */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-300 mb-2">Trends Summary</h5>
              <p className="text-sm text-gray-200">
                {readings.length < 3 
                  ? "Add more readings to see trend analysis" 
                  : "Your blood pressure has been relatively stable over this period."}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Record multiple readings to see insights</p>
        )}
      </div>
    </div>
  );
};

export default TrendsTab;