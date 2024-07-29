export async function onRequest(context) {
	const { request, env } = context;
	const url = new URL(request.url);
	const headers = new Headers({
		"Access-Control-Allow-Origin": "*", // 或更具体的域名
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	});
	if (request.method === "OPTIONS") {
		return new Response(null, { headers });
	}
	// 根据请求路径修改请求目的地
	if (request.method === "POST") {
		if (url.pathname.startsWith("/api")) {
			return env.API_WORKER.fetch(new Request(url.toString().replace('/api', ''), request));
		} else {
			return new Response('Not Found', { status: 404 });
		}
	} else {
		return new Response('Method not allowed', { status: 405, headers });
	}
}
