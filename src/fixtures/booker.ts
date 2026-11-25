import { test as base, expect } from '@playwright/test';
import { APPS } from '../config/apps';
import { env } from '../config/env';
import { BookingClient } from '../api/BookingClient';
import { AuthResponseSchema, CreateBookingResponseSchema, type Booking } from '../api/schemas';
import { buildBooking } from '../data/booking';

interface BookerFixtures {
  api: BookingClient;
  /** A booking created before the test and deleted after it, pass or fail. */
  booking: { id: number; data: Booking };
}

export const test = base.extend<BookerFixtures, { token: string }>({
  token: [
    async ({ playwright }, use) => {
      const ctx = await playwright.request.newContext({ baseURL: APPS.restfulbooker.baseURL });
      const res = await ctx.post('/auth', {
        data: { username: env.bookerUser, password: env.bookerPassword },
      });
      expect(res.ok()).toBeTruthy();
      // Bad credentials still return 200 with { reason }, so the schema check is what catches it.
      const { token } = AuthResponseSchema.parse(await res.json());
      await use(token);
      await ctx.dispose();
    },
    { scope: 'worker' },
  ],

  api: async ({ request, token }, use) => use(new BookingClient(request, token)),

  booking: async ({ api }, use) => {
    const data = buildBooking();
    const res = await api.create(data);
    expect(res.status()).toBe(200);
    const { bookingid } = CreateBookingResponseSchema.parse(await res.json());
    await use({ id: bookingid, data });
    // Fixture teardown runs even when the test body fails. The status is ignored on purpose:
    // tests such as "delete" remove the booking themselves.
    await api.remove(bookingid);
  },
});

export { expect };
