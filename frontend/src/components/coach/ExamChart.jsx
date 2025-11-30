import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ExamChart({ exams }) {
  if (!exams || exams.length === 0) {
    return null;
  }

  // Group exams by date and subject
  const groupedData = {};
  
  exams.forEach(exam => {
    const dateKey = exam.tarih;
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = { date: dateKey };
    }
    groupedData[dateKey][exam.ders] = exam.net;
  });

  const chartData = Object.values(groupedData).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Get unique subjects for lines
  const subjects = [...new Set(exams.map(e => e.ders))];
  
  // Colors for different subjects
  const colors = [
    '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', 
    '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
  ];

  return (
    <Card className="p-6 gradient-card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Net Gelişim Grafiği</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR')}
            formatter={(value) => [value.toFixed(2), 'Net']}
          />
          <Legend />
          {subjects.map((subject, index) => (
            <Line
              key={subject}
              type="monotone"
              dataKey={subject}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
