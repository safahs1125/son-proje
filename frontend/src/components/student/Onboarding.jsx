import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CheckCircle, GraduationCap, Target, Clock, BookOpen, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DERSLER = ['Türkçe', 'Matematik', 'Fen', 'Sosyal', 'AYT Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat', 'Tarih', 'Coğrafya'];

export default function Onboarding({ studentId, onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sinif: '',
    hedef_siralama: '',
    gunluk_calisma_suresi: '',
    guclu_dersler: [],
    zayif_dersler: [],
    deneme_ortalamasi: '',
    kullanilan_kaynaklar: [],
    program_onceligi: ''
  });
  const [loading, setLoading] = useState(false);
  const [kaynakInput, setKaynakInput] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDers = (field, ders) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(ders)) {
        return { ...prev, [field]: current.filter(d => d !== ders) };
      } else {
        return { ...prev, [field]: [...current, ders] };
      }
    });
  };

  const addKaynak = () => {
    if (kaynakInput.trim()) {
      setFormData(prev => ({
        ...prev,
        kullanilan_kaynaklar: [...prev.kullanilan_kaynaklar, kaynakInput.trim()]
      }));
      setKaynakInput('');
    }
  };

  const removeKaynak = (kaynak) => {
    setFormData(prev => ({
      ...prev,
      kullanilan_kaynaklar: prev.kullanilan_kaynaklar.filter(k => k !== kaynak)
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.sinif || !formData.hedef_siralama || !formData.gunluk_calisma_suresi || !formData.program_onceligi) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/student/${studentId}/onboarding`, {
        sinif: formData.sinif,
        hedef_siralama: parseInt(formData.hedef_siralama),
        gunluk_calisma_suresi: parseInt(formData.gunluk_calisma_suresi),
        guclu_dersler: formData.guclu_dersler,
        zayif_dersler: formData.zayif_dersler,
        deneme_ortalamasi: parseFloat(formData.deneme_ortalamasi) || 0,
        kullanilan_kaynaklar: formData.kullanilan_kaynaklar,
        program_onceligi: formData.program_onceligi
      });

      toast.success('Profilin başarıyla tamamlandı!');
      onComplete();
    } catch (error) {
      toast.error('Profil kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-800">Başlayalım!</h2>
              <p className="text-gray-600 mt-2">Seni daha iyi tanımak istiyoruz</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Sınıf *</label>
              <div className="grid grid-cols-3 gap-4">
                {['11. Sınıf', '12. Sınıf', 'Mezun'].map(sinif => (
                  <Button
                    key={sinif}
                    onClick={() => handleInputChange('sinif', sinif)}
                    variant={formData.sinif === sinif ? 'default' : 'outline'}
                    className="h-14"
                  >
                    {sinif}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Hedef Sıralama *</label>
              <Input
                type="number"
                value={formData.hedef_siralama}
                onChange={(e) => handleInputChange('hedef_siralama', e.target.value)}
                placeholder="Örn: 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Günlük Çalışma Süresi (dakika) *</label>
              <Input
                type="number"
                value={formData.gunluk_calisma_suresi}
                onChange={(e) => handleInputChange('gunluk_calisma_suresi', e.target.value)}
                placeholder="Örn: 360"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-800">Güçlü ve Zayıf Yönlerin</h2>
              <p className="text-gray-600 mt-2">Derslerini değerlendir</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Güçlü Olduğun Dersler</label>
              <div className="grid grid-cols-2 gap-2">
                {DERSLER.map(ders => (
                  <Button
                    key={ders}
                    onClick={() => toggleDers('guclu_dersler', ders)}
                    variant={formData.guclu_dersler.includes(ders) ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    {ders}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Zayıf Olduğun Dersler</label>
              <div className="grid grid-cols-2 gap-2">
                {DERSLER.map(ders => (
                  <Button
                    key={ders}
                    onClick={() => toggleDers('zayif_dersler', ders)}
                    variant={formData.zayif_dersler.includes(ders) ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    {ders}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-800">Çalışma Detayları</h2>
              <p className="text-gray-600 mt-2">Son bilgiler</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Deneme Ortalaması (Net)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.deneme_ortalamasi}
                onChange={(e) => handleInputChange('deneme_ortalamasi', e.target.value)}
                placeholder="Örn: 65.5"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Kullandığın Kaynaklar</label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={kaynakInput}
                  onChange={(e) => setKaynakInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKaynak()}
                  placeholder="Kaynak adı yazıp Enter'a bas"
                />
                <Button onClick={addKaynak} size="sm">Ekle</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.kullanilan_kaynaklar.map((kaynak, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2">
                    {kaynak}
                    <button onClick={() => removeKaynak(kaynak)} className="text-indigo-900">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Program Önceliği *</label>
              <div className="grid grid-cols-3 gap-4">
                {['TYT', 'AYT', 'Denge'].map(oncelik => (
                  <Button
                    key={oncelik}
                    onClick={() => handleInputChange('program_onceligi', oncelik)}
                    variant={formData.program_onceligi === oncelik ? 'default' : 'outline'}
                  >
                    {oncelik}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full p-8 bg-white max-h-[90vh] overflow-y-auto">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                s === step ? 'bg-indigo-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? <CheckCircle className="w-6 h-6" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <div>
            {step > 1 && (
              <Button onClick={() => setStep(step - 1)} variant="outline">
                Geri
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={onSkip} variant="ghost">
              Daha Sonra
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                İleri
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                {loading ? 'Kaydediliyor...' : 'Tamamla'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
