import React, { useState, useMemo } from 'react';
import { Calendar, List, Grid, Plus, MessageSquare, Sparkles, Wifi } from 'lucide-react';
import { AllianceEvent, EventType, RSVPStatus } from '../types/events';
import { CalendarView } from './CalendarView';
import { EventModal } from './EventModal';
import { CreateEventModal } from './CreateEventModal';

interface EventCalendarProps {
  events: AllianceEvent[];
  currentPlayerId: string;
  onCreateEvent: (event: Partial<AllianceEvent>) => void;
  onRSVP: (eventId: string, status: RSVPStatus, notes?: string) => void;
  onUpdateResults: (eventId: string, results: any[]) => void;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  currentPlayerId,
  onCreateEvent,
  onRSVP,
  onUpdateResults
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AllianceEvent | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedCreateDate, setSelectedCreateDate] = useState<Date | null>(null);

  const handleCreateEvent = (date?: Date) => {
    setSelectedCreateDate(date || null);
    setShowCreateModal(true);
  };

  const handleEventSubmit = (eventData: Partial<AllianceEvent>) => {
    // If a specific date was selected, use it as the start date
    if (selectedCreateDate && !eventData.startDate) {
      const dateStr = selectedCreateDate.toISOString().split('T')[0];
      eventData.startDate = `${dateStr}T20:00:00`;
      eventData.endDate = `${dateStr}T22:00:00`;
    }
    
    onCreateEvent(eventData);
    setShowCreateModal(false);
    setSelectedCreateDate(null);
  };

  const handleEventClick = (event: AllianceEvent) => {
    setSelectedEvent(event);
  };

  const handleDateClick = (date: Date) => {
    // Optional: You can add logic here for date selection
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
            <Sparkles className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Alliance Events</h2>
            <p className="text-gray-300">Coordinate raids, meetings, and competitions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                viewMode === 'calendar' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              List View
            </button>
          </div>
          
          <button
            onClick={() => handleCreateEvent()}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg
                     hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>
      </div>

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? (
        <CalendarView
          events={events}
          onCreateEvent={handleCreateEvent}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
      ) : (
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-6">All Events</h3>
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-500 mb-4" size={48} />
                <h4 className="text-lg font-semibold text-gray-400 mb-2">No Events</h4>
                <p className="text-gray-500 mb-4">Create your first alliance event!</p>
                <button
                  onClick={() => handleCreateEvent()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Create Event
                </button>
              </div>
            ) : (
              events.map(event => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="glass-card p-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-semibold">{event.title}</h4>
                      <p className="text-gray-400 text-sm">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRSVP={onRSVP}
        currentPlayerId={currentPlayerId}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedCreateDate(null);
        }}
        onSubmit={handleEventSubmit}
      />

      {/* Discord Integration Status */}
      <div className="glass-card p-6 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Wifi className="text-indigo-400" size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold">Discord Integration</h4>
              <p className="text-gray-400 text-sm">Automatic event announcements and results</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};