export async function onRequest(context) {
	const { request, env } = context;
	const url = new URL(request.url);
	const action = url.searchParams.get("action");

	const headers = new Headers({
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	});

	if (request.method === "OPTIONS") {
		return new Response(null, { headers });
	}

	if (action) {
		url.searchParams.delete("action");
		let paramString = url.searchParams.toString();
		const newUrl = `${env.API_BASE_URL}/${action}${paramString ? '?' + paramString : ''}`;
		return env.API_WORKER.fetch(new Request(newUrl, {
			method: request.method,
			headers: request.headers,
			body: await request
		}));
	} else {
		return new Response('Method not allowed or action not specified', { status: 405, headers });
	}
}