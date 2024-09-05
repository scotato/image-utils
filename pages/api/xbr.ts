import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import fetch from "node-fetch";
import svg2img from "svg2img";
import { xbr2x, xbr3x, xbr4x } from "xbr-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }

  try {
    const { svgString, factor = 4 } = req.body;

    if (!svgString) {
      return res.status(400).json({ message: "SVG string is required" });
    }

    // Find all <image> tags in the SVG and replace src with base64 encoded PNG images
    const imageTagRegex = /<image[^>]+href="([^"]+)"[^>]*>/g;
    let modifiedSvgString = svgString;
    let match;
    while ((match = imageTagRegex.exec(svgString)) !== null) {
      const url = match[1];
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const webpBuffer = Buffer.from(arrayBuffer);

      // Convert WebP to PNG using sharp
      const pngBuffer = await sharp(webpBuffer).png().toBuffer();

      // Convert the PNG buffer to a base64 string
      const base64Image = `data:image/png;base64,${pngBuffer.toString(
        "base64"
      )}`;
      modifiedSvgString = modifiedSvgString.replace(url, base64Image);
    }

    // Convert SVG to PNG buffer
    const pngBuffer = await new Promise<Buffer>((resolve, reject) => {
      svg2img(
        modifiedSvgString,
        { width: 1024, height: 1024 },
        (error: Error | null, buffer: Buffer) => {
          if (error) return reject(error);
          resolve(buffer);
        }
      );
    });

    // Resize to 256x256
    const size = xbrSize(factor);
    const width = size;
    const height = size;
    const resizedBuffer = await sharp(pngBuffer)
      .resize(width, height, { kernel: sharp.kernel.nearest })
      .raw()
      .toBuffer();

    // Convert the raw buffer to a Uint32Array in ARGB format

    const uint32Array = new Uint32Array(new Uint8Array(resizedBuffer).buffer);

    // Apply 4x XBR upscaling
    const xbr = xbrFactor(factor);
    const xbrScaledArray = xbr(uint32Array, width, height);

    // Convert the Uint32Array back to a buffer
    const scaledImageBuffer = Buffer.from(
      xbrScaledArray.buffer,
      xbrScaledArray.byteOffset,
      xbrScaledArray.byteLength
    );

    // Convert the scaled image buffer back to an image format using sharp
    const finalImage = await sharp(scaledImageBuffer, {
      raw: { width: 1024, height: 1024, channels: 4 },
    })
      .webp()
      .toBuffer();

    // Send the final WebP image back
    res.setHeader("Content-Type", "image/webp");
    res.send(finalImage);
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ message: "Error processing image", error: error });
  }
}

function xbrFactor(factor: number) {
  switch (factor) {
    case 2:
      return xbr2x;
    case 3:
      return xbr3x;
    case 4:
      return xbr4x;
    default:
      throw new Error("Invalid XBR factor");
  }
}

function xbrSize(factor: number) {
  switch (factor) {
    case 2:
      return 512;
    case 3:
      return 384;
    case 4:
      return 256;
    default:
      throw new Error("Invalid XBR size factor");
  }
}
