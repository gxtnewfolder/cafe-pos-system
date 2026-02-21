import { NextResponse } from "next/server";
import { writeFile, mkdir, stat } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as unknown as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Standard Next.js server-side File/Blob handling
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file type
    const mimeType = file.type || "application/octet-stream";
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: `Invalid file type: ${mimeType}. Only JPEG, PNG, GIF, WebP are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max 5MB allowed." },
        { status: 400 }
      );
    }

    // Resolve public directory path
    const rootDir = process.cwd();
    const publicDir = path.join(rootDir, "public");
    const uploadsDir = path.join(publicDir, "uploads");

    // Ensure folders exist
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Ignore if exists
    }

    // Map extension
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    };
    const ext = mimeToExt[mimeType] || "bin";
    const filename = `upload-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Return the public URL
    const url = `/uploads/${filename}`;

    return NextResponse.json({ 
      success: true,
      url,
      name: filename,
      size: file.size
    });

  } catch (error: any) {
    console.error("Critical Upload Error:", error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
