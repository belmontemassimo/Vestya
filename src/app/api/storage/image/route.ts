import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDownloadUrl } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = request.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  try {
    const url = await getDownloadUrl(key);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Failed to resolve image" }, { status: 500 });
  }
}
