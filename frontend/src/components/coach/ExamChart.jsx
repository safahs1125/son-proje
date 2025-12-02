import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ExamChart({ exams }) {
  if (!exams || exams.length === 0) {
    return null;
  }

  // 1. Toplam Net Grafiği - Tarih bazlı toplam net
  const totalNetData = {};
  exams.forEach(exam => {
    const dateKey = exam.tarih;
    if (!totalNetData[dateKey]) {
      totalNetData[dateKey] = { date: dateKey, toplamNet: 0 };
    }
    totalNetData[dateKey].toplamNet += exam.net;
  });

  const totalChartData = Object.values(totalNetData).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // 2. Ders Bazlı Net Grafiği
  const subjectData = {};
  exams.forEach(exam => {
    const dateKey = exam.tarih;
    if (!subjectData[dateKey]) {
      subjectData[dateKey] = { date: dateKey };
    }
    subjectData[dateKey][exam.ders] = exam.net;
  });

  const subjectChartData = Object.values(subjectData).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Get unique subjects
  const subjects = [...new Set(exams.map(e => e.ders))];
  
  // Professional colors for subjects
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f97316', 
    '#10b981', '#06b6d4', '#eab308', '#ef4444'
  ];

  return (
    <div className="space-y-6">
      {/* Toplam Net Grafiği */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Toplam Net Gelişimi</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={totalChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              stroke="#6b7280"
            />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              formatter={(value) => [value.toFixed(1) + ' Net', 'Toplam']}
              contentStyle={{ backgroundColor: '#fff', border: '2px solid #6366f1', borderRadius: '8px' }}
            />
            <Bar 
              dataKey="toplamNet" 
              fill="#6366f1" 
              radius={[8, 8, 0, 0]}
              name="Toplam Net"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Ders Bazlı Net Grafiği */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-white shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Ders Bazlı Net Gelişimi</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={subjectChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              stroke="#6b7280"
            />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              formatter={(value) => [value.toFixed(1) + ' Net', '']}
              contentStyle={{ backgroundColor: '#fff', border: '2px solid #8b5cf6', borderRadius: '8px' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            {subjects.map((subject, index) => (
              <Bar
                key={subject}
                dataKey={subject}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
                name={subject}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
