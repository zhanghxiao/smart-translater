export async function onRequest(context) {
	const { request, env } = context;
	const url = new URL(request.url);

	if (request.method === "OPTIONS") {
		// 预检请求响应
		return new Response(null, {
			status: 204,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			}
		});
	}

	// 检查请求路径
	if (url.pathname === "/api/translateWithDeepL") {
		if (request.method === "POST") {
			// 在这里添加处理 POST 请求的逻辑
			return new Response('POST request to translateWithDeepL', { status: 200 });
		} else {
			return new Response('Method not allowed', { status: 405 });
		}
	} else if (url.pathname === "/api") {
		// 对 /api 的其他处理
		return new Response('Hello from API!', { status: 200 });
	} else {
		return new Response('Not found', { status: 404 });
	}
}
