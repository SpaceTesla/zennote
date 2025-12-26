import { MiddlewareContext } from './cors';
import { generateUUID } from '../utils/uuid';

export function loggerMiddleware(context: MiddlewareContext): void {
  const { request } = context;
  const requestId = generateUUID();
  context.requestId = requestId;

  const startTime = Date.now();
  context.startTime = startTime;

  // Log request
  console.log(JSON.stringify({
    type: 'request',
    requestId,
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
  }));

  // Store cleanup function
  context.logResponse = (response: Response) => {
    const duration = Date.now() - startTime;
    console.log(JSON.stringify({
      type: 'response',
      requestId,
      method: request.method,
      url: request.url,
      status: response.status,
      duration,
      timestamp: new Date().toISOString(),
    }));
  };
}

