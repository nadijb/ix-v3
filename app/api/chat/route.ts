import { NextRequest, NextResponse } from "next/server";

const N8N_BASE = process.env.N8N_BASE_URL ?? "";
const N8N_PATH = process.env.N8N_WEBHOOK_PATH ?? "webhook";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${N8N_BASE}/${N8N_PATH}/ix/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
