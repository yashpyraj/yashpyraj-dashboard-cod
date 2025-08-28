import React from 'react';
import { X, Calendar, Clock, MapPin, Users, Trophy, MessageSquare } from 'lucide-react';
import { AllianceEvent, RSVPStatus } from '../types/events';
import { format, parseISO } from 'date-fns';

interface EventModalProps {
  event: AllianceEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onRSVP: (eventId: string, status: RSVPStatus, notes?: string) => void;
  currentPlayerId: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onRSVP,
  currentPlayerId
}) => {
  if (!isOpen || !event) return null;

  const eventTypeConfig = {
    KILL_EVENT: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    BEHEMOTH_RAID: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    TOWN_HALL: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    ALLIANCE_WAR: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    TRAINING: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    CUSTOM: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' }
  };

  const config = eventTypeConfig[event.type] || eventTypeConfig.CUSTOM;
  const playerRSVP = event.rsvps.find(rsvp => rsvp.playerId === currentPlayerId);

  const rsvpCounts = {
    GOING: event.rsvps.filter(r => r.status === 'GOING').length,
    MAYBE: event.rsvps.filter(r => r.status === 'MAYBE').length,
    NOT_GOING: event.rsvps.filter(r => r.status === 'NOT_GOING').length
  };

  const rsvpButtons = [
    { status: 'GOING' as RSVPStatus, label: 'Going', color: 'bg-green-600 hover:bg-green-700' },
    { status: 'MAYBE' as RSVPStatus, label: 'Maybe', color: 'bg-yellow-600 hover:bg-yellow-700' },
    { status: 'NOT_GOING' as RSVPStatus, label: 'Not Going', color: 'bg-red-600 hover:bg-red-700' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 ${config.border} ${config.bg}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.bg} border ${config.border}`}>
                {event.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300">{event.description}</p>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-blue-400" size={20} />
                <div>
                  <div className="text-white font-medium">
                    {format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {format(parseISO(event.startDate), 'h:mm a')} - {format(parseISO(event.endDate), 'h:mm a')}
                  </div>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="text-green-400" size={20} />
                  <div>
                    <div className="text-white font-medium">Location</div>
                    <div className="text-gray-400 text-sm">{event.location}</div>
                  </div>
                </div>
              )}

              {event.maxParticipants && (
                <div className="flex items-center gap-3">
                  <Users className="text-purple-400" size={20} />
                  <div>
                    <div className="text-white font-medium">Max Participants</div>
                    <div className="text-gray-400 text-sm">{event.maxParticipants} players</div>
                  </div>
                </div>
              )}
            </div>

            {/* RSVP Status */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">RSVP Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Going:</span>
                  <span className="text-white">{rsvpCounts.GOING}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">Maybe:</span>
                  <span className="text-white">{rsvpCounts.MAYBE}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">Not Going:</span>
                  <span className="text-white">{rsvpCounts.NOT_GOING}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RSVP Buttons */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Your Response</h4>
            <div className="flex gap-3">
              {rsvpButtons.map(button => (
                <button
                  key={button.status}
                  onClick={() => onRSVP(event.id, button.status)}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 ${
                    playerRSVP?.status === button.status 
                      ? `${button.color} ring-2 ring-white/50` 
                      : `${button.color} opacity-70 hover:opacity-100`
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>
            {playerRSVP && (
              <p className="text-gray-400 text-sm mt-2">
                You responded: <span className="text-white font-medium">{playerRSVP.status.replace('_', ' ').toLowerCase()}</span>
              </p>
            )}
          </div>

          {/* Rewards */}
          {event.rewards && event.rewards.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy className="text-yellow-400" size={20} />
                Rewards
              </h4>
              <div className="space-y-2">
                {event.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-2xl">{reward.emoji}</span>
                    <div>
                      <div className="text-white font-medium">{reward.title}</div>
                      <div className="text-gray-400 text-sm">{reward.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {event.results && event.results.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy className="text-yellow-400" size={20} />
                Results
              </h4>
              <div className="space-y-2">
                {event.results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-white font-medium">{result.playerName}</span>
                    <span className="text-yellow-400">{result.achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};