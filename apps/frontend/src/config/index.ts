// apps/frontend/src/config/index.ts

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    endpoints: {
      notes: '/notes',
      note: (id: string) => `/notes/${id}`, // Make sure this matches your API path
    },
  },
};
