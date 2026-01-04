import {
  handleGetProfile,
  handleUpdateProfile,
  handleGetSettings,
  handleUpdateSettings,
} from '../../handlers/profiles';
import { Route } from '../index';

export const profileRoutes: Route[] = [
  {
    method: 'GET',
    path: '/v1/profiles/:userId',
    handler: handleGetProfile,
    authRequired: false,
  },
  {
    method: 'PUT',
    path: '/v1/profiles/me',
    handler: handleUpdateProfile,
    authRequired: true,
  },
  {
    method: 'GET',
    path: '/v1/settings/me',
    handler: handleGetSettings,
    authRequired: true,
  },
  {
    method: 'PUT',
    path: '/v1/settings/me',
    handler: handleUpdateSettings,
    authRequired: true,
  },
];

