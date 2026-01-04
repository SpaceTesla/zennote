import { handleMe } from '../../handlers/auth';
import { Route } from '../index';

export const authRoutes: Route[] = [
  {
    method: 'GET',
    path: '/v1/auth/me',
    handler: handleMe,
    authRequired: true,
  },
];

