const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function makeCircle() {
  const input = path.join(__dirname, "..", "public", "images", "logo.webp");
  const outputTransparent = path.join(
    __dirname,
    "..",
    "public",
    "images",
    "logo-circle.png"
  );
  const outputWhite = path.join(
    __dirname,
    "..",
    "public",
    "images",
    "logo-circle-white.png"
  );

  // Target size for email header
  const size = 96;

  // SVG circle mask
  const svg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
    </svg>`
  );

  try {
    // Resize logo to square, then apply circle mask to create transparent outside
    const img = sharp(input).resize(size, size, { fit: "cover" });
    await img
      .composite([{ input: svg, blend: "dest-in" }])
      .png({ quality: 90 })
      .toFile(outputTransparent);

    // Also create a version composited over a white square to avoid black corners in some email clients
    const whiteBg = await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: "#ffffff",
      },
    })
      .png()
      .toBuffer();

    const circledBuffer = await sharp(outputTransparent).toBuffer();
    await sharp(whiteBg)
      .composite([{ input: circledBuffer }])
      .png({ quality: 90 })
      .toFile(outputWhite);

    console.log("Created circular logo at:", outputTransparent);
    console.log("Created circular white logo at:", outputWhite);
  } catch (err) {
    console.error("Failed to create circular logo:", err);
    process.exit(1);
  }
}

makeCircle();
