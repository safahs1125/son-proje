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

      {/* Detay Modalı */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Deneme Detayları</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetailModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedExam && (() => {
            const upload = selectedExam.upload;
            const student = selectedExam.student;
            const analysis = selectedExam.analysis;

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
              <div className="space-y-6 mt-4">
                {/* Öğrenci ve Deneme Bilgisi */}
                <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                      {student ? student.ad[0] : '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{upload.exam_name}</h3>
                      <p className="text-gray-600 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {student ? `${student.ad} ${student.soyad || ''}`.trim() : 'Bilinmeyen Öğrenci'}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(upload.exam_date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </Card>

                {analysis ? (
                  <>
                    {/* Toplam Net */}
                    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                      <div className="flex items-center gap-4">
                        <Award className="w-12 h-12 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Toplam Net</p>
                          <p className="text-4xl font-bold text-green-600">{analysis.total_net}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Ders Netleri */}
                    {subjects.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Ders Bazlı Sonuçlar
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {subjects.map((subject, sidx) => (
                            <Card key={sidx} className="p-4 bg-white shadow-sm">
                              <p className="text-sm font-semibold text-gray-800 mb-1">{subject.name}</p>
                              <p className="text-2xl font-bold text-indigo-600">
                                {subject.net || (subject.correct - subject.wrong / 4).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                D:{subject.correct} Y:{subject.wrong} B:{subject.blank || 0}
                              </p>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Zayıf Konular */}
                    {weakTopics.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          Zayıf Konular
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {weakTopics.map((topic, tidx) => (
                            <span
                              key={tidx}
                              className="px-3 py-2 bg-red-50 border border-red-200 rounded-full text-sm text-red-700"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Önerileri */}
                    {analysis.recommendations && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          AI Önerileri
                        </h4>
                        <Card className="p-4 bg-blue-50 border border-blue-200">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{analysis.recommendations}</p>
                        </Card>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 bg-amber-50 border-2 border-amber-300 rounded-lg text-center">
                    <p className="text-amber-700 mb-4 font-semibold">
                      ⏳ Bu deneme henüz analiz edilmedi
                    </p>
                    <Button
                      onClick={() => {
                        triggerAnalysis(upload.id);
                        setDetailModalOpen(false);
                      }}
                      disabled={analyzingId === upload.id}
                      className="bg-gradient-to-r from-purple-500 to-pink-600"
                    >
                      {analyzingId === upload.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          AI Analiz Ediliyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Analiz Yap
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
