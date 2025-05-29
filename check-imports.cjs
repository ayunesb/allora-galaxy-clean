// Script to check for unresolved or missing imports in your project

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const IMPORT_REGEX = /import\s+(?:[\w*\s{},]+from\s*)?["']([^"']+)["']/g;

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function checkImports() {
  const files = walk(SRC_DIR);
  const missing = [];

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = IMPORT_REGEX.exec(content))) {
      let importPath = match[1];
      if (
        importPath.startsWith('.') ||
        importPath.startsWith('/') ||
        importPath.startsWith('@/') // handle alias
      ) {
        let resolved;
        if (importPath.startsWith('@/')) {
          resolved = path.join(SRC_DIR, importPath.slice(2));
        } else {
          resolved = path.resolve(path.dirname(file), importPath);
        }
        // Try .js, .ts, .tsx, /index.js, etc.
        const exts = ['', '.js', '.ts', '.tsx', '/index.js', '/index.ts', '/index.tsx'];
        const found = exts.some(ext => fs.existsSync(resolved + ext));
        if (!found) {
          missing.push({ file, importPath });
        }
      }
    }
  });

  if (missing.length) {
    console.log('Missing or unresolved imports:');
    missing.forEach(({ file, importPath }) => {
      console.log(`  ${file} imports ${importPath}`);
    });
    process.exit(1);
  } else {
    console.log('All imports resolved!');
  }
}

checkImports();
