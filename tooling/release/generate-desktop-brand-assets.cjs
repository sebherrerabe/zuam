const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const desktopDir = path.join(repoRoot, "packages", "desktop");
const outputDir = path.join(desktopDir, "assets");
const sourceSvgPath = path.join(repoRoot, "Logo svg.svg");

const colors = {
  surface: "#f5efe9",
  surfaceEdge: "#e5d5c7",
  brand: "#b7764b",
  brandDark: "#8f5f3d",
  ink: "#1e1612",
  muted: "#948b82",
  watermark: "rgba(183, 118, 75, 0.10)"
};

async function main() {
  const { chromium } = require(require.resolve("@playwright/test", {
    paths: [desktopDir]
  }));

  const logoSvg = fs.readFileSync(sourceSvgPath, "utf8");
  const logoSvgBase64 = Buffer.from(logoSvg, "utf8").toString("base64");

  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });

  const result = await page.evaluate(async ({ logoSvgBase64, colors }) => {
    const svgDataUrl = `data:image/svg+xml;base64,${logoSvgBase64}`;

    function roundedRect(ctx, x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    }

    async function loadImage(src) {
      const img = new Image();
      img.src = src;
      await img.decode();
      return img;
    }

    function createCanvas(width, height) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return canvas;
    }

    function toPngBase64(canvas) {
      return canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    }

    function snapshotRgba(canvas) {
      const ctx = canvas.getContext("2d");
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      return Array.from(data);
    }

    function drawLogoCard(ctx, logo, x, y, size, radius) {
      roundedRect(ctx, x, y, size, size, radius);
      ctx.fillStyle = colors.brand;
      ctx.fill();
      const padding = size * 0.18;
      ctx.drawImage(logo, x + padding, y + padding, size - padding * 2, size - padding * 2);
    }

    function drawWatermark(ctx, logo, width, height) {
      ctx.save();
      ctx.translate(width * 0.36, height * 0.62);
      ctx.rotate(-0.14);
      ctx.globalAlpha = 0.18;
      ctx.drawImage(logo, 0, 0, width * 0.72, width * 0.62);
      ctx.restore();
    }

    const logo = await loadImage(svgDataUrl);

    const iconSizes = [16, 24, 32, 48, 64, 128, 256];
    const iconPngs = {};

    for (const size of iconSizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext("2d");
      const padding = Math.max(1, Math.round(size * 0.05));
      const cardRadius = Math.max(3, Math.round(size * 0.18));
      drawLogoCard(ctx, logo, padding, padding, size - padding * 2, cardRadius);
      iconPngs[String(size)] = toPngBase64(canvas);
    }

    const iconCanvas = createCanvas(256, 256);
    const iconCtx = iconCanvas.getContext("2d");
    drawLogoCard(iconCtx, logo, 12, 12, 232, 44);

    const headerCanvas = createCanvas(150, 57);
    const headerCtx = headerCanvas.getContext("2d");
    headerCtx.fillStyle = colors.surface;
    headerCtx.fillRect(0, 0, 150, 57);
    headerCtx.strokeStyle = colors.surfaceEdge;
    headerCtx.lineWidth = 1;
    headerCtx.beginPath();
    headerCtx.moveTo(0, 56.5);
    headerCtx.lineTo(150, 56.5);
    headerCtx.stroke();
    drawLogoCard(headerCtx, logo, 8, 11, 28, 7);
    headerCtx.fillStyle = colors.ink;
    headerCtx.font = "700 17px Inter, 'Segoe UI', Arial, sans-serif";
    headerCtx.textBaseline = "middle";
    headerCtx.fillText("Zuam", 45, 25);

    const sidebarCanvas = createCanvas(164, 314);
    const sidebarCtx = sidebarCanvas.getContext("2d");
    sidebarCtx.fillStyle = colors.surface;
    sidebarCtx.fillRect(0, 0, 164, 314);
    drawWatermark(sidebarCtx, logo, 164, 314);
    sidebarCtx.fillStyle = colors.ink;
    sidebarCtx.font = "700 24px Inter, 'Segoe UI', Arial, sans-serif";
    drawLogoCard(sidebarCtx, logo, 20, 22, 46, 12);
    sidebarCtx.fillText("Zuam", 20, 98);
    sidebarCtx.fillStyle = colors.muted;
    sidebarCtx.font = "400 13px Inter, 'Segoe UI', Arial, sans-serif";
    sidebarCtx.fillText("Intentional focus", 20, 124);
    sidebarCtx.fillText("for daily work", 20, 143);
    sidebarCtx.fillStyle = colors.brandDark;
    roundedRect(sidebarCtx, 20, 182, 124, 64, 18);
    sidebarCtx.fill();
    sidebarCtx.fillStyle = "#ffffff";
    sidebarCtx.font = "700 14px Inter, 'Segoe UI', Arial, sans-serif";
    sidebarCtx.fillText("Warm Light", 36, 212);
    sidebarCtx.font = "400 12px Inter, 'Segoe UI', Arial, sans-serif";
    sidebarCtx.fillText("Desktop release", 36, 232);
    sidebarCtx.fillText("branding system", 36, 249);

    return {
      iconPngs,
      icon256: toPngBase64(iconCanvas),
      header: {
        width: headerCanvas.width,
        height: headerCanvas.height,
        rgba: snapshotRgba(headerCanvas)
      },
      sidebar: {
        width: sidebarCanvas.width,
        height: sidebarCanvas.height,
        rgba: snapshotRgba(sidebarCanvas)
      }
    };
  }, { logoSvgBase64, colors });

  await browser.close();

  const iconPngBuffers = Object.fromEntries(
    Object.entries(result.iconPngs).map(([size, base64]) => [size, Buffer.from(base64, "base64")])
  );

  fs.writeFileSync(path.join(outputDir, "icon.png"), Buffer.from(result.icon256, "base64"));
  fs.writeFileSync(path.join(outputDir, "icon.ico"), encodeIco(iconPngBuffers));
  fs.writeFileSync(
    path.join(outputDir, "installer-header.bmp"),
    encodeBmp(result.header.width, result.header.height, Uint8Array.from(result.header.rgba))
  );
  fs.writeFileSync(
    path.join(outputDir, "installer-sidebar.bmp"),
    encodeBmp(result.sidebar.width, result.sidebar.height, Uint8Array.from(result.sidebar.rgba))
  );
}

function encodeIco(iconPngBuffers) {
  const entries = Object.entries(iconPngBuffers)
    .map(([size, buffer]) => ({ size: Number(size), buffer }))
    .sort((a, b) => a.size - b.size);

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const directory = [];
  const payloads = [];

  for (const entry of entries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(entry.size >= 256 ? 0 : entry.size, 0);
    dir.writeUInt8(entry.size >= 256 ? 0 : entry.size, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(entry.buffer.length, 8);
    dir.writeUInt32LE(offset, 12);
    directory.push(dir);
    payloads.push(entry.buffer);
    offset += entry.buffer.length;
  }

  return Buffer.concat([header, ...directory, ...payloads]);
}

function encodeBmp(width, height, rgba) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const imageSize = rowSize * height;
  const fileHeaderSize = 14;
  const dibHeaderSize = 40;
  const pixelOffset = fileHeaderSize + dibHeaderSize;
  const fileSize = pixelOffset + imageSize;

  const fileHeader = Buffer.alloc(fileHeaderSize);
  fileHeader.write("BM", 0, 2, "ascii");
  fileHeader.writeUInt32LE(fileSize, 2);
  fileHeader.writeUInt32LE(pixelOffset, 10);

  const dibHeader = Buffer.alloc(dibHeaderSize);
  dibHeader.writeUInt32LE(dibHeaderSize, 0);
  dibHeader.writeInt32LE(width, 4);
  dibHeader.writeInt32LE(height, 8);
  dibHeader.writeUInt16LE(1, 12);
  dibHeader.writeUInt16LE(32, 14);
  dibHeader.writeUInt32LE(0, 16);
  dibHeader.writeUInt32LE(imageSize, 20);
  dibHeader.writeInt32LE(2835, 24);
  dibHeader.writeInt32LE(2835, 28);

  const pixelData = Buffer.alloc(imageSize);

  for (let y = 0; y < height; y += 1) {
    const sourceY = height - 1 - y;
    for (let x = 0; x < width; x += 1) {
      const sourceIndex = (sourceY * width + x) * 4;
      const targetIndex = (y * width + x) * 4;
      pixelData[targetIndex] = rgba[sourceIndex + 2];
      pixelData[targetIndex + 1] = rgba[sourceIndex + 1];
      pixelData[targetIndex + 2] = rgba[sourceIndex];
      pixelData[targetIndex + 3] = rgba[sourceIndex + 3];
    }
  }

  return Buffer.concat([fileHeader, dibHeader, pixelData]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
