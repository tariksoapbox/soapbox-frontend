import type { NextConfig } from 'next';
import { resolveBackendOrigin } from './src/lib/backendOrigin';

/**
 * The API is proxied, not called cross-site.
 *
 * The browser only ever talks to this app's own origin at `/api/*`, and Next
 * forwards those requests to the backend. That keeps the session cookie
 * first-party, so Safari's and Firefox's third-party-cookie blocking cannot
 * silently sign a judge out mid-event — which it would if the browser called
 * the API's own domain from this page. It also means one CORS origin to
 * configure instead of one per preview deployment.
 *
 * This is why the frontend must run as a **server** (Vercel, or a Render Web
 * Service) and not as a static site: a rewrite needs something to do it.
 */
const backendOrigin = resolveBackendOrigin(process.env.BACKEND_ORIGIN);

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${backendOrigin}/:path*` }];
  },
};

export default nextConfig;
