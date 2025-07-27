#!/usr/bin/env node

console.log('🧪 Running pre-build validation...\n');

// Test 1: Check if critical files exist
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'src/app/page.tsx',
  'src/lib/env.ts',
  'src/lib/web3.ts',
  'src/lib/ipfs.ts',
  'src/components/Providers.tsx',
  'next.config.ts',
  'package.json'
];

let allFilesExist = true;

console.log('📁 Checking critical files...');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some critical files are missing!');
  process.exit(1);
}

// Test 2: Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@rainbow-me/rainbowkit',
  '@tanstack/react-query',
  'ethers',
  'next',
  'react',
  'wagmi',
  'socket.io-client'
];

let allDepsPresent = true;
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    allDepsPresent = false;
  }
});

if (!allDepsPresent) {
  console.log('\n❌ Some required dependencies are missing!');
  process.exit(1);
}

// Test 3: Check for problematic imports
console.log('\n🔍 Checking for problematic imports...');
const problematicImports = ['ipfs-http-client', 'electron'];

function checkFileForProblematicImports(filePath) {
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, 'utf8');
  const found = [];
  
  problematicImports.forEach(imp => {
    if (content.includes(`from '${imp}'`) || content.includes(`from "${imp}"`)) {
      found.push(imp);
    }
  });
  
  return found;
}

const filesToCheck = [
  'src/app/page.tsx',
  'src/lib/ipfs.ts',
  'src/lib/web3.ts'
];

let hasProblematicImports = false;
filesToCheck.forEach(file => {
  const problematic = checkFileForProblematicImports(file);
  if (problematic.length > 0) {
    console.log(`❌ ${file} contains problematic imports: ${problematic.join(', ')}`);
    hasProblematicImports = true;
  } else {
    console.log(`✅ ${file}`);
  }
});

if (hasProblematicImports) {
  console.log('\n❌ Found problematic imports that may cause build issues!');
  process.exit(1);
}

console.log('\n🎉 Pre-build validation passed!');
console.log('Ready to build the application.');
