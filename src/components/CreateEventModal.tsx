import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Trophy, MessageSquare } from 'lucide-react';
import { AllianceEvent, EventType, EventReward } from '../types/events';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Partial<AllianceEvent>) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'KILL_EVENT' as EventType,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    announceToDiscord: true,
    rewards: [] as EventReward[]
  });

  const eventTypes = [
    { value: 'KILL_EVENT', label: 'Kill Event', description: 'Competitive elimination challenges' },
    { value: 'BEHEMOTH_RAID', label: 'Behemoth Raid', description: 'Coordinated boss battles' },
    { value: 'TOWN_HALL', label: 'Town Hall', description: 'Alliance meetings and discussions' },
    { value: 'ALLIANCE_WAR', label: 'Alliance War', description: 'Large-scale PvP conflicts' },
    { value: 'TRAINING', label: 'Training Session', description: 'Skill development and practice' },
    { value: 'CUSTOM', label: 'Custom Event', description: 'Other alliance activities' }
  ];

  const defaultRewards = {
    KILL_EVENT: [
      { type: 'MVP' as const, title: 'Kill Leader', description: 'Most eliminations', emoji: '🥇' },
      { type: 'TOP_3' as const, title: 'Top Performer', description: 'Top 3 killers', emoji: '🏆' },
      { type: 'PARTICIPATION' as const, title: 'Participant', description: 'Joined the event', emoji: '⭐' }
    ],
    BEHEMOTH_RAID: [
      { type: 'MVP' as const, title: 'Raid MVP', description: 'Highest damage dealt', emoji: '👑' },
      { type: 'TOP_3' as const, title: 'Elite Raider', description: 'Top 3 damage dealers', emoji: '⚔️' },
      { type: 'PARTICIPATION' as const, title: 'Raider', description: 'Participated in raid', emoji: '🛡️' }
    ],
    TOWN_HALL: [
      { type: 'PARTICIPATION' as const, title: 'Attendee', description: 'Attended meeting', emoji: '🎯' }
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
    const endDateTime = `${formData.endDate}T${formData.endTime}:00`;
    
    const eventData: Partial<AllianceEvent> = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startDate: startDateTime,
      endDate: endDateTime,
      location: formData.location || undefined,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
      rewards: formData.rewards.length > 0 ? formData.rewards : defaultRewards[formData.type] || [],
      status: 'UPCOMING',
      rsvps: []
    };

    onSubmit(eventData);
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      type: 'KILL_EVENT',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      maxParticipants: '',
      announceToDiscord: true,
      rewards: []
    });
  };

  const handleTypeChange = (type: EventType) => {
    setFormData(prev => ({
      ...prev,
      type,
      rewards: defaultRewards[type] || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Create Alliance Event</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Event Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-400 transition-colors duration-300"
                placeholder="Enter event title..."
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Event Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eventTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value as EventType)}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-semibold">{type.label}</div>
                    <div className="text-sm opacity-75">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-400 transition-colors duration-300 h-24 resize-none"
                placeholder="Describe the event details..."
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="text-blue-400" size={20} />
              Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                           focus:outline-none focus:border-blue-400 transition-colors duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                           focus:outline-none focus:border-blue-400 transition-colors duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                           focus:outline-none focus:border-blue-400 transition-colors duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                           focus:outline-none focus:border-blue-400 transition-colors duration-300"
                  required
                />
              </div>
            </div>
          </div>

          {/* Optional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="text-green-400" size={20} />
              Additional Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Location (Optional)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                           focus:outline-none focus:border-blue-400 transition-colors duration-300"
                  placeholder="e.g., Server 123, Coordinates X:Y"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">Max Participants</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                           focus:outline-none focus:border-blue-400 transition-colors duration-300"
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Discord Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="text-purple-400" size={20} />
              Discord Integration
            </h3>
            
            <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <input
                type="checkbox"
                id="announceToDiscord"
                checked={formData.announceToDiscord}
                onChange={(e) => setFormData(prev => ({ ...prev, announceToDiscord: e.target.checked }))}
                className="w-5 h-5 text-purple-500 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="announceToDiscord" className="text-white font-medium">
                Announce to Discord
              </label>
              <span className="text-gray-400 text-sm ml-auto">
                Automatically post event announcement
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 border border-gray-600 rounded-lg
                       hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg
                       hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
            >
              <Calendar size={20} />
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};