import { app } from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(`
=====================================================
  genericMed API Gateway & Operating System Backend
  Node Environment: ${config.nodeEnv}
  Listening on:     http://localhost:${config.port}
  Health Check:     http://localhost:${config.port}/health
  API Base URL:     http://localhost:${config.port}/api/v1
=====================================================
  `);
});

// Graceful shutdown handling
const shutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down genericMed backend gracefully...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force close after 5 seconds if still open
  setTimeout(() => {
    console.error('Forcefully terminating genericMed backend.');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
