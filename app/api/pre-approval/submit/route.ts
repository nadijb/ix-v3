import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const base = process.env.N8N_BASE_URL;
  const path = process.env.N8N_WEBHOOK_PATH ?? "webhook";

  try {
    const res = await fetch(`${base}/${path}/ix/pre-approval/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `n8n error ${res.status}`, detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach n8n", detail: String(err) },
      { status: 502 }
    );
  }
}
