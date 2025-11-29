import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfWeek, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function StudentTasksTab({ studentId, onRefresh }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Pazartesi');
  const [newTasks, setNewTasks] = useState([
    { aciklama: '', sure: 0 },
    { aciklama: '', sure: 0 },
    { aciklama: '', sure: 0 },
    { aciklama: '', sure: 0 },
    { aciklama: '', sure: 0 },
    { aciklama: '', sure: 0 },
    { aciklama: '', sure: 0 },
    { aciklama: '', sure: 0 },
    { aciklama: '', sure: 0 },
    { aciklama: '', sure: 0 },
  ]);

  useEffect(() => {
    fetchTasks();
  }, [studentId]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/tasks/${studentId}`);
      setTasks(response.data);
    } catch (error) {
      toast.error('Görevler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTasks = async () => {
    const validTasks = newTasks.filter(t => t.aciklama.trim() && t.sure > 0);
    
    if (validTasks.length === 0) {
      toast.error('Lütfen en az bir görev girin');
      return;
    }
    
    try {
      const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
      const dayIndex = DAYS.indexOf(selectedDay);
      const taskDate = addDays(currentWeek, dayIndex);
      const existingTaskCount = tasks.filter(t => t.gun === selectedDay).length;
      
      const promises = validTasks.map((task, index) => 
        axios.post(`${BACKEND_URL}/api/tasks`, {
          student_id: studentId,
          aciklama: task.aciklama,
          sure: parseInt(task.sure),
          tarih: format(taskDate, 'yyyy-MM-dd'),
          gun: selectedDay,
          order_index: existingTaskCount + index,
          completed: false
        })
      );
      
      await Promise.all(promises);
      toast.success(`${validTasks.length} görev eklendi`);
      setOpenDialog(false);
      setNewTasks([
        { aciklama: '', sure: 0 },
        { aciklama: '', sure: 0 },
        { aciklama: '', sure: 0 },
        { aciklama: '', sure: 0 },
        { aciklama: '', sure: 0 },
        { aciklama: '', sure: 0 },
        { aciklama: '', sure: 0 },
        { aciklama: '', sure: 0 },
        { aciklama: '', sure: 0 },
        { aciklama: '', sure: 0 },
      ]);
      fetchTasks();
      onRefresh?.();
    } catch (error) {
      toast.error('Görevler eklenirken hata oluştu');
    }
  };

  const updateTaskField = (index, field, value) => {
    const updated = [...newTasks];
    updated[index][field] = value;
    setNewTasks(updated);
  };

  const handleToggleComplete = async (task) => {
    try {
      await axios.put(`${BACKEND_URL}/api/tasks/${task.id}`, {
        completed: !task.completed
      });
      fetchTasks();
      onRefresh?.();
    } catch (error) {
      toast.error('Durum güncellenemedi');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/tasks/${taskId}`);
      toast.success('Görev silindi');
      fetchTasks();
      onRefresh?.();
    } catch (error) {
      toast.error('Görev silinemedi');
    }
  };

  const getTasksByDay = (day) => {
    return tasks.filter(t => t.gun === day);
  };

  const getDayTotalMinutes = (day) => {
    return getTasksByDay(day).reduce((sum, task) => sum + task.sure, 0);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 gradient-card">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Haftalık Özet</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Toplam Görev</p>
            <p className="text-2xl font-bold text-amber-600">{tasks.length}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Tamamlanan</p>
            <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Bekleyen</p>
            <p className="text-2xl font-bold text-orange-600">{tasks.filter(t => !t.completed).length}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Toplam Süre</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(tasks.reduce((sum, t) => sum + t.sure, 0) / 60)}s
            </p>
          </div>
        </div>
      </Card>

      {/* Add Task Button */}
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button data-testid="student-add-task-button" className="bg-gradient-to-r from-amber-500 to-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Görev
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Görev Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Gün</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  data-testid="student-task-day-select"
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Görev Açıklaması</label>
                <Input
                  value={newTask.aciklama}
                  onChange={(e) => setNewTask({ ...newTask, aciklama: e.target.value })}
                  placeholder="Ör: Matematik limit çalış"
                  data-testid="student-task-description-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Süre (dakika)</label>
                <Input
                  type="number"
                  value={newTask.sure}
                  onChange={(e) => setNewTask({ ...newTask, sure: e.target.value })}
                  placeholder="60"
                  data-testid="student-task-duration-input"
                />
              </div>
              <Button onClick={handleAddTask} className="w-full" data-testid="student-create-task-button">
                Görev Ekle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Weekly View */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {DAYS.map((day) => {
          const dayTasks = getTasksByDay(day);
          const totalMinutes = getDayTotalMinutes(day);
          
          return (
            <Card key={day} className="p-4 gradient-card" data-testid={`student-day-card-${day}`}>
              <div className="mb-3">
                <h4 className="font-bold text-gray-800 text-center">{day}</h4>
                <p className="text-xs text-gray-600 text-center mt-1">
                  {totalMinutes}dk ({Math.round(totalMinutes / 60)}s)
                </p>
              </div>
              
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg bg-white shadow-sm border-l-4 ${
                      task.completed ? 'border-green-500' : 'border-orange-500'
                    }`}
                    data-testid={`student-task-item-${task.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        className="mt-1"
                        data-testid={`student-task-checkbox-${task.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm break-words ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.aciklama}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{task.sure}dk</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 h-auto"
                        data-testid={`student-delete-task-${task.id}`}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {dayTasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">Görev yok</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
