# vue

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### PastKing


### 修复了前端请求泄露secrets的问题，需要额外使用一个worker来代理请求。
- 首先建立worker，然后在cloudflare page里面选择变量，binding 这个worker（服务绑定），然后重新部署page即可。
```JavaScript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let apiUrl;
    let headers = new Headers();

    switch (url.pathname) {
      case '/api/translateWithDeepL':
        apiUrl = env.TRANSLATE_API_URL;
        headers.set('Content-Type', 'application/json');
        break;

      case '/api/translateWithLLM':
        apiUrl = `${env.API_BASE_URL}/v1/chat/completions`;
        headers.set('Content-Type', 'application/json');
        headers.set('Authorization', `Bearer ${env.API_KEY}`);
        break;

      case '/api/speakText':
        apiUrl = `${env.TTS_API_URL}/tts` + url.search;
        headers.set('Accept', 'audio/mpeg');
        break;

      default:
        return new Response('Not found', { status: 404 });
    }

    if (request.method === "OPTIONS") {
            return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    const apiResponse = await fetch(apiUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' ? await request.text() : undefined
    });

    if (url.pathname === '/api/speakText') {
      return apiResponse;
    }

    if (!apiResponse.ok) {
      return new Response('API request failed ' + apiResponse.text, { status: apiResponse.status });
    }
    const data = await apiResponse.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }
}
```