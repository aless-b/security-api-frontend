/**
 * Automatic API_SECRET Rotation Daemon / Script
 * 
 * - Generates a new random API_SECRET every 2 minutes.
 * - Updates frontend and backend .env files.
 * - Updates /etc/environment and reloads Nginx proxy container with new API_SECRET.
 * - EXPLICITLY leaves DATABASE_ENCRYPTION_KEY untouched (NO ROTATION).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendEnvPath = path.join(__dirname, '..', '.env');
const backendEnvPath = path.join(__dirname, '..', '..', 'api-key-backend', '.env');

function generateRandomSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ROTATED_SECRET_${rand}`;
}

function updateEnvFile(filePath, newApiSecret) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Update API_SECRET line only
  if (content.includes('API_SECRET=')) {
    content = content.replace(/API_SECRET=.*/g, `API_SECRET=${newApiSecret}`);
  } else {
    content += `\nAPI_SECRET=${newApiSecret}`;
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

function rotate() {
  const newSecret = generateRandomSecret();
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n==================================================`);
  console.log(`[${timestamp}] 🔄 ROTATION TRIGGERED`);
  console.log(`[${timestamp}] New API_SECRET: ${newSecret}`);

  // 1. Update local .env files
  updateEnvFile(frontendEnvPath, newSecret);
  updateEnvFile(backendEnvPath, newSecret);

  // 2. Reload Nginx container & update runtime environment inside container
  try {
    const containerCmd = `docker exec -e API_SECRET=${newSecret} api-key-frontend sh -c "echo 'export API_SECRET=\"${newSecret}\"' > /etc/environment && envsubst '\\$API_SECRET \\$BACKEND_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -s reload"`;
    execSync(containerCmd, { stdio: 'ignore' });
    console.log(`[${timestamp}] ✅ Container Nginx config & /etc/environment reloaded.`);
  } catch (err) {
    console.log(`[${timestamp}] ℹ️ (Nginx update skipped - container may not be active)`);
  }

  // 3. Confirm DATABASE_ENCRYPTION_KEY stability
  console.log(`[${timestamp}] 🔒 DATABASE_ENCRYPTION_KEY status: UNTOUCHED (NO ROTATION)`);
  console.log(`==================================================\n`);
}

console.log('🚀 Automatic API_SECRET Rotation Service Started.');
console.log('⏱️ Schedule: Every 2 minutes (120,000 ms)\n');

// Perform first rotation immediately
rotate();

// Schedule subsequent rotations every 2 minutes
setInterval(rotate, 2 * 60 * 1000);
