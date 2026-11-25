import { test, expect } from '../../../src/fixtures/booker';
import { BookingSchema, CreateBookingResponseSchema } from '../../../src/api/schemas';
import { buildBooking } from '../../../src/data/booking';

test.describe('Booking lifecycle', { tag: '@regression' }, () => {
  test(
    'creates a booking and returns a schema-valid response',
    { tag: '@smoke' },
    async ({ api }) => {
      const data = buildBooking();
      const res = await api.create(data);
      expect(res.status()).toBe(200);
      const body = CreateBookingResponseSchema.parse(await res.json());
      try {
        expect(body.booking).toEqual(data);
      } finally {
        await api.remove(body.bookingid); // cleanup even if the assertion fails
      }
    },
  );

  test('reads a booking by id', { tag: '@smoke' }, async ({ api, booking }) => {
    const res = await api.get(booking.id);
    expect(res.status()).toBe(200);
    expect(BookingSchema.parse(await res.json())).toEqual(booking.data);
  });

  test('updates a booking with PUT', async ({ api, booking }) => {
    const replacement = buildBooking({ firstname: 'Replaced', totalprice: 999 });
    const res = await api.update(booking.id, replacement);
    expect(res.status()).toBe(200);
    expect(BookingSchema.parse(await res.json())).toEqual(replacement);
  });

  test('partially updates a booking with PATCH', async ({ api, booking }) => {
    const res = await api.patch(booking.id, { firstname: 'Patched', totalprice: 321 });
    expect(res.status()).toBe(200);
    const updated = BookingSchema.parse(await res.json());
    expect(updated).toEqual({ ...booking.data, firstname: 'Patched', totalprice: 321 });
  });

  test('deletes a booking and it can no longer be read', async ({ api, booking }) => {
    // Restful-Booker answers a successful DELETE with 201 Created.
    expect((await api.remove(booking.id)).status()).toBe(201);
    expect((await api.get(booking.id)).status()).toBe(404);
  });
});

test.describe('Booking negative cases', { tag: '@regression' }, () => {
  test('rejects an update with an invalid token', async ({ api, booking }) => {
    const res = await api.update(booking.id, buildBooking(), 'not-a-real-token');
    expect(res.status()).toBe(403);
  });

  test('rejects a create with an invalid payload', async ({ api }) => {
    const res = await api.create({ firstname: 'Only' });
    // The service returns 500 for malformed bodies; accept 400 too so a fix does not break the test.
    expect([400, 500]).toContain(res.status());
  });

  test('returns 404 for a non-existent booking id', async ({ api }) => {
    const res = await api.get(999_999_999);
    expect(res.status()).toBe(404);
  });
});
