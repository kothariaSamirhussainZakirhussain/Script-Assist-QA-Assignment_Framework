import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from './schemas';

/** Thin, reusable Restful-Booker client. Returns raw responses so tests own the assertions. */
export class BookingClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token: string,
  ) {}

  private auth(token: string = this.token) {
    return { Cookie: `token=${token}` };
  }

  create(data: Partial<Booking>): Promise<APIResponse> {
    return this.request.post('/booking', { data });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  /** Full replacement. `token` can be overridden to test invalid credentials. */
  update(id: number, data: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data, headers: this.auth(token) });
  }

  patch(id: number, data: Partial<Booking>, token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data, headers: this.auth(token) });
  }

  remove(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.auth(token) });
  }
}
