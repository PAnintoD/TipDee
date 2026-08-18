import { EventEmitter } from 'events';
import { Donation } from './db';

// Global singleton EventEmitter
class DonationEventEmitter extends EventEmitter {}

// Prevent multiple instances in Next.js dev hot-reloading
const globalForEvents = global as unknown as { donationEmitter?: DonationEventEmitter };

export const donationEmitter = globalForEvents.donationEmitter || new DonationEventEmitter();
if (process.env.NODE_ENV !== 'production') {
  globalForEvents.donationEmitter = donationEmitter;
}

export type DonationAlertEvent = {
  type: 'donation' | 'test_alert' | 'goal_updated' | 'refresh';
  donation: Donation;
  timestamp: string;
};

export function broadcastDonation(donation: Donation, isTest: boolean = false) {
  const eventData: DonationAlertEvent = {
    type: isTest ? 'test_alert' : 'donation',
    donation,
    timestamp: new Date().toISOString(),
  };
  donationEmitter.emit(`streamer:${donation.streamerId}`, eventData);
  donationEmitter.emit('all', eventData);
}
