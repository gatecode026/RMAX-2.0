const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ImageKit = require('imagekit');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ik = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Definition of media to upload per product
const PRODUCT_MEDIA_MAPPINGS = {
  '50-pad-sanitary-napkin-vending-machine': [
    { file: 'src/images/20260123_133958.jpg', type: 'main', alt: '50-Pad Sanitary Napkin Vending Machine – Designer Floral Front' },
    { file: 'src/images/20260123_133916.jpg', type: 'gallery', alt: '50-Pad Vending Machine – Dual Coin Mechanism and Chrome Knobs' },
    { file: 'src/images/20260123_133920.jpg', type: 'gallery', alt: '50-Pad Vending Machine – Coin Insertion Slot & Operation Knobs Close-Up' },
    { file: 'src/images/20260123_133858.jpg', type: 'gallery', alt: '50-Pad Vending Machine – Slim Side Profile and Wall Mounting Holes' },
    { file: 'src/images/20260123_134009.jpg', type: 'gallery', alt: '50-Pad Vending Machine – Institutional Installation View' },
  ],
  '30-pad-sanitary-napkin-vending-machine': [
    { file: 'src/images/20260123_133148.jpg', type: 'main', alt: '30-Pad Sanitary Napkin Vending Machine – Compact Coin-Operated Dispenser' },
    { file: 'src/images/20260123_133044.jpg', type: 'gallery', alt: '30-Pad Vending Machine – Compact Side Profile & Wall-Mounting Bracket' },
    { file: 'src/images/20260123_133207.jpg', type: 'gallery', alt: '30-Pad Vending Machine – Single Coin Acceptance Mechanism' },
    { file: 'src/images/20260123_133331.jpg', type: 'gallery', alt: '30-Pad Vending Machine – Slim Depth and Metal Casing' },
    { file: 'public/images/about/vending.png', type: 'gallery', alt: '30-Pad Vending Machine – Studio Render' },
  ],
  '100-pad-sanitary-napkin-vending-machine': [
    { file: 'src/images/20260123_131913.jpg', type: 'main', alt: '100-Pad Sanitary Napkin Vending Machine – Heavy Steel Body Unit' },
    { file: 'src/images/20260123_131918.jpg', type: 'gallery', alt: '100-Pad Vending Machine – Deep Storage Cabinet Side Profile' },
    { file: 'src/images/20260123_131932.jpg', type: 'gallery', alt: '100-Pad Vending Machine – Wall-Mount Lock & Key Security' },
    { file: 'src/images/20260123_131944.jpg', type: 'gallery', alt: '100-Pad Vending Machine – High Capacity Angle View' },
    { file: 'src/images/20260123_131421.jpg', type: 'gallery', alt: '100-Pad Vending Machine – Dual Spiral Dispensing Coil System' },
  ],
  'automatic-sanitary-napkin-vending-machine': [
    { file: 'src/images/20260123_131830.jpg', type: 'main', alt: 'Automatic Sanitary Napkin Vending Machine – Front View with LCD Display' },
    { file: 'src/images/20260123_131836.jpg', type: 'gallery', alt: 'Automatic Vending Machine – Operating Instructions and Indicator Panel' },
    { file: 'src/images/20260123_131839.jpg', type: 'gallery', alt: 'Automatic Vending Machine – Full Perspective View' },
    { file: 'src/images/20260123_131432.jpg', type: 'gallery', alt: 'Automatic Vending Machine – Motorized Dispenser Coil & Electronic PCB' },
    { file: 'public/images/products/catalog/auto-vending-detail.jpg', type: 'gallery', alt: 'Automatic Vending Machine – Digital Coin & Pad Controller' },
  ],
  'push-button-sanitary-napkin-vending-machine': [
    { file: 'src/images/20260123_131254.jpg', type: 'main', alt: 'Push-Button Sanitary Napkin Vending Machine – One-Touch Dispenser' },
    { file: 'src/images/20260123_131312.jpg', type: 'gallery', alt: 'Push-Button Vending Machine – Side Wall Mount Perspective' },
    { file: 'src/images/20260123_131331.jpg', type: 'gallery', alt: 'Push-Button Vending Machine – Dispensing Shutter View' },
    { file: 'src/images/20260123_131421.jpg', type: 'gallery', alt: 'Push-Button Vending Machine – Mechanical Coil Mechanism' },
    { file: 'public/images/products/catalog/manual-vending-catalog.jpg', type: 'gallery', alt: 'Push-Button Vending Machine – Catalog Product View' },
  ],
  'sanitary-pad-disposal-machine-100-pad': [
    { file: 'public/images/home/testimonial-basic-clean.png', type: 'main', alt: 'Sanitary Pad Disposal Machine – 100 Pad Basic Incinerator' },
    { file: 'src/images/20260123_121727.jpg', type: 'gallery', alt: '100-Pad Incinerator – Digital Display and Start Button' },
    { file: 'src/images/20260123_121930.jpg', type: 'gallery', alt: '100-Pad Incinerator – Stainless Steel Flexible Exhaust Duct' },
    { file: 'src/images/20260123_122042.jpg', type: 'gallery', alt: '100-Pad Incinerator – Heavy Wall Mounting Plate & Heat Shield' },
    { file: 'src/images/20260123_122139.jpg', type: 'gallery', alt: '100-Pad Incinerator – Bottom Ash Collection Tray Removal' },
  ],
  'sanitary-pad-disposal-machine': [
    { file: 'public/images/products/testimonial-pro-clean.png', type: 'main', alt: 'Sanitary Pad Disposal Machine – Standard Pro Incinerator' },
    { file: 'src/images/20260123_130608.jpg', type: 'gallery', alt: 'Pro Incinerator – Deep Heavy-Duty Combustion Chamber' },
    { file: 'src/images/20260123_130801.jpg', type: 'gallery', alt: 'Pro Incinerator – Chimney & Exhaust Emission Flue' },
    { file: 'src/images/20260123_131038.jpg', type: 'gallery', alt: 'Pro Incinerator – Ergonomic Ash Drawer and Side Thermostat' },
    { file: 'src/images/20261031_104637.jpg', type: 'gallery', alt: 'Pro Incinerator – Factory Assembly Demonstration' },
  ],
  'sanitary-pad-disposal-machine-500-pad': [
    { file: 'public/images/dashboard/promax-render.jpg', type: 'main', alt: 'Sanitary Pad Disposal Machine – 500 Pad Commercial Pro-Max Incinerator' },
    { file: 'public/images/products/promax-transparent.png', type: 'gallery', alt: 'Pro-Max Incinerator – High Capacity Commercial Unit' },
    { file: 'public/images/products/portrait-pro-max.png', type: 'gallery', alt: 'Pro-Max Incinerator – Front Elevation with Digital PLC' },
    { file: 'public/images/products/list-pro-max.png', type: 'gallery', alt: 'Pro-Max Incinerator – Heavy Industrial Specification' },
    { file: 'public/images/products/hero-lineup.png', type: 'gallery', alt: 'Pro-Max Incinerator – RMAX Hygiene Lineup' },
  ],
  'complete-pwmu-setup': [
    { file: 'page1_montage.jpg', type: 'main', alt: 'Complete Plastic Waste Management Unit (PWMU) – Turnkey Plant Setup' },
    { file: 'public/images/products/dust-remover/main.jpg', type: 'gallery', alt: 'PWMU Plant – Dust Remover Contaminant Separation Stage' },
    { file: 'public/images/products/plastic-waste-shredder-machine/main.jpg', type: 'gallery', alt: 'PWMU Plant – Plastic Waste Shredder with Weighing Scale' },
    { file: 'public/images/products/plastic-bailing-machine/main.jpg', type: 'gallery', alt: 'PWMU Plant – Hydraulic Baling Press for Compact Bales' },
  ],
};

// Complete price and spec dictionary for all 26 products
const PRODUCT_DATA_UPDATES = {
  'sanitary-pad-disposal-machine-100-pad': {
    price: 3000, originalPrice: 6000, discountPercent: 50,
    specs: { power: '800 W', weight: '8kg', dailyCapacity: '80–100 / day', colours: 'Blue / Pink', warranty: '1 Year' }
  },
  'sanitary-pad-disposal-machine': {
    price: 4500, originalPrice: 9000, discountPercent: 50,
    specs: { power: '1200 W', weight: '14kg', dailyCapacity: '150–200 / day', colours: 'Blue / Off-White', warranty: '1 Year' }
  },
  'sanitary-pad-disposal-machine-500-pad': {
    price: 6500, originalPrice: 13000, discountPercent: 50,
    specs: { power: '2000 W', weight: '28kg', dailyCapacity: '500 / day', colours: 'Commercial MS', warranty: '1 Year' }
  },
  '30-pad-sanitary-napkin-vending-machine': {
    price: 7500, originalPrice: 15000, discountPercent: 50,
    specs: { dailyCapacity: '30 pads', power: 'Manual (No Power)', weight: '6.5 kg', colours: 'Ivory / Blue', warranty: '1 Year' }
  },
  '50-pad-sanitary-napkin-vending-machine': {
    price: 9500, originalPrice: 19000, discountPercent: 50,
    specs: { dailyCapacity: '50 pads', power: 'Manual (No Power)', weight: '9 kg', colours: 'Designer Floral', warranty: '1 Year' }
  },
  '100-pad-sanitary-napkin-vending-machine': {
    price: 14500, originalPrice: 29000, discountPercent: 50,
    specs: { dailyCapacity: '100 pads', power: 'Manual / Dual Coil', weight: '14 kg', colours: 'Industrial Steel', warranty: '1 Year' }
  },
  'automatic-sanitary-napkin-vending-machine': {
    price: 18500, originalPrice: 37000, discountPercent: 50,
    specs: { dailyCapacity: '50 pads', power: '230V AC / Battery Backup', weight: '11 kg', colours: 'Pink / Royal Blue', warranty: '1 Year' }
  },
  'push-button-sanitary-napkin-vending-machine': {
    price: 11000, originalPrice: 22000, discountPercent: 50,
    specs: { dailyCapacity: '50 pads', power: 'Manual Push Button', weight: '8.5 kg', colours: 'White / Blue', warranty: '1 Year' }
  },
  'baby-diaper-vending-machine': {
    price: 24000, originalPrice: 48000, discountPercent: 50,
    specs: { dailyCapacity: '40–60 Diapers', power: 'Coin Operated', weight: '16 kg', colours: 'Pastel Blue / White', warranty: '1 Year' }
  },
  'cloth-bag-vending-machine': {
    price: 28000, originalPrice: 56000, discountPercent: 50,
    specs: { dailyCapacity: '75 Cloth Bags', power: 'Coin / Token Mech', weight: '22 kg', colours: 'Eco Green / White', warranty: '1 Year' }
  },
  'dust-remover-machine': {
    price: 185000, originalPrice: 265000, discountPercent: 30,
    specs: { dailyCapacity: '120–200 kg/hr', power: '10–15 HP Motor', weight: '850 kg', chamber: '915 mm x 2100 mm Drum', warranty: '1 Year' }
  },
  'plastic-waste-shredder-machine': {
    price: 245000, originalPrice: 350000, discountPercent: 30,
    specs: { dailyCapacity: '1 Tonne/day', power: '10 HP Motor', weight: '650 kg', chamber: '4 Rotary + 2 Stationary Blades', warranty: '1 Year' }
  },
  'plastic-bailing-machine': {
    price: 275000, originalPrice: 395000, discountPercent: 30,
    specs: { dailyCapacity: '50–60 kg Bale', power: '7.5 HP Hydraulic Motor', weight: '920 kg', chamber: '700 x 500 x 1400 mm', warranty: '1 Year' }
  },
  'complete-pwmu-setup': {
    price: 850000, originalPrice: 1200000, discountPercent: 29,
    specs: { dailyCapacity: '1–2 Tonnes / Day', power: '30–45 HP Connected', weight: 'Turnkey Plant', chamber: 'Complete Integrated Unit', warranty: '1 Year' }
  },
  'plastic-bottle-crusher-machine': {
    price: 850000 / 10, originalPrice: 120000, discountPercent: 29,
    specs: { dailyCapacity: '300–500 Bottles/hr', power: '2 HP Single Phase', weight: '110 kg', colours: 'Industrial Yellow/Black', warranty: '1 Year' }
  },
  'wet-dry-dustbins': {
    price: 4500, originalPrice: 7500, discountPercent: 40,
    specs: { dailyCapacity: '100–120 Litres', power: 'Non-Electric', weight: '8 kg', colours: 'Green (Wet) / Blue (Dry)', warranty: '1 Year' }
  },
  'wheelbarrows': {
    price: 3800, originalPrice: 6000, discountPercent: 37,
    specs: { dailyCapacity: '150 kg Payload', power: 'Manual Push', weight: '18 kg', colours: 'Industrial MS Paint', warranty: '1 Year' }
  },
  'mobile-toilets': {
    price: 32000, originalPrice: 48000, discountPercent: 33,
    specs: { dailyCapacity: 'Single User FRP Cabin', power: 'Ventilated / Gravity', weight: '85 kg', colours: 'Sky Blue / White', warranty: '1 Year' }
  },
  'composting-machine': {
    price: 195000, originalPrice: 280000, discountPercent: 30,
    specs: { dailyCapacity: '50–100 kg / Day', power: '3 HP Motor with Heater', weight: '340 kg', colours: 'Stainless Steel / Green', warranty: '1 Year' }
  },
  'toilet-feedback-machine': {
    price: 12500, originalPrice: 25000, discountPercent: 50,
    specs: { dailyCapacity: 'Real-Time Cloud Logging', power: 'Battery + 5V DC Adaptor', weight: '1.2 kg', colours: 'White / 3-Tone Smileys', warranty: '1 Year' }
  },
  'gps-trackers': {
    price: 2800, originalPrice: 5600, discountPercent: 50,
    specs: { dailyCapacity: 'Live 10s Updates', power: '9–36V DC Automotive', weight: '90 g', colours: 'Matte Black', warranty: '1 Year' }
  },
  'usb-gps-receiver': {
    price: 1400, originalPrice: 2800, discountPercent: 50,
    specs: { dailyCapacity: '50-Channel High Precision', power: '5V USB Bus Powered', weight: '45 g', colours: 'Black', warranty: '1 Year' }
  },
  'max-can-obd-scanner': {
    price: 6500, originalPrice: 13000, discountPercent: 50,
    specs: { dailyCapacity: 'J1939 / OBD-II Telemetry', power: '12V / 24V OBD Port', weight: '160 g', colours: 'Industrial Black/Red', warranty: '1 Year' }
  },
  'led-advertisement-screens': {
    price: 45000, originalPrice: 75000, discountPercent: 40,
    specs: { dailyCapacity: 'Daylight 6500 Nits', power: '250W Max', weight: '14 kg', colours: 'Full Color RGB', warranty: '1 Year' }
  },
  'smart-iot-sensors': {
    price: 3500, originalPrice: 7000, discountPercent: 50,
    specs: { dailyCapacity: 'Temp/Humidity/Air Quality', power: 'Ultra-Low Power Battery', weight: '110 g', colours: 'White ABS', warranty: '1 Year' }
  },
  'home-automation-solutions': {
    price: 18500, originalPrice: 37000, discountPercent: 50,
    specs: { dailyCapacity: '8-Channel Smart Controller', power: '230V AC / Wi-Fi & Zigbee', weight: '650 g', colours: 'Black Glass / ABS', warranty: '1 Year' }
  },
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully!');
  const col = mongoose.connection.collection('products');

  // 1. Process media uploads for products with real photos
  for (const [slug, mediaList] of Object.entries(PRODUCT_MEDIA_MAPPINGS)) {
    console.log(`\n--- Uploading media for ${slug} (${mediaList.length} files) ---`);
    const galleryItems = [];
    const imagesItems = [];
    let primaryImage = null;

    for (let i = 0; i < mediaList.length; i++) {
      const { file, type, alt } = mediaList[i];
      if (!fs.existsSync(file)) {
        console.warn(`File not found: ${file}`);
        continue;
      }

      console.log(`Converting to WebP & uploading [${i + 1}/${mediaList.length}]: ${file}`);
      const baseName = path.basename(file, path.extname(file));
      const webpBuf = await sharp(file)
        .rotate()
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88, effort: 4 })
        .toBuffer();

      const meta = await sharp(webpBuf).metadata();
      const folder = `/rmax/products/${slug}/${type === 'main' ? 'main' : 'gallery'}`;
      const fileName = `${slug}-${baseName}-${Date.now()}.webp`;

      const uploaded = await ik.upload({
        file: webpBuf,
        fileName,
        folder,
        useUniqueFileName: true,
      });

      console.log(`Uploaded -> ${uploaded.url}`);

      const imgDoc = {
        fileId: uploaded.fileId,
        url: uploaded.url,
        filePath: uploaded.filePath,
        type: type === 'main' ? 'main' : 'gallery',
        alt,
        isPrimary: type === 'main' || i === 0,
        sortOrder: i,
        width: meta.width || 800,
        height: meta.height || 800,
      };
      imagesItems.push(imgDoc);

      const galItem = {
        src: uploaded.url,
        thumb: uploaded.url,
        alt,
        kind: 'image',
      };
      galleryItems.push(galItem);

      if (type === 'main' || i === 0) {
        primaryImage = {
          src: uploaded.url,
          alt,
          width: meta.width || 800,
          height: meta.height || 800,
        };
      }
    }

    if (galleryItems.length > 0) {
      const updateDoc = {
        $set: {
          gallery: galleryItems,
          images: imagesItems,
          image: primaryImage,
          cardImage: primaryImage,
          portraitImage: primaryImage,
          listImage: primaryImage,
          overviewImage: primaryImage,
        }
      };
      await col.updateOne({ slug }, updateDoc);
      console.log(`Updated database gallery for ${slug} (${galleryItems.length} images)`);
    }
  }

  // 2. Update price, originalPrice, discountPercent, and specs for all products
  console.log('\n--- Updating commercial prices and specifications across all products ---');
  for (const [slug, data] of Object.entries(PRODUCT_DATA_UPDATES)) {
    const res = await col.updateOne(
      { slug },
      {
        $set: {
          price: data.price,
          originalPrice: data.originalPrice,
          discountPercent: data.discountPercent,
          specs: data.specs,
        }
      }
    );
    console.log(`Updated price for ${slug}: ₹${data.price} (MRP: ₹${data.originalPrice}, ${data.discountPercent}% OFF)`);
  }

  console.log('\nAll products updated successfully!');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
