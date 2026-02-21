import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

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

    // Upload to Cloudinary using a promise to handle the stream
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "cafe-pos",
            resource_type: "auto",
            // Image Optimization: f_auto (format) and q_auto (quality)
            format: "webp", // Force webp or use f_auto
            transformation: [
              { quality: "auto", fetch_format: "auto" }
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
    };

    const result = (await uploadToCloudinary()) as any;

    return NextResponse.json({ 
      success: true,
      url: result.secure_url,
      name: result.public_id,
      size: result.bytes,
      width: result.width,
      height: result.height
    });

  } catch (error: any) {
    console.error("Critical Upload Error:", error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
