import fetch from 'node-fetch'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform')
  const date = searchParams.get('date')
  const apiUrl = `https://post-enhancer-backend-apis-dot-dailysync-backend-service.et.r.appspot.com/best-time?platform=${platform}&date=${date}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
