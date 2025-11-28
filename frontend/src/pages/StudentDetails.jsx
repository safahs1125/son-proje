import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Brain } from 'lucide-react';
import { toast } from 'sonner';
import TopicsTab from '@/components/coach/TopicsTab';
import TasksTab from '@/components/coach/TasksTab';
import ExamsTab from '@/components/coach/ExamsTab';
import CalendarTab from '@/components/coach/CalendarTab';
import { generatePDF } from '@/lib/pdfGenerator';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function StudentDetails() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('coachToken');
    if (!token) {
      navigate('/coach/login');
      return;
    }
    fetchStudent();
  }, [studentId, refreshKey]);

  const fetchStudent = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/students/${studentId}`);
      setStudent(response.data);
    } catch (error) {
      toast.error('Öğrenci bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      toast.info('PDF oluşturuluyor...');
      await generatePDF(student, studentId);
      toast.success('PDF başarıyla indirildi!');
    } catch (error) {
      toast.error('PDF oluşturulurken hata oluştu');
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Öğrenci bulunamadı</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto page-fade-in">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/coach/dashboard')}
            className="mb-4"
            data-testid="back-to-dashboard-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>

          <Card className="p-6 gradient-card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {student.ad.charAt(0)}{student.soyad?.charAt(0) || ''}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {student.ad} {student.soyad || ''}
                  </h1>
                  <div className="flex gap-3 mt-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 rounded-full text-sm font-semibold">
                      {student.bolum}
                    </span>
                    {student.hedef && (
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full text-sm font-semibold">
                        🎯 Hedef: {student.hedef}
                      </span>
                    )}
                  </div>
                  {student.notlar && (
                    <p className="text-gray-600 mt-2 text-sm">{student.notlar}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleGeneratePDF}
                  variant="outline"
                  data-testid="download-pdf-button"
                  className="bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF İndir
                </Button>
                <Button
                  variant="outline"
                  data-testid="ai-analyze-button"
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Analiz
                </Button>
              </div>
            </div>

            {/* Student Token */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Öğrenci Giriş Tokeni:</p>
              <code className="text-sm font-mono text-violet-600 bg-white px-3 py-1 rounded" data-testid="student-token">
                {student.token}
              </code>
              <p className="text-xs text-gray-500 mt-1">Bu kodu öğrencinizle paylaşın</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="topics" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="topics" data-testid="topics-tab">Konular</TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tasks-tab">Görevler</TabsTrigger>
            <TabsTrigger value="exams" data-testid="exams-tab">Denemeler</TabsTrigger>
            <TabsTrigger value="calendar" data-testid="calendar-tab">Takvim</TabsTrigger>
          </TabsList>

          <TabsContent value="topics">
            <TopicsTab studentId={studentId} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksTab studentId={studentId} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="exams">
            <ExamsTab studentId={studentId} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarTab studentId={studentId} onRefresh={handleRefresh} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
