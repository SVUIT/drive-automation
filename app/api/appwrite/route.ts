import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const appwriteUrl = process.env.APPWRITE_FUNCTION_URL;

    if (!appwriteUrl) {
      return NextResponse.json(
        { error: 'APPWRITE_FUNCTION_URL is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    const res = await fetch(appwriteUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await res.text();

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

  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[Appwrite proxy error]', detail);
    return NextResponse.json(
      { error: 'Internal proxy error', detail },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
