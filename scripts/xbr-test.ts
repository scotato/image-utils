import fetch from "node-fetch";
import fs from "fs";
import path from "path";

// Define the path to the SVG file
const svgFilePath = path.join(__dirname, "../public/itemshop-modelo.svg");

// Read the SVG string from the file
const svgString = fs.readFileSync(svgFilePath, "utf-8");

// Define the endpoint URL

const endpointUrl = "https://baby-image-utils.vercel.app/api/xbr";
// const endpointUrl = "http://localhost:3000/api/xbr";

// Function to test the API endpoint
async function testApiEndpoint() {
  try {
    // Make the POST request with the SVG string
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ svgString }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the WebP image as a buffer
    const webpBuffer = await response.buffer();

    // Define the output path
    const outputFilePath = path.join(__dirname, "output.webp");

    // Save the WebP image to a file
    fs.writeFileSync(outputFilePath, webpBuffer);

    console.log("WebP image saved successfully to:", outputFilePath);
  } catch (error) {
    console.error("Error testing API endpoint:", error);
  }
}

// Run the test
testApiEndpoint();
