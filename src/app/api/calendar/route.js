import { kv } from '@vercel/kv';

export async function GET() {
  const data = await kv.get('m-calendar-2026');
  return Response.json(data || {});
}

export async function POST(req) {
  const body = await req.json();
  await kv.set('m-calendar-2026', body);
  return Response.json({ ok: true });
}
