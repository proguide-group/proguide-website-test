/* filepath: scripts/generate-blog-index.js */
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'assets', 'blog');
const outputFile = path.join(__dirname, '..', 'assets', 'blog-index.json');

try {
  const files = fs.readdirSync(blogDir)
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => {
      // Sort by date in filename, newest first
      const dateA = a.match(/^(\d{4}-\d{2}-\d{2})/);
      const dateB = b.match(/^(\d{4}-\d{2}-\d{2})/);
      
      if (dateA && dateB) {
        return new Date(dateB[1]) - new Date(dateA[1]);
      }
      
      // If no date, sort alphabetically (but keep Arabic files)
      return b.localeCompare(a, 'ar', { numeric: true });
    });

  fs.writeFileSync(outputFile, JSON.stringify(files, null, 2));
  console.log(`Generated blog index with ${files.length} posts:`);
  files.forEach(file => console.log(`  - ${file}`));
} catch (error) {
  console.error('Error generating blog index:', error);
}