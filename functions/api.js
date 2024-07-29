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
	if (url.pathname.startsWith("/api")) {
		const newUrl = new URL(url);
		newUrl.pathname = url.pathname.replace('/api', '');
		return env.API_WORKER.fetch(new Request(newUrl.toString(), request));
	} else {
		return new Response('Not Found', { status: 404 });
	}
}
