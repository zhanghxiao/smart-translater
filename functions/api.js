// functions/api.js
export async function onRequest(context) {
	const { request, env } = context;
	const url = new URL(request.url);

	// 根据请求路径修改请求目的地
	if (url.pathname.startsWith("/api")) {
		return env.API_WORKER.fetch(new Request(url.toString().replace('/api', ''), request));
	}
	return new Response('Not Found', { status: 404 });
}
