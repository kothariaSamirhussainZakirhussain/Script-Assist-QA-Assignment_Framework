import 'dotenv/config';

function read(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Copy .env.example to .env.`);
  }
  return value;
}

/** Lazy getters: a missing credential only fails when something actually needs it. */
export const env = {
  get sauceBaseUrl() {
    return read('SAUCE_BASE_URL', 'https://www.saucedemo.com');
  },
  get saucePassword() {
    return read('SAUCE_PASSWORD');
  },
  get todoBaseUrl() {
    return read('TODOMVC_BASE_URL', 'https://demo.playwright.dev/todomvc/');
  },
  get bookerBaseUrl() {
    return read('BOOKER_BASE_URL', 'https://restful-booker.herokuapp.com');
  },
  get bookerUser() {
    return read('BOOKER_USERNAME');
  },
  get bookerPassword() {
    return read('BOOKER_PASSWORD');
  },
};
