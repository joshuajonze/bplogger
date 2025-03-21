'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

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

export default function TrendsTab({ readings }: TrendsTabProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    prepareChartData();
  }, [readings, timeRange]);

  const prepareChartData = () => {
    if (readings.length === 0) {
      setChartData([]);
      return;
    }

    // Sort readings by date
    const sortedReadings = [...readings].sort((a, b) => 
      new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );

    // Filter by time range
    let filteredReadings = sortedReadings;
    const today = new Date();
    
    if (timeRange === 'week') {
      const weekAgo = subDays(today, 7);
      filteredReadings = sortedReadings.filter(reading => 
        new Date(reading.measuredAt) >= weekAgo
      );
    } else if (timeRange === 'month') {
      const monthAgo = subDays(today, 30);
      filteredReadings = sortedReadings.filter(reading => 
        new Date(reading.measuredAt) >= monthAgo
      );
    } else if (timeRange === 'year') {
      const yearAgo = subDays(today, 365);
      filteredReadings = sortedReadings.filter(reading => 
        new Date(reading.measuredAt) >= yearAgo
      );
    }

    // Format data for the chart
    const formattedData = filteredReadings.map(reading => ({
      date: format(new Date(reading.measuredAt), 'MMM dd'),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      pulse: reading.pulse || 0,
      fullDate: reading.measuredAt,
    }));

    setChartData(formattedData);
  };

  if (readings.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">No readings available to show trends</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Blood Pressure Trends</h3>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded ${
              timeRange === 'week' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 rounded ${
              timeRange === 'month' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={`px-3 py-1 rounded ${
              timeRange === 'year' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="date" 
                stroke="#aaa"
                tick={{ fill: '#aaa' }}
              />
              <YAxis stroke="#aaa" tick={{ fill: '#aaa' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value, name) => {
                  const unit = typeof name === 'string' && name === 'pulse' ? 'bpm' : 'mmHg';
                  const formattedName = typeof name === 'string' 
                    ? name.charAt(0).toUpperCase() + name.slice(1)
                    : String(name);
                  return [`${value} ${unit}`, formattedName];
                }}
                labelFormatter={(label, items) => {
                  const item = items[0];
                  if (item && item.payload.fullDate) {
                    return format(new Date(item.payload.fullDate), 'MMM d, yyyy h:mm a');
                  }
                  return label;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#ff5252" 
                name="Systolic"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#4caf50" 
                name="Diastolic" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="pulse" 
                stroke="#2196f3" 
                name="Pulse" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">No data available for the selected time range</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Systolic" 
            readings={chartData.map(d => d.systolic)} 
            unit="mmHg"
          />
          <StatCard 
            title="Diastolic" 
            readings={chartData.map(d => d.diastolic)} 
            unit="mmHg"
          />
          <StatCard 
            title="Pulse" 
            readings={chartData.map(d => d.pulse).filter(p => p > 0)} 
            unit="bpm"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  readings: number[];
  unit: string;
}

function StatCard({ title, readings, unit }: StatCardProps) {
  if (readings.length === 0) {
    return (
      <div className="bg-gray-700 p-4 rounded-lg">
        <h4 className="text-lg font-medium mb-2">{title}</h4>
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  const average = Math.round(readings.reduce((sum, val) => sum + val, 0) / readings.length);
  const max = Math.max(...readings);
  const min = Math.min(...readings);
  
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h4 className="text-lg font-medium mb-2">{title}</h4>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-gray-400 text-sm">Average</p>
          <p className="text-xl font-medium">{average}</p>
          <p className="text-gray-400 text-xs">{unit}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Min</p>
          <p className="text-xl font-medium">{min}</p>
          <p className="text-gray-400 text-xs">{unit}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Max</p>
          <p className="text-xl font-medium">{max}</p>
          <p className="text-gray-400 text-xs">{unit}</p>
        </div>
      </div>
    </div>
  );
}