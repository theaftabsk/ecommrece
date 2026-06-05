const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dist', 'main.js');
const fileContent = "module.exports = require('./src/main.js');\n";

try {
  // Ensure dist directory exists
  const distDir = path.dirname(filePath);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  fs.writeFileSync(filePath, fileContent);
  console.log('Postbuild: Successfully wrote redirect file to dist/main.js');
} catch (err) {
  console.error('Postbuild: Failed to write redirect file:', err.message);
  process.exit(1);
}
