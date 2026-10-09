import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev server middleware plugin to serve /api/chat and /api/scan locally identical to Vercel
function localApiPlugin() {
  return {
    name: 'local-api-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/api/chat' || url === '/api/scan') {
          if (req.method === 'OPTIONS') {
            res.writeHead(200, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            });
            res.end();
            return;
          }

          // Read body
          let bodyStr = '';
          req.on('data', (chunk: any) => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            try {
              const body = bodyStr ? JSON.parse(bodyStr) : {};
              const mockReq = { method: req.method, body, headers: req.headers };

              const mockRes = {
                statusCode: 200,
                headers: {} as Record<string, string>,
                setHeader(name: string, value: string) {
                  this.headers[name] = value;
                  return this;
                },
                status(code: number) {
                  this.statusCode = code;
                  return this;
                },
                json(data: any) {
                  res.writeHead(this.statusCode, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    ...this.headers,
                  });
                  res.end(JSON.stringify(data));
                  return this;
                },
                end() {
                  res.writeHead(this.statusCode, {
                    'Access-Control-Allow-Origin': '*',
                    ...this.headers,
                  });
                  res.end();
                  return this;
                },
              };

              if (url === '/api/chat') {
                const chatModule = await server.ssrLoadModule('/api/chat.js');
                await chatModule.default(mockReq, mockRes);
              } else if (url === '/api/scan') {
                const scanModule = await server.ssrLoadModule('/api/scan.js');
                await scanModule.default(mockReq, mockRes);
              }
            } catch (err: any) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(JSON.stringify({ error: err?.message || 'Local API handler error' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env for local API routes
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  if (env.VITE_GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.VITE_GEMINI_API_KEY;
  }

  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
  };
});
