const fs = require('fs');
const mapping = JSON.parse(fs.readFileSync('./data/docs-mapping.json', 'utf8'));
const result = mapping.slice(0, 5).map(m => ({ slug: m.doc_slug, route: m.route }));
console.log(JSON.stringify(result, null, 2));
