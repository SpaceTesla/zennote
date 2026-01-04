import {
  handleGetNotes,
  handleGetNote,
  handleGetNoteBySlug,
  handleCreateNote,
  handleUpdateNote,
  handleDeleteNote,
  handleShareNote,
  handleRevokeAccess,
  handleGetCollaborators,
} from '../../handlers/notes';
import { Route } from '../index';

export const noteRoutes: Route[] = [
  {
    method: 'GET',
    path: '/v1/notes',
    handler: handleGetNotes,
    authRequired: false,
  },
  {
    method: 'GET',
    path: '/v1/notes/:id',
    handler: handleGetNote,
    authRequired: false,
  },
  {
    method: 'GET',
    path: '/v1/notes/slug/:username/:slug',
    handler: handleGetNoteBySlug,
    authRequired: false,
  },
  {
    method: 'POST',
    path: '/v1/notes',
    handler: handleCreateNote,
    authRequired: false,
  },
  {
    method: 'PUT',
    path: '/v1/notes/:id',
    handler: handleUpdateNote,
    authRequired: true,
  },
  {
    method: 'DELETE',
    path: '/v1/notes/:id',
    handler: handleDeleteNote,
    authRequired: true,
  },
  {
    method: 'POST',
    path: '/v1/notes/:id/share',
    handler: handleShareNote,
    authRequired: true,
  },
  {
    method: 'DELETE',
    path: '/v1/notes/:id/access/:userId',
    handler: handleRevokeAccess,
    authRequired: true,
  },
  {
    method: 'GET',
    path: '/v1/notes/:id/collaborators',
    handler: handleGetCollaborators,
    authRequired: true,
  },
];

