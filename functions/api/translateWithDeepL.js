export async function onRequest(context) {
	const { request, env } = context;
	if (request.method === "POST") {
		// 处理 POST 请求逻辑
		return new Response(JSON.stringify({ message: "Translation processed" }), {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*"
			},
			status: 200
		});
	} else {
		return new Response('Method not allowed', { status: 405 });
	}
}
