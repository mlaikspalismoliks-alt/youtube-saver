const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparing static build for Netlify Drag & Drop...');

const appApiPath = path.join(__dirname, '..', 'src', 'app', 'api');
const backupApiPath = path.join(__dirname, '..', 'src', 'server_backup', 'api');
const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
const outDir = path.join(__dirname, '..', 'out');

let movedApi = false;
let modifiedConfig = false;
let originalConfig = '';

try {
  // 1. Move src/app/api to backup if exists
  if (fs.existsSync(appApiPath)) {
    console.log('📦 Shelving server API routes for static export...');
    if (fs.existsSync(backupApiPath)) {
      fs.rmSync(backupApiPath, { recursive: true, force: true });
    }
    fs.mkdirSync(path.dirname(backupApiPath), { recursive: true });
    fs.renameSync(appApiPath, backupApiPath);
    movedApi = true;
  }

  // 2. Add output: 'export' to next.config.mjs
  if (fs.existsSync(nextConfigPath)) {
    originalConfig = fs.readFileSync(nextConfigPath, 'utf8');
    if (!originalConfig.includes("output: 'export'")) {
      const updatedConfig = originalConfig.replace(
        'reactStrictMode: true,',
        "reactStrictMode: true,\n  output: 'export',"
      );
      fs.writeFileSync(nextConfigPath, updatedConfig);
      modifiedConfig = true;
    }
  }

  // 3. Run next build
  console.log('⚡ Building static HTML/CSS/JS bundles...');
  execSync('npx next build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // 4. Ensure _redirects is present in out
  const redirectsFile = path.join(outDir, '_redirects');
  fs.writeFileSync(redirectsFile, '/*    /index.html   200\n');

  console.log('\n✅ Netlify Drag & Drop package successfully generated in the "out" folder!');
} catch (error) {
  console.error('\n❌ Build error:', error.message);
  process.exitCode = 1;
} finally {
  // Restore next.config.mjs
  if (modifiedConfig && originalConfig) {
    fs.writeFileSync(nextConfigPath, originalConfig);
    console.log('🔄 Restored next.config.mjs.');
  }

  // Restore src/app/api
  if (movedApi && fs.existsSync(backupApiPath)) {
    if (fs.existsSync(appApiPath)) {
      fs.rmSync(appApiPath, { recursive: true, force: true });
    }
    fs.renameSync(backupApiPath, appApiPath);
    console.log('🔄 Restored server API routes.');
  }
}
