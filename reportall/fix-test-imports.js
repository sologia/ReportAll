const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'PruebasUnitarias');
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.test.js'))) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const newContent = content
    .replace(/\.\.\.\/\.\.\.\/src\//g, '../src/')
    .replace(/\.\.\.\/\.\.\.\/backend\/src\//g, '../backend/src/');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('updated', file);
  }
}
