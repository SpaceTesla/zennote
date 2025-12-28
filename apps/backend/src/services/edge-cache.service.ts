export class EdgeCacheService {
  async get(request: Request): Promise<Response | null> {
    const cache = caches.default;
    return cache.match(request);
  }

  async put(request: Request, response: Response): Promise<void> {
    const cache = caches.default;
    if (request.method === 'GET' && this.isCacheable(response)) {
      await cache.put(request, response.clone());
    }
  }

  async purge(url: string | URL): Promise<void> {
    const cache = caches.default;
    await cache.delete(new Request(url));
  }

  private isCacheable(response: Response): boolean {
    const cacheControl = response.headers.get('Cache-Control');
    return (
      response.status === 200 &&
      cacheControl !== null &&
      !cacheControl.includes('no-store')
    );
  }
}


