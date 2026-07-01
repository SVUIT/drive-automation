import { NextRequest, NextResponse } from 'next/server';

const APPWRITE_URL = 'https://69c7e0fb00237ca9bdcc.syd.appwrite.run/';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Appwrite proxy] Request body:', JSON.stringify(body));

    const res = await fetch(APPWRITE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('[Appwrite proxy] Response status:', res.status);

    const text = await res.text();
    console.log('[Appwrite proxy] Raw response:', text);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Appwrite error: HTTP ${res.status}`, detail: text },
        { status: res.status }
      );
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      console.error('[Appwrite proxy] Failed to parse JSON:', text);
      return NextResponse.json({ error: 'Invalid JSON from Appwrite', raw: text }, { status: 502 });
    }

  } catch (err: any) {
    console.error('[Appwrite proxy error]', err?.message ?? err);
    return NextResponse.json(
      { error: 'Internal proxy error', detail: err?.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}