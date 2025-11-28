import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function StudentTopicsView({ studentId }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, [studentId]);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/topics/${studentId}`);
      setTopics(response.data);
    } catch (error) {
      toast.error('Konular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const groupedTopics = topics.reduce((acc, topic) => {
    if (!acc[topic.ders]) acc[topic.ders] = [];
    acc[topic.ders].push(topic);
    return acc;
  }, {});

  const getProgress = () => {
    if (topics.length === 0) return 0;
    const completed = topics.filter(t => t.durum === 'tamamlandi').length;
    return Math.round((completed / topics.length) * 100);
  };

  const getStatusBadge = (durum) => {
    switch (durum) {
      case 'baslanmadi':
        return <span className="status-badge status-baslanmadi">Başlanmadı</span>;
      case 'devam':
        return <span className="status-badge status-devam">Devam Ediyor</span>;
      case 'tamamlandi':
        return <span className="status-badge status-tamamlandi">Tamamlandı</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card className="p-6 gradient-card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Konu İlerlemen</h3>
            <p className="text-gray-600 mt-1">{topics.filter(t => t.durum === 'tamamlandi').length} / {topics.length} konu tamamlandı</p>
          </div>
          <div className="text-4xl font-bold text-amber-600">{getProgress()}%</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
      </Card>

      {/* Topics by Subject */}
      <div className="space-y-6">
        {Object.entries(groupedTopics).map(([ders, dersTopics]) => (
          <Card key={ders} className="p-6 gradient-card">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full mr-3"></span>
              {ders}
            </h3>
            <div className="space-y-3">
              {dersTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                  data-testid={`student-topic-item-${topic.id}`}
                >
                  <p className="font-medium text-gray-800">{topic.konu}</p>
                  {getStatusBadge(topic.durum)}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {topics.length === 0 && (
        <Card className="p-12 text-center gradient-card">
          <p className="text-gray-500">Henüz konu eklenmemiş</p>
        </Card>
      )}
    </div>
  );
}
