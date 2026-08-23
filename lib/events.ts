import { EventEmitter } from 'events';
import { Donation } from './db';

// Global singleton EventEmitter
class DonationEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Allow up to 100 listeners per process (for multiple open OBS browser sources)
    this.setMaxListeners(100);
  }
}

// Prevent multiple instances in Next.js dev hot-reloading
const globalForEvents = global as unknown as { donationEmitter?: DonationEventEmitter };

export const donationEmitter = globalForEvents.donationEmitter || new DonationEventEmitter();
if (process.env.NODE_ENV !== 'production') {
  globalForEvents.donationEmitter = donationEmitter;
}

export type DonationAlertEvent = {
  type: 'donation' | 'test_alert' | 'goal_updated' | 'skip_alert' | 'refresh';
  donation?: Donation;
  timestamp: string;
};

export function broadcastDonation(donation: Donation, isTest: boolean = false) {
  const eventData: DonationAlertEvent = {
    type: isTest ? 'test_alert' : 'donation',
    donation,
    timestamp: new Date().toISOString(),
  };

  // Broadcast to specific streamer channel
  donationEmitter.emit(`streamer:${donation.streamerId}`, eventData);
  donationEmitter.emit('all', eventData);
}

export function broadcastStreamerEvent(streamerIdOrUsername: string, type: 'goal_updated' | 'skip_alert' | 'refresh') {
  const eventData: DonationAlertEvent = {
    type,
    timestamp: new Date().toISOString(),
  };
  donationEmitter.emit(`streamer:${streamerIdOrUsername}`, eventData);
}
