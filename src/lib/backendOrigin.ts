/**
 * Normalise `BACKEND_ORIGIN` into an absolute origin for the `/api` rewrite.
 *
 * Render's blueprint can inject another service's address with
 * `fromService: { property: host }`, which yields a bare hostname
 * (`soapbox-api.onrender.com`) with no scheme — and a rewrite destination
 * without a scheme is not a URL. Rather than make the operator remember to
 * paste `https://` in front, assume it: anything that isn't already absolute
 * and isn't localhost is reached over TLS.
 */
export function resolveBackendOrigin(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return 'http://localhost:4000';
  if (/^https?:\/\//i.test(value)) return value.replace(/\/+$/, '');

  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(value);
  return `${isLocal ? 'http' : 'https'}://${value.replace(/\/+$/, '')}`;
}
