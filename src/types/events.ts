export interface AllianceEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  rewards?: EventReward[];
  createdBy: string;
  createdAt: string;
  status: EventStatus;
  rsvps: EventRSVP[];
  results?: EventResult[];
}

export interface EventRSVP {
  playerId: string;
  playerName: string;
  status: RSVPStatus;
  timestamp: string;
  notes?: string;
}

export interface EventResult {
  playerId: string;
  playerName: string;
  achievement: string;
  reward?: string;
  timestamp: string;
}

export interface EventReward {
  type: 'MVP' | 'TOP_3' | 'PARTICIPATION' | 'CUSTOM';
  title: string;
  description: string;
  emoji: string;
}

export type EventType = 
  | 'KILL_EVENT' 
  | 'BEHEMOTH_RAID' 
  | 'TOWN_HALL' 
  | 'ALLIANCE_WAR'
  | 'TRAINING'
  | 'CUSTOM';

export type EventStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type RSVPStatus = 'GOING' | 'MAYBE' | 'NOT_GOING' | 'NO_RESPONSE';

export interface DiscordWebhook {
  url: string;
  enabled: boolean;
  announceEvents: boolean;
  announceResults: boolean;
  mentionRole?: string;
}