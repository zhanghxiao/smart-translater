export async function onRequest(context) {
	const { request } = context;
	// 临时响应所有请求，用于测试函数是否活跃
	return new Response('Hello from API function!', {
		status: 200,
		headers: {
			'Content-Type': 'text/plain',
			"Access-Control-Allow-Origin": "*"
		}
	});
}