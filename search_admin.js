const fs = require('fs');

// Check cesworld dashboard - find the main return
const cesworld = fs.readFileSync('./src/app/cesworld/dashboard/page.tsx', 'utf8').split('\n');
console.log('cesworld total lines:', cesworld.length);
cesworld.forEach((l, i) => {
  if (l.match(/^\s+return\s*\(/) && i > 100) {
    console.log('cesworld ' + (i + 1) + ': ' + l.trimStart());
  }
});

console.log('---');

// Check designers dashboard
const designers = fs.readFileSync('./src/app/designers/dashboard/page.tsx', 'utf8').split('\n');
console.log('designers total lines:', designers.length);
designers.forEach((l, i) => {
  if (l.match(/^\s+return\s*\(/) && i > 100) {
    console.log('designers ' + (i + 1) + ': ' + l.trimStart());
  }
});
