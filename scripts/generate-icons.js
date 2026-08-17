import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function generateIcons() {
  const svgSourcePath = path.join(rootDir, 'public', 'Mathmorph_logo.svg');

  if (!fs.existsSync(svgSourcePath)) {
    console.error(`Error: Source SVG file not found at ${svgSourcePath}`);
    process.exit(1);
  }

  console.log(`Reading source vector from: ${svgSourcePath}`);
  const svgBuffer = fs.readFileSync(svgSourcePath);

  // Targets definition
  const targets = [
    {
      outputPath: path.join(rootDir, 'public', 'Mathmorph_logo.png'),
      size: 1024,
      desc: '1024x1024 High-Res Logo',
      options: { quality: 100, compressionLevel: 9 },
    },
    {
      outputPath: path.join(rootDir, 'public', 'favicon.png'),
      size: 512,
      desc: '512x512 Standard Favicon',
      options: { quality: 100 },
    },
    {
      outputPath: path.join(rootDir, 'public', 'favicon.ico'),
      size: 64,
      desc: '64x64 Browser Favicon ICO',
      options: { quality: 100 },
    },
    {
      outputPath: path.join(rootDir, 'public', 'apple-touch-icon.png'),
      size: 180,
      desc: '180x180 Apple Touch Icon',
      options: { quality: 100 },
    },
  ];

  // Ensure directories exist
  for (const target of targets) {
    const dir = path.dirname(target.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  console.log('Generating icon assets via sharp...');

  for (const target of targets) {
    const buffer = await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png(target.options)
      .toBuffer();

    fs.writeFileSync(target.outputPath, buffer);
    const relPath = path.relative(rootDir, target.outputPath);
    console.log(`  ✓ Generated ${relPath} (${target.desc}) - ${(buffer.length / 1024).toFixed(1)} KB`);
  }

  console.log('\nAll icon and favicon assets generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
