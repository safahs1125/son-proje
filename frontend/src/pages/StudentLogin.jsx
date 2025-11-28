import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function StudentLogin() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/students/token/${token}`);
      if (response.data) {
        localStorage.setItem('studentToken', token);
        localStorage.setItem('studentId', response.data.id);
        toast.success('Giriş başarılı!');
        navigate('/student/panel');
      }
    } catch (error) {
      toast.error('Geçersiz token!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 gradient-card page-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Öğrenci Girişi</h1>
          <p className="text-gray-600 text-center">Giriş tokenınızı kullanarak panele erişin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giriş Token</label>
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token kodunuzu girin"
              required
              data-testid="student-token-input"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-2">Coach'ınızdan aldığınız benzersiz kodu girin</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            data-testid="student-login-button"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Coach misiniz?{' '}
            <a href="/coach/login" className="text-amber-600 hover:text-amber-700 font-semibold">
              Coach Girişi
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
