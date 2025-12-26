import { handleRegister, handleLogin, handleMe } from '../../handlers/auth';
import { Route } from '../index';

export const authRoutes: Route[] = [
  {
    method: 'POST',
    path: '/v1/auth/register',
    handler: handleRegister,
    authRequired: false,
  },
  {
    method: 'POST',
    path: '/v1/auth/login',
    handler: handleLogin,
    authRequired: false,
  },
  {
    method: 'GET',
    path: '/v1/auth/me',
    handler: handleMe,
    authRequired: true,
  },
];

