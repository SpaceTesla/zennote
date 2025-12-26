export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://zennote-worker.shivansh-karan.workers.dev',
    version: 'v1',
    endpoints: {
      auth: {
        register: '/v1/auth/register',
        login: '/v1/auth/login',
        me: '/v1/auth/me',
      },
      notes: {
        list: '/v1/notes',
        get: (id: string) => `/v1/notes/${id}`,
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
        updateSocials: '/v1/profiles/me/socials',
      },
      health: '/v1/health',
    },
  },
};
