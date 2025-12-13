import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function StudentCalendarTab({ studentId, onRefresh }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [studentId]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/calendar/${studentId}`);
      setNotes(response.data);
    } catch (error) {
      toast.error('Notlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Lütfen not girin');
      return;
    }
    try {
      await axios.post(`${BACKEND_URL}/api/calendar`, {
        student_id: studentId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        note: newNote
      });
      toast.success('Not eklendi');
      setOpenDialog(false);
      setNewNote('');
      fetchNotes();
      onRefresh?.();
    } catch (error) {
      toast.error('Not eklenemedi');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Bu notu silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/calendar/${noteId}`);
      toast.success('Not silindi');
      fetchNotes();
      onRefresh?.();
    } catch (error) {
      toast.error('Not silinemedi');
    }
  };

  const getNotesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return notes.filter(n => n.date === dateStr);
  };

  const hasNoteOnDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return notes.some(n => n.date === dateStr);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loading-spinner"></div></div>;
  }

  const selectedDateNotes = getNotesForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="p-6 gradient-card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <CalendarDays className="w-5 h-5 mr-2" />
            Takvim
          </h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={tr}
            className="rounded-md border"
            modifiers={{
              hasNote: (date) => hasNoteOnDate(date)
            }}
            modifiersStyles={{
              hasNote: { fontWeight: 'bold', backgroundColor: 'rgba(245, 158, 11, 0.2)' }
            }}
          />
        </Card>

        {/* Notes for Selected Date */}
        <Card className="p-6 gradient-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {format(selectedDate, 'd MMMM yyyy', { locale: tr })}
            </h3>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="student-add-calendar-note-button" className="bg-gradient-to-r from-amber-500 to-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Not Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Not Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tarih: {format(selectedDate, 'd MMMM yyyy', { locale: tr })}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Not</label>
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Notunuzu girin..."
                      rows={4}
                      data-testid="student-calendar-note-input"
                    />
                  </div>
                  <Button onClick={handleAddNote} className="w-full" data-testid="student-create-calendar-note-button">
                    Not Ekle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {selectedDateNotes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Bu tarih için not yok</p>
            ) : (
              selectedDateNotes.map((note) => (
                <div key={note.id} className="p-4 bg-white rounded-lg shadow-sm" data-testid={`student-calendar-note-${note.id}`}>
                  <div className="flex justify-between items-start">
                    <p className="text-gray-800 flex-1 break-words">{note.note}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      data-testid={`student-delete-calendar-note-${note.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* All Notes List */}
      <Card className="p-6 gradient-card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Tüm Notlar</h3>
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Henüz not eklenmemiş</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <p className="text-sm text-gray-600 mb-1">
                    {new Date(note.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-gray-800 break-words">{note.note}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
