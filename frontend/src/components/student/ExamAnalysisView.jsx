import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Award, TrendingUp, AlertCircle, FileText, Calendar } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ExamAnalysisView({ studentId }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [studentId]);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/exam/student-exams/${studentId}`);
      setExams(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Yükleniyor...</div>;
  }

  if (exams.length === 0) {
    return (
      <Card className="p-8 text-center gradient-card">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500">Henüz deneme yüklemediniz</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {exams.map((exam, idx) => {
        const upload = exam.upload;
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
          <Card key={idx} className="p-6 gradient-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{upload.exam_name}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(upload.exam_date).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div className="text-right">
                {upload.file_type === 'manual' ? (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Manuel Giriş
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    AI Analiz
                  </span>
                )}
              </div>
            </div>

            {analysis && (
              <>
                {/* Toplam Net */}
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 mb-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Toplam Net</p>
                      <p className="text-3xl font-bold text-green-600">{analysis.total_net}</p>
                    </div>
                  </div>
                </Card>

                {/* Ders Netleri */}
                {subjects.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Ders Bazlı Sonuçlar
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {subjects.map((subject, sidx) => (
                        <Card key={sidx} className="p-3 bg-white">
                          <p className="text-sm font-semibold text-gray-800">{subject.name}</p>
                          <p className="text-xl font-bold text-indigo-600">
                            {subject.net || (subject.correct - subject.wrong / 4).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">
                            D:{subject.correct} Y:{subject.wrong} B:{subject.blank}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zayıf Konular */}
                {weakTopics.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Dikkat Edilmesi Gereken Konular
                    </h4>
                    <div className="space-y-2">
                      {weakTopics.map((topic, tidx) => (
                        <div
                          key={tidx}
                          className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Öneriler */}
                {analysis.recommendations && (
                  <Card className="p-4 bg-blue-50 border-2 border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-2">📚 Çalışma Önerileri</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {analysis.recommendations}
                    </p>
                  </Card>
                )}
              </>
            )}

            {/* Analiz durumu */}
            {upload.analysis_status === 'pending' && (
              <p className="text-sm text-amber-600">⏳ Analiz yapılıyor...</p>
            )}
            {upload.analysis_status === 'failed' && (
              <p className="text-sm text-red-600">❌ Analiz başarısız oldu</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
