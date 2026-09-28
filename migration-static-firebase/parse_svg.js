const fs = require('fs');
const svgContent = fs.readFileSync('c:/Local Disk D/News/migration-static-firebase/westbengal_official.svg', 'utf8');

const pathRegex = /<path\s+[^>]*id="(path36|path40|path33|path37|path39|path41|path43|path45|path48|path50)"[^>]*\/?>/gi;
let match;
while ((match = pathRegex.exec(svgContent)) !== null) {
  console.log('--- PATH MATCH ---');
  console.log(match[0]);
}

// Also check if there are other path tags with different formatting
const allPathsWithId = svgContent.match(/<path[^>]*>/gi) || [];
console.log('Total path tags in SVG:', allPathsWithId.length);
allPathsWithId.forEach((p, i) => {
  if (p.includes('path36') || p.includes('path40') || p.includes('path33') || p.includes('path37')) {
    console.log(`Matching tag [${i}]:`, p);
  }
});
