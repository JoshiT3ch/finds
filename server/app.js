import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { requests, HttpError } from './request.js';
import { render, html, escapeHtml } from './html.js';
import * as auth from '../src/app/auth/actions.js';
import { createListing } from '../src/app/sell/actions.js';
import { updateListingStatus, deleteListing } from '../src/app/account/actions.js';
import { startConversation, sendMessage } from '../src/app/messages/actions.js';
import { confirmAuth } from './confirm-auth.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const shell = await readFile(path.join(root, 'index.html'), 'utf8');
const actions = new Map(Object.entries({ ...auth, createListing, updateListingStatus, deleteListing, startConversation, sendMessage }));
const pages = new Map([
  ['/', 'page'], ['/browse', 'browse/page'], ['/about', 'about/page'],
  ['/how-it-works', 'how-it-works/page'], ['/people', 'people/page'],
  ['/sell', 'sell/page'], ['/account', 'account/page'], ['/messages', 'messages/page'],
  ['/login', '(auth)/login/page'], ['/signup', '(auth)/signup/page'],
  ['/forgot-password', '(auth)/forgot-password/page'], ['/update-password', '(auth)/update-password/page'],
  ['/backend-test', 'backend-test/page'],
]);
const types = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const MAX_BODY = 26 * 1024 * 1024;

function documentPage(content, metadata = {}) {
  const values = {
    title: escapeHtml(metadata.title || 'Finds - Second-hand Marketplace'),
    description: escapeHtml(metadata.description || 'Discover pre-loved, thrifted, vintage, and second-hand clothing'),
    content,
  };
  return shell.replace(/\{\{(title|description|content)\}\}/g, (_, key) => values[key]);
}

async function formData(request, origin) {
  if (Number(request.headers['content-length'] || 0) > MAX_BODY) throw new HttpError(413, 'Upload is too large. Maximum request size is 26 MB.');
  const chunks = []; let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY) throw new HttpError(413, 'Upload is too large. Maximum request size is 26 MB.');
    chunks.push(chunk);
  }
  try {
    return await new Request(origin, { method: 'POST', headers: { 'content-type': request.headers['content-type'] || '' }, body: Buffer.concat(chunks) }).formData();
  } catch { throw new HttpError(400, 'Invalid form submission.'); }
}

export function createApp() {
  return createServer(async (request, response) => {
    const context = { responseCookies: new Map() };
    const wantsJson = request.headers.accept?.includes('application/json');
    function send(status, body, contentType = 'text/html; charset=utf-8', extra = {}) {
      const cookies = [...context.responseCookies.values()];
      response.writeHead(status, {
        'Content-Type': contentType, 'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
        ...(cookies.length ? { 'Set-Cookie': cookies } : {}), ...extra,
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    }
    try {
      const host = request.headers.host || 'localhost:3000';
      if (!/^[a-z0-9.:[\]-]+$/i.test(host)) throw new HttpError(400, 'Invalid host');
      const origin = process.env.SITE_ORIGIN ? new URL(process.env.SITE_ORIGIN).origin : `http://${host}`;
      const url = new URL(request.url, origin);
      context.url = url;
      context.headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) if (value) context.headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      // The configured public origin is also used for Supabase confirmation links.
      if (process.env.SITE_ORIGIN) context.headers.set('origin', origin);
      await requests.run(context, async () => {
        const pathname = decodeURIComponent(url.pathname);
        if (pathname.startsWith('/actions/')) {
          if (request.method !== 'POST') throw new HttpError(405, 'Use POST for form submissions.');
          let submittedOrigin = request.headers.origin;
          if (!submittedOrigin && request.headers.referer) submittedOrigin = new URL(request.headers.referer).origin;
          if (submittedOrigin !== origin || request.headers['sec-fetch-site'] === 'cross-site') throw new HttpError(403, 'This form must be submitted from Finds.');
          const action = actions.get(pathname.slice('/actions/'.length));
          if (!action) throw new HttpError(404, 'Unknown form action.');
          const result = await action(null, await formData(request, origin));
          if (wantsJson) return send(200, JSON.stringify(result), 'application/json; charset=utf-8');
          const message = await render(html`<main class="mx-auto max-w-xl p-8"><h1>Finds</h1><p role="status">${result.message}</p><a href="/">Return to Finds</a></main>`);
          return send(200, documentPage(message));
        }
        if (!['GET', 'HEAD'].includes(request.method)) throw new HttpError(405, 'Method not allowed.');
        if (pathname === '/auth/confirm') return await confirmAuth(url);
        // Only public files are served. Source, environment, and node_modules are private.
        const extension = path.extname(pathname);
        if (types[extension]) {
          const publicRoot = path.join(root, 'public');
          const target = path.resolve(publicRoot, '.' + pathname);
          if (!target.startsWith(publicRoot + path.sep) || pathname.includes('\\')) throw new HttpError(404, 'Not found');
          let contents;
          try { contents = await readFile(target); } catch { throw new HttpError(404, 'Not found'); }
          return send(200, contents, types[extension], { 'Cache-Control': 'public, max-age=300' });
        }
        let modulePath = pages.get(pathname.replace(/\/$/, '') || '/');
        const params = {};
        const item = pathname.match(/^\/items\/([^/]+)\/?$/);
        const conversation = pathname.match(/^\/messages\/([^/]+)\/?$/);
        if (item) { modulePath = 'items/[slug]/page'; params.slug = item[1]; }
        if (conversation) { modulePath = 'messages/[conversationId]/page'; params.conversationId = conversation[1]; }
        if (!modulePath) throw new HttpError(404, 'Page not found');
        const page = await import(`../src/app/${modulePath}.js`);
        const props = { params, searchParams: Object.fromEntries(url.searchParams) };
        const content = await render(await page.default(props));
        const metadata = page.generateMetadata ? await page.generateMetadata(props) : page.metadata;
        send(200, documentPage(content, metadata));
      });
    } catch (error) {
      if (error instanceof HttpError && error.location) {
        if (wantsJson) return send(200, JSON.stringify({ redirect: error.location }), 'application/json; charset=utf-8');
        return send(303, '', 'text/html; charset=utf-8', { Location: error.location });
      }
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) console.error('Request failed:', error.message);
      const message = status === 500 ? 'We could not load this page. Please try again.' : error.message;
      if (wantsJson) return send(status, JSON.stringify({ status: 'error', message }), 'application/json; charset=utf-8');
      send(status, documentPage(await render(html`<main class="mx-auto max-w-xl p-8"><h1>${status === 404 ? 'Page not found' : 'Something went wrong'}</h1><p>${message}</p><a href="/">Return to Finds</a></main>`)));
    }
  });
}
