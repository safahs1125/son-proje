import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, subWeeks } from 'date-fns';
import { tr } from 'date-fns/locale';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function TaskHistory({ tasks }) {
  const [openWeeks, setOpenWeeks] = useState({});

  // Group tasks by week
  const groupByWeek = () => {
    const weeks = {};
    const today = new Date();
    
    tasks.forEach(task => {
      const taskDate = new Date(task.tarih);
      const weekStart = startOfWeek(taskDate, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          start: weekStart,
          tasks: []
        };
      }
      weeks[weekKey].tasks.push(task);
    });

    // Sort weeks by date (most recent first), exclude current week
    const currentWeekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    return Object.entries(weeks)
      .filter(([key]) => key !== currentWeekStart)
      .sort(([a], [b]) => new Date(b) - new Date(a));
  };

  const toggleWeek = (weekKey) => {
    setOpenWeeks(prev => ({ ...prev, [weekKey]: !prev[weekKey] }));
  };

  const getWeekDateRange = (weekStart) => {
    const weekEnd = addDays(weekStart, 6);
    return `${format(weekStart, 'd MMMM', { locale: tr })} - ${format(weekEnd, 'd MMMM yyyy', { locale: tr })}`;
  };

  const weekGroups = groupByWeek();

  if (weekGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Görev Geçmişi</h3>
      
      {weekGroups.map(([weekKey, weekData]) => (
        <Card key={weekKey} className="gradient-card overflow-hidden">
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
            onClick={() => toggleWeek(weekKey)}
          >
            <div className="flex items-center gap-3">
              {openWeeks[weekKey] ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
              <span className="font-semibold text-gray-800">{getWeekDateRange(weekData.start)}</span>
              <span className="text-sm text-gray-500">({weekData.tasks.length} görev)</span>
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out ${
              openWeeks[weekKey] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                {DAYS.map((day, idx) => {
                  const dayTasks = weekData.tasks.filter(t => t.gun === day);
                  const dayDate = addDays(weekData.start, idx);
                  
                  return (
                    <div key={day} className="p-2 bg-gray-50 rounded">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        {day}<br/>
                        {format(dayDate, 'd MMM', { locale: tr })}
                      </p>
                      <div className="space-y-1">
                        {dayTasks.map(task => (
                          <div
                            key={task.id}
                            className={`p-2 rounded text-xs ${
                              task.completed ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <p className={task.completed ? 'line-through' : ''}>{task.aciklama}</p>
                            <p className="text-[10px] mt-1">{task.sure}dk</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
