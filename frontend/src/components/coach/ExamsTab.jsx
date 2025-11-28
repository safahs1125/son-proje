import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TYT_SUBJECTS = [
  { name: 'Türkçe', max: 40 },
  { name: 'Matematik', max: 40 },
  { name: 'Sosyal', max: 20 },
  { name: 'Fizik', max: 7 },
  { name: 'Kimya', max: 7 },
  { name: 'Biyoloji', max: 6 }
];

const AYT_SAYISAL = [
  { name: 'Matematik', max: 40 },
  { name: 'Fizik', max: 14 },
  { name: 'Kimya', max: 13 },
  { name: 'Biyoloji', max: 13 }
];

const AYT_ESIT_AGIRLIK = [
  { name: 'Matematik', max: 40 },
  { name: 'Edebiyat', max: 24 },
  { name: 'Tarih-1', max: 10 },
  { name: 'Coğrafya-1', max: 6 }
];

const AYT_SOZEL = [
  { name: 'Edebiyat', max: 24 },
  { name: 'Tarih-1', max: 10 },
  { name: 'Coğrafya-1', max: 6 },
  { name: 'Tarih-2', max: 11 },
  { name: 'Coğrafya-2', max: 11 },
  { name: 'Felsefe', max: 12 },
  { name: 'Din', max: 6 }
];

export default function ExamsTab({ studentId }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [examType, setExamType] = useState('TYT');
  const [examDate, setExamDate] = useState('');
  const [examData, setExamData] = useState({});

  useEffect(() => {
    fetchExams();
  }, [studentId]);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/exams/${studentId}`);
      setExams(response.data);
    } catch (error) {
      toast.error('Denemeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectsForType = () => {
    if (examType === 'TYT') return TYT_SUBJECTS;
    // For AYT, we'll use SAYıSAL as default, but in real app you'd get student's bolum
    return AYT_SAYISAL;
  };

  const handleAddExam = async () => {
    if (!examDate) {
      toast.error('Lütfen tarih seçin');
      return;
    }

    try {
      const subjects = getSubjectsForType();
      for (const subject of subjects) {
        const dogru = parseInt(examData[`${subject.name}_dogru`] || 0);
        const yanlis = parseInt(examData[`${subject.name}_yanlis`] || 0);
        
        await axios.post(`${BACKEND_URL}/api/exams`, {
          student_id: studentId,
          tarih: examDate,
          sinav_tipi: examType,
          ders: subject.name,
          dogru,
          yanlis
        });
      }
      toast.success('Deneme eklendi');
      setOpenDialog(false);
      setExamData({});
      setExamDate('');
      fetchExams();
    } catch (error) {
      toast.error('Deneme eklenemedi');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Bu denemeyi silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/exams/${examId}`);
      toast.success('Deneme silindi');
      fetchExams();
    } catch (error) {
      toast.error('Deneme silinemedi');
    }
  };

  const groupExamsByDate = () => {
    const grouped = {};
    exams.forEach(exam => {
      const key = `${exam.tarih}_${exam.sinav_tipi}`;
      if (!grouped[key]) grouped[key] = { date: exam.tarih, type: exam.sinav_tipi, subjects: [] };
      grouped[key].subjects.push(exam);
    });
    return Object.values(grouped);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Exam Button */}
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-exam-button" className="bg-gradient-to-r from-violet-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Deneme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Deneme Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tarih</label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    data-testid="exam-date-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sınav Tipi</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    data-testid="exam-type-select"
                  >
                    <option value="TYT">TYT</option>
                    <option value="AYT">AYT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Soru Sayıları</h4>
                {getSubjectsForType().map(subject => (
                  <Card key={subject.name} className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-xs text-gray-500">Maks: {subject.max}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1">Doğru</label>
                        <Input
                          type="number"
                          min="0"
                          max={subject.max}
                          value={examData[`${subject.name}_dogru`] || ''}
                          onChange={(e) => setExamData({ ...examData, [`${subject.name}_dogru`]: e.target.value })}
                          placeholder="0"
                          data-testid={`exam-${subject.name}-dogru`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Yanlış</label>
                        <Input
                          type="number"
                          min="0"
                          max={subject.max}
                          value={examData[`${subject.name}_yanlis`] || ''}
                          onChange={(e) => setExamData({ ...examData, [`${subject.name}_yanlis`]: e.target.value })}
                          placeholder="0"
                          data-testid={`exam-${subject.name}-yanlis`}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button onClick={handleAddExam} className="w-full" data-testid="create-exam-button">
                Deneme Ekle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exams List */}
      {groupExamsByDate().length === 0 ? (
        <Card className="p-12 text-center gradient-card">
          <p className="text-gray-500">Henüz deneme eklenmemiş</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupExamsByDate().map((exam, idx) => {
            const totalNet = exam.subjects.reduce((sum, s) => sum + s.net, 0);
            return (
              <Card key={idx} className="p-6 gradient-card" data-testid={`exam-card-${idx}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{exam.type} Denemesi</h3>
                    <p className="text-sm text-gray-600">{new Date(exam.date).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Toplam Net</p>
                    <p className="text-3xl font-bold text-violet-600">{totalNet.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {exam.subjects.map((subject) => (
                    <div key={subject.id} className="p-3 bg-white rounded-lg shadow-sm">
                      <p className="font-medium text-gray-800 mb-2">{subject.ders}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">D: {subject.dogru}</span>
                        <span className="text-red-600">Y: {subject.yanlis}</span>
                        <span className="font-bold text-violet-600">Net: {subject.net.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExam(exam.subjects[0].id)}
                    data-testid={`delete-exam-${idx}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500 mr-2" />
                    Sil
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
