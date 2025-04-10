// apps/backend/src/index.ts

import { D1Database } from '@cloudflare/workers-types';

function generateUUID() {
  return crypto.randomUUID();
}

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    // Parse the URL to handle different routes
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Set CORS headers for all responses
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // for root path
    if (path === '/') {
      return new Response('Hello from the backend!', { headers });
    }

    // Get individual note by ID
    const notePattern = /^\/notes\/([^\/]+)$/;
    const noteMatch = path.match(notePattern);

    if (request.method === 'GET' && noteMatch) {
      // Extract note ID from URL
      const noteId = noteMatch[1];

      try {
        const { results } = await env.DB.prepare(
          'SELECT * FROM notes WHERE id = ?',
        )
          .bind(noteId)
          .all();

        if (results.length === 0) {
          return new Response(JSON.stringify({ error: 'Note not found' }), {
            status: 404,
            headers,
          });
        }

        return new Response(JSON.stringify(results[0]), { headers });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to retrieve note' }),
          { status: 500, headers },
        );
      }
    }

    // Handle different HTTP methods and routes
    if (request.method === 'GET' && path === '/notes') {
      // Get all notes
      const { results } = await env.DB.prepare('SELECT * FROM notes').all();
      return new Response(JSON.stringify(results), { headers });
    } else if (request.method === 'POST' && path === '/notes') {
      try {
        const { title, content } = await request.json();

        // Validate the input
        if (!title || !content) {
          return new Response(
            JSON.stringify({ error: 'Title and content are required' }),
            { status: 400, headers },
          );
        }

        const noteId = generateUUID();

        // Insert the new note
        await env.DB.prepare(
          'INSERT INTO notes (id, title, content) VALUES (?, ?, ?)',
        )
          .bind(noteId, title, content)
          .run();

        return new Response(
          JSON.stringify({
            success: true,
            id: noteId,
          }),
          { status: 201, headers },
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to create note' }),
          { status: 500, headers },
        );
      }
    }

    // Handle 404 for undefined routes
    return new Response('Not found', { status: 404 });
  },
};
