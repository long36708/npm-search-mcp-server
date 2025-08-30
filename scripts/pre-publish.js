#!/usr/bin/env node

/**
 * 发布前检查脚本
 */

import fs from 'fs';
import path from 'path';

console.log('=== NPM 发布前检查 ===\n');

// 1. 检查必要文件
console.log('1. 检查必要文件:');
const requiredFiles = [
  'package.json',
  'README.md', 
  'LICENSE',
  'dist/src/index.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (缺失)`);
    allFilesExist = false;
  }
});

// 2. 检查package.json配置
console.log('\n2. 检查package.json配置:');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredFields = ['name', 'version', 'description', 'license', 'author'];
requiredFields.forEach(field => {
  if (pkg[field]) {
    console.log(`   ✅ ${field}: ${pkg[field]}`);
  } else {
    console.log(`   ❌ ${field}: 缺失`);
    allFilesExist = false;
  }
});

// 3. 检查bin文件是否可执行
console.log('\n3. 检查可执行文件:');
if (pkg.bin) {
  Object.entries(pkg.bin).forEach(([name, filePath]) => {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const isExecutable = stats.mode & parseInt('111', 8);
      if (isExecutable) {
        console.log(`   ✅ ${name}: ${filePath} (可执行)`);
      } else {
        console.log(`   ⚠️  ${name}: ${filePath} (不可执行)`);
      }
    } else {
      console.log(`   ❌ ${name}: ${filePath} (文件不存在)`);
      allFilesExist = false;
    }
  });
}

// 4. 检查dist目录
console.log('\n4. 检查编译输出:');
if (fs.existsSync('dist')) {
  const distFiles = fs.readdirSync('dist', { recursive: true });
  console.log(`   ✅ dist目录存在，包含 ${distFiles.length} 个文件`);
} else {
  console.log('   ❌ dist目录不存在，请先运行 npm run build');
  allFilesExist = false;
}

// 5. 显示将要发布的文件
console.log('\n5. 将要发布的文件:');
if (pkg.files) {
  pkg.files.forEach(file => {
    console.log(`   📦 ${file}`);
  });
} else {
  console.log('   ⚠️  未指定files字段，将发布所有文件');
}

// 6. 版本信息
console.log('\n6. 版本信息:');
console.log(`   📋 当前版本: ${pkg.version}`);
console.log(`   📋 包名: ${pkg.name}`);

// 7. 发布建议
console.log('\n7. 发布建议:');
if (allFilesExist) {
  console.log('   ✅ 所有检查通过，可以发布');
  console.log('\n发布命令:');
  console.log('   npm publish  # 发布包');
  console.log('   npm publish --dry-run  # 预览发布');
} else {
  console.log('   ❌ 存在问题，请修复后再发布');
}

console.log('\n=== 检查完成 ===');