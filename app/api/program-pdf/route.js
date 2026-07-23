import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const programPdf = await getCollection("program_pdf");
  const doc = await programPdf.findOne({ id: "singleton" });
  if (!doc) {
    return NextResponse.json({ pdf_url: "", filename: "", updated_at: null });
  }
  return NextResponse.json(stripMongoId(doc));
}

export async function PUT(request) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can set the FAQ link." }, { status: 403 });
  }
  const { pdf_url, filename } = await request.json();
  if (!pdf_url) {
    return NextResponse.json({ detail: "A URL is required." }, { status: 400 });
  }

  const doc = {
    id: "singleton",
    pdf_url,
    filename: filename || "FAQ",
    updated_at: new Date().toISOString(),
  };
  const programPdf = await getCollection("program_pdf");
  await programPdf.replaceOne({ id: "singleton" }, doc, { upsert: true });
  return NextResponse.json(doc);
}

export async function DELETE() {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can clear the FAQ link." }, { status: 403 });
  }
  const programPdf = await getCollection("program_pdf");
  await programPdf.deleteOne({ id: "singleton" });
  return NextResponse.json({ detail: "Deleted." });
}
