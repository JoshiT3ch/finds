import { AsyncLocalStorage } from 'node:async_hooks';
import { parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';

export const requests = new AsyncLocalStorage();
export function currentRequest() {
  const request = requests.getStore();
  if (!request) throw new Error('Missing request context');
  return request;
}
export class HttpError extends Error {
  constructor(status, message, location) { super(message); this.status = status; this.location = location; }
}
export function redirect(location) { throw new HttpError(303, 'Redirect', location); }
export function notFound() { throw new HttpError(404, 'Page not found'); }
export function queryParam(name) { return currentRequest().url.searchParams.get(name) || ''; }
export async function headers() { return currentRequest().headers; }
export async function cookies() {
  const context = currentRequest();
  context.cookieValues ??= new Map(parseCookieHeader(context.headers.get('cookie') || '').map(({ name, value }) => [name, value]));
  return {
    getAll: () => [...context.cookieValues].map(([name, value]) => ({ name, value })),
    set(name, value, options) {
      context.cookieValues.set(name, value);
      context.responseCookies.set(name, serializeCookieHeader(name, value, options));
    },
  };
}
