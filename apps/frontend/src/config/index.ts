export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const config = {
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://zennote-worker.shivansh-karan.workers.dev',
    version: 'v1',
    endpoints: {
      notes: {
        list: '/v1/notes',
        get: (id: string) => `/v1/notes/${id}`,
        getBySlug: (username: string, slug: string) =>
          `/v1/notes/slug/${username}/${slug}`,
        getShared: (id: string) => `/v1/s/${id}`,
        create: '/v1/notes',
        update: (id: string) => `/v1/notes/${id}`,
        delete: (id: string) => `/v1/notes/${id}`,
        share: (id: string) => `/v1/notes/${id}/share`,
        revokeAccess: (id: string, userId: string) => `/v1/notes/${id}/access/${userId}`,
        collaborators: (id: string) => `/v1/notes/${id}/collaborators`,
      },
      publicNotes: {
        metadata: (id: string) => `/v1/public/notes/${id}/metadata`,
        metadataBySlug: (username: string, slug: string) =>
          `/v1/public/notes/slug/${username}/${slug}/metadata`,
        list: '/v1/public/notes/list',
      },
      profiles: {
        get: (userId: string) => `/v1/profiles/${userId}`,
        update: '/v1/profiles/me',
      },
      settings: {
        me: '/v1/settings/me',
      },
      health: '/v1/health',
    },
  },
};
