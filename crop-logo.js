const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function cropLogo() {
  try {
    // Read the original logo
    const inputPath = path.join(__dirname, "public/images/logo.webp");
    const outputPath = path.join(__dirname, "public/images/logo-cropped.webp");

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;

    // Calculate the size of the circular logo (assuming it's roughly square and centered)
    // Logo appears to be circular, so we crop to a square centered on the circle
    const size = Math.min(width, height) * 0.8; // 80% of the smaller dimension
    const left = (width - size) / 2;
    const top = (height - size) / 2;

    // Crop and resize
    await sharp(inputPath)
      .extract({
        left: Math.round(left),
        top: Math.round(top),
        width: Math.round(size),
        height: Math.round(size),
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log("Logo cropped successfully to:", outputPath);
  } catch (error) {
    console.error("Error cropping logo:", error);
  }
}

cropLogo();
