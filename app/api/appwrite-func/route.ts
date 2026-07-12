import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const targetUrl = process.env.APPWRITE_FUNCTION_URL;

  if (!targetUrl) {
    console.error(
      "APPWRITE_FUNCTION_URL environment variable is not configured.",
    );
    return NextResponse.json(
      { error: "APPWRITE_FUNCTION_URL is not configured." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Appwrite function error response (${response.status}):`,
        errorText,
      );
      return NextResponse.json(
        { error: `Appwrite function returned status ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error calling Appwrite function proxy:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
