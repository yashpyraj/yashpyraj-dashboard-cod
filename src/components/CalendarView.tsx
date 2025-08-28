import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Sword,
  Crown,
  Target,
  Zap,
  Star,
  Eye
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval
} from 'date-fns';
import { AllianceEvent, EventType } from '../types/events';

interface CalendarViewProps {
  events: AllianceEvent[];
  onCreateEvent: (date?: Date) => void;
  onEventClick: (event: AllianceEvent) => void;
  onDateClick: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onCreateEvent,
  onEventClick,
  onDateClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const eventTypeConfig = {
    KILL_EVENT: { 
      icon: Sword, 
      color: 'bg-red-500', 
      textColor: 'text-red-100',
      borderColor: 'border-red-400'
    },
    BEHEMOTH_RAID: { 
      icon: Crown, 
      color: 'bg-purple-500', 
      textColor: 'text-purple-100',
      borderColor: 'border-purple-400'
    },
    TOWN_HALL: { 
      icon: Users, 
      color: 'bg-blue-500', 
      textColor: 'text-blue-100',
      borderColor: 'border-blue-400'
    },
    ALLIANCE_WAR: { 
      icon: Target, 
      color: 'bg-orange-500', 
      textColor: 'text-orange-100',
      borderColor: 'border-orange-400'
    },
    TRAINING: { 
      icon: Zap, 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-900',
      borderColor: 'border-yellow-400'
    },
    CUSTOM: { 
      icon: Star, 
      color: 'bg-gray-500', 
      textColor: 'text-gray-100',
      borderColor: 'border-gray-400'
    }
  };

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);
      
      // Check if the date falls within the event duration
      return isWithinInterval(date, { start: eventStart, end: eventEnd }) ||
             isSameDay(date, eventStart);
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick(date);
  };

  const handleCreateEventForDate = (date: Date) => {
    onCreateEvent(date);
  };

  const renderEventItem = (event: AllianceEvent, isCompact: boolean = false) => {
    const config = eventTypeConfig[event.type] || eventTypeConfig.CUSTOM;
    const IconComponent = config.icon;
    const startTime = format(parseISO(event.startDate), 'HH:mm');

    if (isCompact) {
      return (
        <div
          key={event.id}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick(event);
          }}
          className={`${config.color} ${config.textColor} px-2 py-1 rounded text-xs font-medium cursor-pointer
                     hover:opacity-80 transition-opacity duration-200 mb-1 truncate border-l-2 ${config.borderColor}`}
          title={`${event.title} - ${startTime}`}
        >
          <div className="flex items-center gap-1">
            <IconComponent size={10} />
            <span className="truncate">{startTime} {event.title}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={event.id}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
        className={`${config.color} ${config.textColor} p-3 rounded-lg cursor-pointer
                   hover:opacity-90 transition-all duration-200 border-l-4 ${config.borderColor}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <IconComponent size={16} />
          <span className="font-semibold">{event.title}</span>
        </div>
        <div className="text-xs opacity-90 space-y-1">
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{startTime}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin size={10} />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="glass-card p-6 border-2 border-blue-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <CalendarIcon className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <p className="text-gray-400">Alliance Event Calendar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
            >
              Today
            </button>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
            >
              <ChevronRight size={20} />
            </button>
            
            <button
              onClick={() => onCreateEvent()}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg
                       hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={16} />
              Create Event
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card p-6 border border-gray-600/20">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-gray-400 font-semibold text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-gray-700/20 rounded-lg overflow-hidden">
          {calendarDays.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isTodayDate = isToday(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`min-h-[120px] p-2 bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 ${
                  !isCurrentMonth ? 'opacity-40' : ''
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isTodayDate 
                      ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                      : isCurrentMonth ? 'text-white' : 'text-gray-500'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateEventForDate(date);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-all duration-200"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => renderEventItem(event, true))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-400 px-2 py-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>

                {/* Add Event Button for Empty Days */}
                {dayEvents.length === 0 && isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateEventForDate(date);
                    }}
                    className="w-full h-8 opacity-0 hover:opacity-100 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-all duration-200 mt-2"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="glass-card p-6 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Events for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <button
              onClick={() => handleCreateEventForDate(selectedDate)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Event
            </button>
          </div>
          
          <div className="space-y-3">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto text-gray-500 mb-3" size={32} />
                <p className="text-gray-400">No events scheduled for this date</p>
                <button
                  onClick={() => handleCreateEventForDate(selectedDate)}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
                >
                  Create First Event
                </button>
              </div>
            ) : (
              getEventsForDate(selectedDate).map(event => renderEventItem(event, false))
            )}
          </div>
        </div>
      )}

      {/* Event Legend */}
      <div className="glass-card p-6 border border-gray-600/20">
        <h4 className="text-lg font-semibold text-white mb-4">Event Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(eventTypeConfig).map(([type, config]) => {
            const IconComponent = config.icon;
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`${config.color} p-2 rounded`}>
                  <IconComponent className={config.textColor} size={16} />
                </div>
                <span className="text-gray-300 text-sm">
                  {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};