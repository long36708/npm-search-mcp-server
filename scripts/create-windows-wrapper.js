#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 创建Windows批处理文件
const cmdContent = `@echo off
node "%~dp0index.js" %*`;

const cmdPath = path.join('dist', 'src', 'index.cmd');

try {
  fs.writeFileSync(cmdPath, cmdContent);
  console.log('Windows wrapper created successfully:', cmdPath);
} catch (error) {
  console.error('Failed to create Windows wrapper:', error.message);
  process.exit(1);
}