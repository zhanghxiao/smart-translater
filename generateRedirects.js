const fs = require('fs');
const path = require('path');

// 确保提供了环境变量 PROXY_WORKER_URL
const proxyUrl = process.env.PROXY_WORKER_URL;
if (!proxyUrl) {
	console.error('PROXY_WORKER_URL environment variable is not set.');
	process.exit(1);
}

// 创建重定向规则内容
const content = `/api/*  ${proxyUrl}/api/:splat  200`;

// 将内容写入到 `_redirects` 文件中
const redirectsPath = path.join(__dirname, 'public', '_redirects');
fs.writeFileSync(redirectsPath, content, 'utf8');
console.log('Redirects file created successfully.');
