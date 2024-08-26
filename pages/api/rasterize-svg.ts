// pages/api/rasterizeSvg.ts
import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

interface RasterizeSvgRequestBody {
  svg: string;
  width: number;
  height: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { svg, width, height }: RasterizeSvgRequestBody = req.body;

    if (!svg || !width || !height) {
      res
        .status(400)
        .json({ error: "SVG string, width, and height are required" });
      return;
    }

    // Convert SVG string to a rasterized PNG
    const imageBuffer = await sharp(Buffer.from(svg))
      .resize(width, height)
      .webp()
      .toBuffer();

    // Set the response content type to image/webp
    res.setHeader("Content-Type", "image/webp");
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to rasterize SVG" });
  }
}
