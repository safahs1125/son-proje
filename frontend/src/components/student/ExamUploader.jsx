import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ExamUploader({ studentId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [manualData, setManualData] = useState([
    { name: 'Matematik', total: 40, correct: 0, wrong: 0, blank: 0 },
    { name: 'Fizik', total: 14, correct: 0, wrong: 0, blank: 0 },
    { name: 'Kimya', total: 13, correct: 0, wrong: 0, blank: 0 },
    { name: 'Biyoloji', total: 13, correct: 0, wrong: 0, blank: 0 },
    { name: 'Türkçe', total: 40, correct: 0, wrong: 0, blank: 0 },
  ]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // PDF veya görsel kontrolü
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Sadece PDF veya görsel dosyaları yükleyebilirsiniz');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !examName) {
      toast.error('Lütfen deneme adı ve dosya seçiniz');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        `${BACKEND_URL}/api/exam/upload-and-analyze?student_id=${studentId}&uploaded_by=student&exam_name=${encodeURIComponent(examName)}&exam_date=${examDate}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success('Deneme başarıyla yüklendi ve analiz edildi!');
        setSelectedFile(null);
        setExamName('');
        if (onUploadComplete) onUploadComplete();
      } else {
        toast.error('Analiz başarısız: ' + response.data.error);
      }
    } catch (error) {
      toast.error('Yükleme hatası: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!examName) {
      toast.error('Lütfen deneme adı giriniz');
      return;
    }

    setUploading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/exam/manual-entry`, {
        student_id: studentId,
        exam_name: examName,
        exam_date: examDate,
        subjects: manualData,
      });

      if (response.data.success) {
        toast.success('Deneme sonucu kaydedildi!');
        setExamName('');
        // Reset manual data
        setManualData([
          { name: 'Matematik', total: 40, correct: 0, wrong: 0, blank: 0 },
          { name: 'Fizik', total: 14, correct: 0, wrong: 0, blank: 0 },
          { name: 'Kimya', total: 13, correct: 0, wrong: 0, blank: 0 },
          { name: 'Biyoloji', total: 13, correct: 0, wrong: 0, blank: 0 },
          { name: 'Türkçe', total: 40, correct: 0, wrong: 0, blank: 0 },
        ]);
        if (onUploadComplete) onUploadComplete();
      }
    } catch (error) {
      toast.error('Kaydetme hatası: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateManualData = (index, field, value) => {
    const newData = [...manualData];
    newData[index][field] = parseInt(value) || 0;
    setManualData(newData);
  };

  return (
    <Card className="p-6 gradient-card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Yeni Deneme Ekle</h3>

      <div className="mb-4 space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-2">Deneme Adı</label>
          <Input
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="Örn: TYT Deneme 1"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Deneme Tarihi</label>
          <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upload">Dosya Yükle (AI Analiz)</TabsTrigger>
          <TabsTrigger value="manual">Manuel Giriş</TabsTrigger>
        </TabsList>

        {/* Dosya Yükleme */}
        <TabsContent value="upload">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-3 text-indigo-600" />
              <p className="text-sm text-gray-600 mb-3">
                PDF veya ekran görüntüsü yükleyin
                <br />
                (AI otomatik analiz yapacak)
              </p>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="max-w-xs mx-auto"
              />
              {selectedFile && (
                <p className="mt-3 text-sm text-green-600 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  {selectedFile.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleFileUpload}
              disabled={uploading || !selectedFile}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                'Yükle ve Analiz Et'
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Manuel Giriş */}
        <TabsContent value="manual">
          <div className="space-y-3">
            {manualData.map((subject, idx) => (
              <Card key={idx} className="p-4 bg-white">
                <h4 className="font-semibold text-gray-800 mb-3">{subject.name}</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Doğru</label>
                    <Input
                      type="number"
                      min="0"
                      max={subject.total}
                      value={subject.correct}
                      onChange={(e) => updateManualData(idx, 'correct', e.target.value)}
                      className="text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Yanlış</label>
                    <Input
                      type="number"
                      min="0"
                      max={subject.total}
                      value={subject.wrong}
                      onChange={(e) => updateManualData(idx, 'wrong', e.target.value)}
                      className="text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Boş</label>
                    <Input
                      type="number"
                      min="0"
                      max={subject.total}
                      value={subject.blank}
                      onChange={(e) => updateManualData(idx, 'blank', e.target.value)}
                      className="text-center"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  Net: {(subject.correct - subject.wrong / 4).toFixed(2)}
                </p>
              </Card>
            ))}

            <Button
              onClick={handleManualSubmit}
              disabled={uploading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
