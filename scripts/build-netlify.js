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
  const buildEnv = {
    ...process.env,
    NODE_ENV: 'production',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://youtube-saver-wx9n.onrender.com',
  };
  execSync('npx next build', { stdio: 'inherit', cwd: path.join(__dirname, '..'), env: buildEnv });

  // 4. Ensure _redirects is present in out
  const redirectsFile = path.join(outDir, '_redirects');
  fs.writeFileSync(redirectsFile, '/*    /index.html   200\n');

  // 5. Copy _headers into out for Netlify CDN caching
  const headersSource = path.join(__dirname, '..', 'public', '_headers');
  const headersDest = path.join(outDir, '_headers');
  if (fs.existsSync(headersSource)) {
    fs.copyFileSync(headersSource, headersDest);
    console.log('📋 Copied _headers for Netlify CDN caching.');
  }

  // 6. Inject DNS preconnect hints into all HTML files for faster backend API calls
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://youtube-saver-wx9n.onrender.com';
  const preconnectTag = `<link rel="preconnect" href="${backendUrl}" crossorigin />\n<link rel="dns-prefetch" href="${backendUrl}" />\n<link rel="preconnect" href="https://i.ytimg.com" crossorigin />`;
  const htmlFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.html'));
  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(outDir, htmlFile);
    let content = fs.readFileSync(htmlPath, 'utf-8');
    if (!content.includes('preconnect') && content.includes('<head>')) {
      content = content.replace('<head>', `<head>\n${preconnectTag}`);
      fs.writeFileSync(htmlPath, content);
    }
  }
  console.log(`⚡ Injected preconnect hints into ${htmlFiles.length} HTML pages.`);

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
