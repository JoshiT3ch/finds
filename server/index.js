import { existsSync } from 'node:fs';
// Load only local configuration; never send environment files to the browser.
for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}
const { createApp } = await import('./app.js');
const port = Number(process.env.PORT || 3000);
const server = createApp();
server.listen(port, process.env.HOST || '127.0.0.1', () => {
  console.log(`Finds is running at http://localhost:${port}`);
});
