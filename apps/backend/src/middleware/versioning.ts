import { MiddlewareContext } from './cors';

export function versioningMiddleware(context: MiddlewareContext): void {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Extract version from URL or header
  const versionMatch = path.match(/^\/v(\d+)\//);
  const headerVersion = request.headers.get('X-API-Version');

  let version = '1';
  if (versionMatch) {
    version = versionMatch[1];
    // Keep the full path with version for routing
    context.path = path;
  } else if (headerVersion) {
    version = headerVersion;
    context.path = path;
  } else {
    // Default to v1
    version = env.API_VERSION || '1';
    context.path = path.startsWith('/v') ? path : `/v${version}${path}`;
  }

  context.apiVersion = version;
}

