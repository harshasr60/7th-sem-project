import { NextResponse } from "next/server";
import pdfParse from "pdf-parse-fixed";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert uploaded file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Parse the PDF text
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text || "";

    if (!text.trim()) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
    }

    // 🧮 Basic ATS logic (keyword + word count scoring)
    const keywords = ["skills", "experience", "education", "project", "developer"];
    const keywordMatches = keywords.filter((word) =>
      text.toLowerCase().includes(word)
    ).length;

    const wordCount = text.split(/\s+/).length;
    const score = Math.min(100, Math.round((keywordMatches / keywords.length) * 70 + wordCount / 100));

    return NextResponse.json({
      score,
      summary: `✅ Found ${wordCount} words and ${keywordMatches} key terms.`,
    });
  } catch (error) {
    console.error("❌ Error parsing PDF:", error);
    return NextResponse.json(
      { error: "Failed to parse PDF", details: error.message },
      { status: 500 }
    );
  }
}
