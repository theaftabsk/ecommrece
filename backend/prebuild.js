const fs = require('fs');
const path = require('path');

console.log('Prebuild script running...');

// 1. Rename dist to dist-old-<timestamp> to bypass active file locks on Hostinger
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  const timestamp = Date.now();
  const oldDistPath = path.join(__dirname, `dist-old-${timestamp}`);
  try {
    fs.renameSync(distPath, oldDistPath);
    console.log(`Successfully moved dist to ${path.basename(oldDistPath)} to bypass file locks.`);
  } catch (err) {
    console.warn('Warning: Could not rename dist folder:', err.message);
  }
}

// 2. Clean up any old dist-old-* folders
const parentDir = __dirname;
try {
  const files = fs.readdirSync(parentDir);
  for (const file of files) {
    if (file.startsWith('dist-old')) {
      const fullPath = path.join(parentDir, file);
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Cleaned up old build folder: ${file}`);
      } catch (err) {
        // Ignore files that are currently locked by the running server
      }
    }
  }
} catch (err) {
  console.warn('Warning: Could not scan parent directory for cleanup:', err.message);
}

// 3. Normalize folder casing recursively under src to fix Linux build (case-sensitive) issues
function mergeDirs(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      mergeDirs(srcPath, destPath);
    } else {
      if (fs.existsSync(destPath)) {
        try {
          fs.unlinkSync(destPath);
        } catch (e) {}
      }
      fs.renameSync(srcPath, destPath);
    }
  }
  try {
    fs.rmdirSync(src);
  } catch (e) {}
}

function normalizeCasing(parent, expectedName) {
  if (!fs.existsSync(parent)) return;
  const items = fs.readdirSync(parent);
  const targetLower = expectedName.toLowerCase();
  
  for (const item of items) {
    if (item.toLowerCase() === targetLower && item !== expectedName) {
      const actualPath = path.join(parent, item);
      const tempPath = path.join(parent, `${expectedName}-temp-${Date.now()}`);
      const expectedPath = path.join(parent, expectedName);
      
      console.log(`Fixing casing mismatch: Renaming "${item}" to "${expectedName}"...`);
      try {
        // Safe two-step rename for Windows compatibility
        if (fs.existsSync(expectedPath)) {
          mergeDirs(actualPath, expectedPath);
        } else {
          fs.renameSync(actualPath, tempPath);
          fs.renameSync(tempPath, expectedPath);
        }
        console.log(`Successfully normalized casing: "${expectedName}"`);
      } catch (err) {
        console.error(`Failed to normalize casing for "${item}":`, err.message);
      }
    }
  }
}

// Target directories that need exact lowercase casing
const srcDir = path.join(__dirname, 'src');
normalizeCasing(srcDir, 'modules');
normalizeCasing(srcDir, 'common');
normalizeCasing(srcDir, 'prisma');

const modulesDir = path.join(srcDir, 'modules');
normalizeCasing(modulesDir, 'catalog');
normalizeCasing(modulesDir, 'payment');

const commonDir = path.join(srcDir, 'common');
normalizeCasing(commonDir, 'middleware');

console.log('Prebuild script completed.');
