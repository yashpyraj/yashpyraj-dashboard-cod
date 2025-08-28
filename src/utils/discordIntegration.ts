import { AllianceEvent, EventResult } from '../types/events';

interface DiscordWebhookConfig {
  url: string;
  enabled: boolean;
  mentionRole?: string;
}

export class DiscordIntegration {
  private webhookConfig: DiscordWebhookConfig;

  constructor(webhookConfig: DiscordWebhookConfig) {
    this.webhookConfig = webhookConfig;
  }

  async announceEvent(event: AllianceEvent): Promise<boolean> {
    if (!this.webhookConfig.enabled || !this.webhookConfig.url) {
      return false;
    }

    const eventTypeEmojis = {
      KILL_EVENT: '⚔️',
      BEHEMOTH_RAID: '👑',
      TOWN_HALL: '🏛️',
      ALLIANCE_WAR: '🛡️',
      TRAINING: '⚡',
      CUSTOM: '📅'
    };

    const embed = {
      title: `${eventTypeEmojis[event.type]} ${event.title}`,
      description: event.description,
      color: this.getEventColor(event.type),
      fields: [
        {
          name: '📅 Start Time',
          value: `<t:${Math.floor(new Date(event.startDate).getTime() / 1000)}:F>`,
          inline: true
        },
        {
          name: '⏰ End Time',
          value: `<t:${Math.floor(new Date(event.endDate).getTime() / 1000)}:F>`,
          inline: true
        },
        {
          name: '📍 Location',
          value: event.location || 'TBD',
          inline: true
        }
      ],
      footer: {
        text: 'React with ✅ to RSVP | 🤔 for Maybe | ❌ for Not Going'
      },
      timestamp: new Date().toISOString()
    };

    if (event.maxParticipants) {
      embed.fields.push({
        name: '👥 Max Participants',
        value: event.maxParticipants.toString(),
        inline: true
      });
    }

    const payload = {
      content: this.webhookConfig.mentionRole ? `<@&${this.webhookConfig.mentionRole}>` : undefined,
      embeds: [embed]
    };

    try {
      const response = await fetch(this.webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Discord announcement:', error);
      return false;
    }
  }

  async announceResults(event: AllianceEvent, results: EventResult[]): Promise<boolean> {
    if (!this.webhookConfig.enabled || !this.webhookConfig.url || !results.length) {
      return false;
    }

    const eventTypeEmojis = {
      KILL_EVENT: '⚔️',
      BEHEMOTH_RAID: '👑',
      TOWN_HALL: '🏛️',
      ALLIANCE_WAR: '🛡️',
      TRAINING: '⚡',
      CUSTOM: '📅'
    };

    // Group results by achievement type
    const mvpResults = results.filter(r => r.achievement.includes('MVP') || r.achievement.includes('Leader'));
    const topResults = results.filter(r => r.achievement.includes('Top') && !r.achievement.includes('MVP'));
    const otherResults = results.filter(r => !mvpResults.includes(r) && !topResults.includes(r));

    const fields = [];

    if (mvpResults.length > 0) {
      fields.push({
        name: '🥇 MVP Awards',
        value: mvpResults.map(r => `**${r.playerName}** - ${r.achievement}`).join('\n'),
        inline: false
      });
    }

    if (topResults.length > 0) {
      fields.push({
        name: '🏆 Top Performers',
        value: topResults.slice(0, 10).map(r => `**${r.playerName}** - ${r.achievement}`).join('\n'),
        inline: false
      });
    }

    const embed = {
      title: `🎉 ${event.title} - Results`,
      description: `The ${event.title} has concluded! Here are the results:`,
      color: 0xFFD700, // Gold color for results
      fields,
      footer: {
        text: 'Congratulations to all participants!'
      },
      timestamp: new Date().toISOString()
    };

    const payload = {
      embeds: [embed]
    };

    try {
      const response = await fetch(this.webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Discord results:', error);
      return false;
    }
  }

  async announceMVP(playerName: string, achievement: string, eventTitle: string): Promise<boolean> {
    if (!this.webhookConfig.enabled || !this.webhookConfig.url) {
      return false;
    }

    const payload = {
      content: `🎉 **${playerName}** got **${achievement}** in ${eventTitle}! 🥇`,
      embeds: [{
        title: '🏆 MVP Achievement',
        description: `Congratulations to **${playerName}** for their outstanding performance!`,
        color: 0xFFD700,
        fields: [
          {
            name: '🎯 Achievement',
            value: achievement,
            inline: true
          },
          {
            name: '📅 Event',
            value: eventTitle,
            inline: true
          }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    try {
      const response = await fetch(this.webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Discord MVP announcement:', error);
      return false;
    }
  }

  private getEventColor(eventType: string): number {
    const colors = {
      KILL_EVENT: 0xFF4444,     // Red
      BEHEMOTH_RAID: 0x8B5CF6,  // Purple
      TOWN_HALL: 0x3B82F6,      // Blue
      ALLIANCE_WAR: 0xFF8C00,   // Orange
      TRAINING: 0xFFD700,       // Yellow
      CUSTOM: 0x6B7280          // Gray
    };
    
    return colors[eventType as keyof typeof colors] || colors.CUSTOM;
  }
}

// Example usage and setup
export const setupDiscordIntegration = (webhookUrl: string, mentionRoleId?: string) => {
  return new DiscordIntegration({
    url: webhookUrl,
    enabled: true,
    mentionRole: mentionRoleId
  });
};

// Mock data for demonstration
export const mockEvents: AllianceEvent[] = [
  {
    id: '1',
    title: 'Weekend Kill Event',
    description: 'Competitive elimination challenge. Most kills wins MVP!',
    type: 'KILL_EVENT',
    startDate: '2025-02-01T20:00:00',
    endDate: '2025-02-02T23:59:59',
    location: 'Server 123 - War Zone',
    maxParticipants: 50,
    rewards: [
      { type: 'MVP', title: 'Kill Leader', description: 'Most eliminations', emoji: '🥇' },
      { type: 'TOP_3', title: 'Top Killer', description: 'Top 3 killers', emoji: '🏆' }
    ],
    createdBy: 'alliance-leader',
    createdAt: '2025-01-27T10:00:00',
    status: 'UPCOMING',
    rsvps: [
      { playerId: 'player1', playerName: 'RamTamTam', status: 'GOING', timestamp: '2025-01-27T11:00:00' },
      { playerId: 'player2', playerName: 'WarriorX', status: 'MAYBE', timestamp: '2025-01-27T12:00:00' }
    ]
  },
  {
    id: '2',
    title: 'Behemoth Raid - Ancient Dragon',
    description: 'Coordinated raid against the Ancient Dragon. Bring your best troops!',
    type: 'BEHEMOTH_RAID',
    startDate: '2025-01-30T19:00:00',
    endDate: '2025-01-30T21:00:00',
    location: 'Dragon\'s Lair - Coordinates 456:789',
    maxParticipants: 25,
    rewards: [
      { type: 'MVP', title: 'Dragon Slayer', description: 'Highest damage dealt', emoji: '👑' },
      { type: 'TOP_3', title: 'Elite Raider', description: 'Top 3 damage dealers', emoji: '⚔️' }
    ],
    createdBy: 'raid-leader',
    createdAt: '2025-01-26T15:00:00',
    status: 'UPCOMING',
    rsvps: [
      { playerId: 'player1', playerName: 'RamTamTam', status: 'GOING', timestamp: '2025-01-26T16:00:00' },
      { playerId: 'player3', playerName: 'MageKnight', status: 'GOING', timestamp: '2025-01-26T17:00:00' }
    ]
  }
];