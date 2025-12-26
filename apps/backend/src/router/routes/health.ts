import { handleHealth } from '../../handlers/health';
import { handleCleanup } from '../../handlers/cleanup';
import { Route } from '../index';

export const healthRoutes: Route[] = [
  {
    method: 'GET',
    path: '/health',
    handler: handleHealth,
    authRequired: false,
  },
  {
    method: 'GET',
    path: '/v1/health',
    handler: handleHealth,
    authRequired: false,
  },
  {
    method: 'POST',
    path: '/v1/admin/cleanup',
    handler: handleCleanup,
    authRequired: true,
  },
];

