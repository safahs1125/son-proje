import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Calendar, User, FileText, TrendingUp, AlertCircle, Sparkles, Loader2, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function CoachExamOverview() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/exam/coach-overview`);
      setExams(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async (uploadId) => {
    setAnalyzingId(uploadId);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/exam/trigger-analysis/${uploadId}`);
      
      if (response.data.success) {
        toast.success('AI analizi tamamlandı!');
        fetchExams(); // Listeyi yenile
      }
    } catch (error) {
      toast.error('Analiz hatası: ' + error.message);
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Yükleniyor...</div>;
  }

  if (exams.length === 0) {
    return (
      <Card className="p-8 text-center gradient-card">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500">Henüz deneme yüklemesi yapılmamış</p>
      </Card>
    );
  }

  const openDetailModal = (exam) => {
    setSelectedExam(exam);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300">
        <h2 className="text-xl font-bold text-gray-800">Öğrenci Deneme Analizleri</h2>
        <p className="text-sm text-gray-600">Tüm öğrencilerin yüklediği denemeler ve AI analizleri</p>
      </Card>

      {/* Liste Görünümü */}
      {exams.map((exam, idx) => {
        const upload = exam.upload;
        const student = exam.student;
        const analysis = exam.analysis;

        // Subject breakdown parse
        let subjects = [];
        let weakTopics = [];
        try {
          if (analysis && analysis.subject_breakdown) {
            subjects = JSON.parse(analysis.subject_breakdown);
          }
          if (analysis && analysis.weak_topics) {
            weakTopics = JSON.parse(analysis.weak_topics);
          }
        } catch (e) {
          console.error('Parse error:', e);
        }

        return (
          <Card key={idx} className="p-4 gradient-card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              {/* Öğrenci ve Deneme Bilgisi */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {student ? student.ad[0] : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{upload.exam_name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {student ? `${student.ad} ${student.soyad || ''}`.trim() : 'Bilinmeyen'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(upload.exam_date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Skoru */}
              {analysis && (
                <div className="text-center px-4">
                  <p className="text-xs text-gray-600">Net</p>
                  <p className="text-2xl font-bold text-green-600">{analysis.total_net}</p>
                </div>
              )}

              {/* Durum Badge */}
              <div className="flex flex-col items-end gap-2">
                {upload.analysis_status === 'pending' ? (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
                    Analiz Bekliyor
                  </span>
                ) : upload.analysis_status === 'completed' ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                    ✓ Tamamlandı
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                    Hata
                  </span>
                )}
                {upload.file_type === 'manual' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Manuel
                  </span>
                )}
              </div>

              {/* Detay Butonu */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDetailModal(exam)}
                className="ml-3"
              >
                <Eye className="w-4 h-4 mr-1" />
                Detay
              </Button>
            </div>

          </Card>
        );
      })}
    </div>
  );
}
