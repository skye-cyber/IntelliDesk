// generate-linux-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
//const pngToIco = require('png-to-ico');

const baseImageName = 'quickai';
const baseImagePath = `../assets/${baseImageName}.png`;
const IconsoutputDir = '../icons';
// Directory containing the icon PNG files
const iconDir = path.join(__dirname, '../icons');
const outputDir = path.join(__dirname, '../assets');
const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
const { Icns, IcnsImage } = require('@fiahfy/icns');
//const { PNG } = require('pngjs');

async function generateIcons() {
    if (!fs.existsSync(baseImagePath)) {
        console.error(`❌ Base image not found: ${baseImagePath}`);
        process.exit(1);
    }

    fs.mkdirSync(IconsoutputDir, { recursive: true });

    for (const size of sizes) {
        const outputFile = path.join(IconsoutputDir, `${size}x${size}.png`);
        try {
            await sharp(baseImagePath)
                .resize(size, size)
                .toFile(outputFile);
            console.log(`✔️  Created: ${outputFile}`);
        } catch (err) {
            console.error(`❌ Failed to create icon at ${size}x${size}:`, err);
        }
    }

    console.log('\n🎉 Linux icon set (flat structure) generation complete!');
}


async function createIcns() {
    const icns = new Icns();

    for (const size of sizes) {
        const pngPath = path.join(iconDir, `${size}x${size}.png`);
        if (!fs.existsSync(pngPath)) {
            console.warn(`⚠️ Skipping missing file: ${pngPath}`);
            continue;
        }

        const buffer = fs.readFileSync(pngPath);
        const osType = getOSType(size);
        if (!osType) {
            console.warn(`⚠️ Unsupported size: ${size}x${size}`);
            continue;
        }

        const image = IcnsImage.fromPNG(buffer, osType);
        icns.append(image);
    }

    const outputPath = path.join(outputDir, `${baseImageName}.icns`);
    fs.writeFileSync(outputPath, icns.data);
    console.log(`✅ .icns file created at: ${outputPath}`);
}

function getOSType(size) {
    const osTypeMap = {
        16: 'icp4',
        32: 'icp5',
        64: 'icp6',
        128: 'ic07',
        256: 'ic08',
        512: 'ic09',
        1024: 'ic10',
    };
    return osTypeMap[size];
}

// Function to create .ico file
async function createIco() {
    const icoFiles = sizes.map(size => path.join(iconDir, `${size}x${size}.png`)).join(' ');
    const icoCommand = `convert ${icoFiles} ${outputDir}/${baseImageName}.ico`;

    exec(icoCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error creating .ico file: ${stderr}`);
            return;
        }
        console.log(`Created .ico file: ${stdout}`);
    });
}

// Function to extract images from .icns file
function extractImages(type = 'icns') {
    const icnsFile = path.join(outputDir, `${baseImageName}.${type}`);

    // Filter only standard sizes for ICNS
    const validSizes = type === 'icns'
    ? sizes.filter(s => s !== 48) // ICNS does not support 48x48
    : sizes;

    validSizes.forEach(size => {
        const outputFile = `../assets/drafts/${size}x${size}.png`;
        const command = `convert "${icnsFile}[${size}x${size}]" "${outputFile}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Failed to extract ${size}x${size}:`, stderr.trim());
            } else {
                console.log(`✔️  Extracted ${size}x${size} → ${outputFile}`);
            }
        });
    });
}


async function init(what = 'all') {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    if (what === "all") {
        await generateIcons();
        await createIcns();
        await createIco();
    } else if (what === 'ico') {
        await createIco();
    } else if (what === 'icns') {
        await createIcns();
    } else {
        await createIco();
        await createIcns();
    }
}

const what = process.argv[2] || 'all';
init(what);
//extractImages()
