import { NextResponse } from "next/server";

export async function POST() {
  try {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const functionId = process.env.APPWRITE_MOVE_FUNCTION_ID;

    if (!endpoint || !projectId || !functionId) {
      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, or APPWRITE_MOVE_FUNCTION_ID is not configured",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${endpoint.replace(/\/$/, "")}/functions/${encodeURIComponent(functionId)}/executions`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": projectId,
      },
      body: JSON.stringify({
        body: "{}",
        async: true,
        path: "/",
        method: "POST",
        headers: {},
      }),
      cache: "no-store",
      }
    );

    const text = await response.text();
    let result: unknown;

    try {
      result = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from move function", detail: text },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Unable to queue move function: HTTP ${response.status}`,
          detail: result,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ queued: true, execution: result }, { status: 202 });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Unable to execute move function", detail },
      { status: 500 }
    );
  }
}
