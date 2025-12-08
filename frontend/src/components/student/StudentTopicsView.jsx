import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function StudentTopicsView({ studentId }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

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
    const sinavKey = topic.sinav_turu || 'TYT';
    if (!acc[sinavKey]) acc[sinavKey] = {};
    if (!acc[sinavKey][topic.ders]) acc[sinavKey][topic.ders] = [];
    acc[sinavKey][topic.ders].push(topic);
    return acc;
  }, {});

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getProgress = () => {
    if (topics.length === 0) return 0;
    const completed = topics.filter(t => t.durum === 'tamamlandi').length;
    return Math.round((completed / topics.length) * 100);
  };

  const updateTopicStatus = async (topicId, currentStatus) => {
    // Durum sırası: baslanmadi -> devam -> tamamlandi -> baslanmadi
    let newStatus;
    if (currentStatus === 'baslanmadi') {
      newStatus = 'devam';
    } else if (currentStatus === 'devam') {
      newStatus = 'tamamlandi';
    } else {
      newStatus = 'baslanmadi';
    }

    try {
      await axios.put(`${BACKEND_URL}/api/topics/${topicId}`, {
        durum: newStatus
      });
      
      // Listeyi güncelle
      setTopics(prevTopics =>
        prevTopics.map(topic =>
          topic.id === topicId ? { ...topic, durum: newStatus } : topic
        )
      );
      
      toast.success('Konu durumu güncellendi');
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const getStatusBadge = (topic) => {
    const durum = topic.durum;
    let buttonClass = '';
    let text = '';
    
    switch (durum) {
      case 'baslanmadi':
        buttonClass = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
        text = 'Başlanmadı';
        break;
      case 'devam':
        buttonClass = 'bg-amber-200 text-amber-800 hover:bg-amber-300';
        text = 'Devam Ediyor';
        break;
      case 'tamamlandi':
        buttonClass = 'bg-green-200 text-green-800 hover:bg-green-300';
        text = 'Tamamlandı';
        break;
      default:
        buttonClass = 'bg-gray-200 text-gray-700';
        text = 'Başlanmadı';
    }
    
    return (
      <button
        onClick={() => updateTopicStatus(topic.id, durum)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${buttonClass}`}
      >
        {text}
      </button>
    );
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

      {/* Topics by Exam Type and Subject - COLLAPSIBLE */}
      <div className="space-y-8">
        {Object.entries(groupedTopics).map(([sinavType, dersGroups]) => (
          <div key={sinavType} className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className={`px-4 py-2 rounded-lg mr-3 ${sinavType === 'TYT' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : 'bg-gradient-to-r from-violet-500 to-purple-600'} text-white`}>
                {sinavType}
              </span>
            </h2>
            <div className="space-y-3">
              {Object.entries(dersGroups).map(([ders, dersTopics]) => {
                const sectionKey = `${sinavType}-${ders}`;
                const isExpanded = expandedSections[sectionKey];
                
                return (
                  <Card key={sectionKey} className="overflow-hidden gradient-card">
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                        <h3 className="text-lg font-bold text-gray-800">{ders}</h3>
                        <span className="text-sm text-gray-500">({dersTopics.length} konu)</span>
                      </div>
                      <div className="text-sm font-medium text-amber-600">
                        {dersTopics.filter(t => t.durum === 'tamamlandi').length}/{dersTopics.length} tamamlandı
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="p-4 pt-0 space-y-2 border-t">
                        {dersTopics.map((topic) => (
                          <div
                            key={topic.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                          >
                            <p className="font-medium text-gray-800">{topic.konu}</p>
                            {getStatusBadge(topic.durum)}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
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
