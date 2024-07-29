export async function onRequest(context) {
	const { request, env } = context;
	const url = new URL(request.url);
	if (request.method === "OPTIONS") {
		return new Response(null, {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			}
		});
	}
	// 根据请求路径修改请求目的地
	if (url.pathname.startsWith("/api")) {
		const newUrl = new URL(url);
		newUrl.pathname = url.pathname.replace('/api', '');
		newResponse = env.API_WORKER.fetch(new Request(newUrl.toString(), request));
		newResponse.headers.set('Access-Control-Allow-Origin', '*');
		newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT');
		newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
		return newResponse;
	} else {
		return new Response('Not Found', { status: 404 });
	}
}
