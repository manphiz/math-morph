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
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-512@2x.png'),
      size: 1024,
      desc: '1024x1024 Universal iOS App Icon (Flattened RGB, No Alpha)',
      flatten: '#0a0a0a',
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset', 'splash-1x.png'),
      size: 910,
      desc: '910x910 iOS Universal Splash 1x',
      flatten: '#0a0a0a',
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset', 'splash-2x.png'),
      size: 1820,
      desc: '1820x1820 iOS Universal Splash 2x',
      flatten: '#0a0a0a',
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset', 'splash-3x.png'),
      size: 2730,
      desc: '2730x2730 iOS Universal Splash 3x',
      flatten: '#0a0a0a',
      options: { quality: 100, palette: false },
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
    let pipeline = sharp(svgBuffer).resize(target.size, target.size);
    if (target.flatten) {
      pipeline = pipeline.flatten({ background: target.flatten });
    }
    const buffer = await pipeline.png(target.options).toBuffer();

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
