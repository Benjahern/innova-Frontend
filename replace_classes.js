import fs from 'fs';
import path from 'path';

const dir = 'c:\\Users\\conyv\\Desktop\\innova-Frontend\\pages\\[company]';

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.vue')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      content = content.replace(/bg-blue-600/g, 'bg-primary');
      content = content.replace(/hover:bg-blue-700/g, 'hover:opacity-90');
      content = content.replace(/text-blue-600/g, 'text-primary');
      content = content.replace(/text-blue-500/g, 'text-primary');
      content = content.replace(/bg-blue-100/g, 'bg-primary/10');
      content = content.replace(/text-blue-700/g, 'text-primary');
      content = content.replace(/bg-blue-50/g, 'bg-primary/5');
      
      content = content.replace(/bg-primary-600/g, 'bg-primary');
      content = content.replace(/hover:bg-primary-700/g, 'hover:opacity-90');
      content = content.replace(/text-primary-600/g, 'text-primary');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir(dir);
