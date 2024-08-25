import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

type Data =
  | {
      top: number;
      left: number;
      width: number;
      height: number;
    }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { imageUrl } = req.query;

    if (typeof imageUrl !== "string") {
      return res.status(400).json({ error: "Image URL is required" });
    }

    // Fetch the image from the URL using fetch
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(400).json({ error: "Unable to fetch the image" });
    }

    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Use sharp to extract the alpha channel and find the bounding box
    const { info, data } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;

    let top = height;
    let left = width;
    let bottom = 0;
    let right = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[4 * (y * width + x) + 3];
        if (alpha > 0) {
          // Pixel is not transparent
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }

    const cropWidth = right - left + 1;
    const cropHeight = bottom - top + 1;

    return res
      .status(200)
      .json({ top, left, width: cropWidth, height: cropHeight });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
