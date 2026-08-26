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
    // iOS App Icons (Universal, iPhone, iPad, App Store)
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-512@2x.png'),
      size: 1024,
      desc: '1024x1024 Universal / App Store Icon (Flattened RGB, No Alpha)',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-60x60@3x.png'),
      size: 180,
      desc: '180x180 iPhone App Icon 60pt@3x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-60x60@2x.png'),
      size: 120,
      desc: '120x120 iPhone App Icon 60pt@2x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-40x40@3x.png'),
      size: 120,
      desc: '120x120 iPhone Spotlight 40pt@3x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-40x40@2x.png'),
      size: 80,
      desc: '80x80 iPhone/iPad Spotlight 40pt@2x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-40x40@1x.png'),
      size: 40,
      desc: '40x40 iPad Spotlight 40pt@1x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-29x29@3x.png'),
      size: 87,
      desc: '87x87 iPhone Settings 29pt@3x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-29x29@2x.png'),
      size: 58,
      desc: '58x58 iPhone/iPad Settings 29pt@2x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-29x29@1x.png'),
      size: 29,
      desc: '29x29 iPad Settings 29pt@1x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-20x20@3x.png'),
      size: 60,
      desc: '60x60 iPhone Notification 20pt@3x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-20x20@2x.png'),
      size: 40,
      desc: '40x40 iPhone/iPad Notification 20pt@2x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-20x20@1x.png'),
      size: 20,
      desc: '20x20 iPad Notification 20pt@1x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-76x76@2x.png'),
      size: 152,
      desc: '152x152 iPad App Icon 76pt@2x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-76x76@1x.png'),
      size: 76,
      desc: '76x76 iPad App Icon 76pt@1x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-83.5x83.5@2x.png'),
      size: 167,
      desc: '167x167 iPad Pro App Icon 83.5pt@2x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    // Splash Screens
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset', 'splash-1x.png'),
      size: 910,
      desc: '910x910 iOS Universal Splash 1x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset', 'splash-2x.png'),
      size: 1820,
      desc: '1820x1820 iOS Universal Splash 2x',
      flatten: { r: 10, g: 10, b: 10 },
      options: { quality: 100, palette: false },
    },
    {
      outputPath: path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset', 'splash-3x.png'),
      size: 2730,
      desc: '2730x2730 iOS Universal Splash 3x',
      flatten: { r: 10, g: 10, b: 10 },
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
