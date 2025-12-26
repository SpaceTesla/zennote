import { DbService } from '../services/db.service';
import { MiddlewareContext } from '../middleware/cors';
import { responseFormatter } from '../middleware/response';

export async function handleHealth(context: MiddlewareContext): Promise<Response> {
  const { env } = context;
  const dbService = new DbService(env.DB);

  const dbHealthy = await dbService.healthCheck();

  const status = {
    status: dbHealthy ? 'healthy' : 'unhealthy',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  };

  return responseFormatter(
    context,
    status,
    dbHealthy ? 200 : 503
  );
}

