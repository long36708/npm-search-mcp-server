#!/usr/bin/env node

/**
 * 检查NPM Search MCP Server混合模式配置的脚本
 */

console.log('=== NPM Search MCP Server 配置检查 ===\n');

// 检查运行模式
const npmRegistryUrl = process.env.NPM_REGISTRY_URL;
const useCliMode = !npmRegistryUrl;

console.log('1. 运行模式:');
if (useCliMode) {
  console.log('   当前模式: CLI模式 (使用 npm search 命令)');
  console.log('   配置来源: 继承用户npm配置');
  console.log('   特点: 零配置启动，与重构前行为一致');
} else {
  console.log('   当前模式: API模式 (直接调用Registry API)');
  console.log(`   Registry URL: ${npmRegistryUrl}/-/v1/search`);
  console.log('   配置来源: 环境变量 NPM_REGISTRY_URL');
  console.log('   特点: 自定义Registry，更快响应，更多功能');
}

console.log('\n2. 环境变量配置:');
if (npmRegistryUrl) {
  console.log(`   NPM_REGISTRY_URL = ${npmRegistryUrl}`);
} else {
  console.log('   NPM_REGISTRY_URL = (未设置)');
  console.log('   将使用CLI模式，继承npm配置');
}

// 3. 测试当前模式
console.log('\n3. 模式测试:');
if (useCliMode) {
  console.log('   测试方式: npm search 命令');
  
  // 测试npm search命令
  const { exec } = await import('child_process');
  const util = await import('util');
  const execPromise = util.promisify(exec);
  
  async function testCliMode() {
    try {
      console.log('   正在测试 npm search 命令...');
      const { stdout, stderr } = await execPromise('npm search react --json');
      
      if (stderr && !stderr.includes('WARN')) {
        console.log(`   ❌ CLI模式测试失败: ${stderr}`);
      } else {
        console.log('   ✅ CLI模式测试成功');
        try {
          const data = JSON.parse(stdout);
          console.log(`   📦 找到 ${data.length} 个包`);
        } catch (e) {
          console.log('   📦 搜索命令执行成功');
        }
      }
    } catch (error) {
      console.log(`   ❌ CLI模式测试失败: ${error.message}`);
      console.log('   💡 请确保npm已正确安装并配置');
    }
  }
  
  testCliMode();
} else {
  console.log('   测试方式: HTTP API调用');
  const testUrl = `${npmRegistryUrl.replace(/\/$/, '')}/-/v1/search?text=react&size=1`;
  console.log(`   测试URL: ${testUrl}`);
  
  // 测试API连接
  async function testApiMode() {
    try {
      const response = await fetch(testUrl);
      if (response.ok) {
        console.log('   ✅ API模式测试成功');
        const data = await response.json();
        console.log(`   📦 找到 ${data.total || 0} 个包`);
      } else {
        console.log(`   ❌ API模式测试失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ API模式测试失败: ${error.message}`);
    }
  }
  
  testApiMode();
}

// 4. 显示其他相关环境变量
console.log('\n4. 其他相关环境变量:');
const relatedVars = ['NODE_ENV', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY'];
relatedVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`   ${varName} = ${value || '(未设置)'}`);
});

// 5. 显示使用建议
console.log('\n5. 使用建议:');
if (useCliMode) {
  console.log('   💡 当前使用CLI模式，与重构前行为一致');
  console.log('   💡 如需启用API模式的高级功能，请设置:');
  console.log('      export NPM_REGISTRY_URL="https://registry.npmjs.org"');
  console.log('   💡 或使用镜像加速:');
  console.log('      export NPM_REGISTRY_URL="https://registry.npmmirror.com"');
} else {
  console.log('   💡 当前使用API模式，支持高级功能');
  console.log('   💡 如需恢复CLI模式（零配置），请执行:');
  console.log('      unset NPM_REGISTRY_URL');
}

console.log('\n6. 模式对比:');
console.log('   CLI模式特点:');
console.log('     ✅ 零配置启动');
console.log('     ✅ 继承npm配置');
console.log('     ✅ 支持企业内网');
console.log('     ✅ 与重构前一致');
console.log('   API模式特点:');
console.log('     ✅ 自定义Registry');
console.log('     ✅ 更快响应速度');
console.log('     ✅ 更详细包信息');
console.log('     ✅ 支持下载统计');

console.log('\n7. 常用registry地址:');
console.log('   官方NPM:     https://registry.npmjs.org');
console.log('   淘宝镜像:    https://registry.npmmirror.com');
console.log('   腾讯镜像:    https://mirrors.cloud.tencent.com/npm');
console.log('   华为镜像:    https://mirrors.huaweicloud.com/repository/npm');

// 延迟结束，等待异步测试完成
setTimeout(() => {
  console.log('\n=== 配置检查完成 ===');
}, 2000);