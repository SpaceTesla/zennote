export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://zennote-worker.shivansh-karan.workers.dev',
    version: 'v1',
    endpoints: {
      notes: {
        list: '/v1/notes',
        get: (id: string) => `/v1/notes/${id}`,
        getBySlug: (username: string, slug: string) => `/v1/notes/slug/${username}/${slug}`,
        create: '/v1/notes',
        update: (id: string) => `/v1/notes/${id}`,
        delete: (id: string) => `/v1/notes/${id}`,
        share: (id: string) => `/v1/notes/${id}/share`,
        revokeAccess: (id: string, userId: string) => `/v1/notes/${id}/access/${userId}`,
        collaborators: (id: string) => `/v1/notes/${id}/collaborators`,
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
