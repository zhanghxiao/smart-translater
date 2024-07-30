const fs = require('fs-extra');

// 复制后端文件到构建目录
fs.copySync('server.js', 'dist/server.js');
fs.copySync('.env', 'dist/.env');
fs.copySync('package.json', 'dist/package.json');

console.log('Server files copied to dist folder');
