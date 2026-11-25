import { z } from 'zod';

export const BookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: z.object({ checkin: z.string(), checkout: z.string() }),
  additionalneeds: z.string().optional(),
});

export const CreateBookingResponseSchema = z.object({
  bookingid: z.number().int(),
  booking: BookingSchema,
});

export const AuthResponseSchema = z.object({ token: z.string().min(1) });

export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingResponse = z.infer<typeof CreateBookingResponseSchema>;
