#!/usr/bin/env node

/**
 * Test script to verify Roblox MCP connection
 */

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

async function testConnection() {
  console.log('🧪 Testing Roblox MCP Connection...\n');

  try {
    // Create transport
    console.log('1️⃣  Creating stdio transport...');
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'robloxstudio-mcp']
    });

    // Create client
    console.log('2️⃣  Creating MCP client...');
    const client = new Client({
      name: 'roblox-mcp-test',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    // Connect
    console.log('3️⃣  Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected successfully!\n');

    // List available tools
    console.log('4️⃣  Fetching available tools...');
    const tools = await client.listTools();
    console.log(`✅ Found ${tools.tools.length} tools:\n`);

    tools.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name}`);
      if (tool.description) {
        console.log(`      ${tool.description}`);
      }
    });

    // Test a simple tool call - get project structure
    console.log('\n5️⃣  Testing get_project_structure tool...');
    const result = await client.callTool({
      name: 'get_project_structure',
      arguments: {}
    });

    console.log('✅ Tool call successful!');
    console.log('\n📊 Project structure:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n🎉 All tests passed! Roblox MCP is working correctly.');
    console.log('💡 You can now run: npm run build-mansion');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Make sure Roblox Studio is running');
    console.error('   2. Verify the MCP Plugin is installed and enabled');
    console.error('   3. Check that no other process is using port 3002');
    console.error('   4. Try restarting Roblox Studio');
    console.error('\n📝 Full error details:');
    console.error(error);
    process.exit(1);
  }
}

// Run test
testConnection();
