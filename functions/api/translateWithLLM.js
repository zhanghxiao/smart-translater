export async function onRequest(context) {
  const { request, env } = context;
    if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }
    try {
      return await env.API_WORKER.fetch(request);
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
}