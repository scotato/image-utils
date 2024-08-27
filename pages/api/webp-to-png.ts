import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { webpBase64 } = req.body;

      if (!webpBase64) {
        return res.status(400).json({ error: "webpBase64 string is required" });
      }

      // Decode the base64 string (remove the data URL prefix if present)
      const base64Data = webpBase64.replace(/^data:image\/webp;base64,/, "");
      const webpBuffer = Buffer.from(base64Data, "base64");

      // Convert WEBP to PNG using sharp and resize with max 640x640, maintaining aspect ratio
      const pngBuffer = await sharp(webpBuffer)
        .resize({
          width: 640,
          height: 640,
          fit: "inside", // Ensures the image fits within the 640x640 box without changing the aspect ratio
        })
        .png()
        .toBuffer();

      // Encode the PNG buffer to a base64 string
      const pngBase64 = pngBuffer.toString("base64");

      // Send the result back as a base64-encoded PNG
      res.status(200).json({ pngBase64: `data:image/png;base64,${pngBase64}` });
    } catch (error) {
      res.status(500).json({ error: "Error converting image" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
