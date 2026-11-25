import { randomUUID } from 'node:crypto';
import type { Booking } from '../api/schemas';

/** Builds a unique, valid booking so tests never depend on pre-existing server data. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'Test',
    lastname: `Auto-${randomUUID().slice(0, 8)}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2026-12-01', checkout: '2026-12-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
