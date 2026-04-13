#!/usr/bin/env node

/**
 * Roblox Mega Mansion Builder
 * Uses the robloxstudio-mcp server to build an impressive multi-story mansion
 */

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');

class RobloxMansionBuilder {
  constructor() {
    this.client = null;
    this.basePosition = { x: 0, y: 5, z: 0 };
  }

  async connect() {
    console.log('🔌 Connecting to Roblox MCP Server...');

    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'robloxstudio-mcp']
    });

    this.client = new Client({
      name: 'mega-mansion-builder',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await this.client.connect(transport);
    console.log('✅ Connected to Roblox MCP Server');
  }

  async callTool(toolName, args) {
    const result = await this.client.callTool({
      name: toolName,
      arguments: args
    });
    return result;
  }

  async buildFoundation() {
    console.log('🏗️  Building foundation...');

    const foundationParts = [];
    const foundationSize = { x: 100, y: 2, z: 80 };

    // Main foundation
    foundationParts.push({
      className: 'Part',
      properties: {
        Name: 'Foundation',
        Size: `${foundationSize.x}, ${foundationSize.y}, ${foundationSize.z}`,
        Position: `${this.basePosition.x}, ${this.basePosition.y}, ${this.basePosition.z}`,
        Anchored: true,
        BrickColor: 'Medium stone grey',
        Material: 'Concrete'
      },
      parent: 'Workspace'
    });

    await this.callTool('mass_create_objects_with_properties', {
      objects: foundationParts
    });
  }

  async buildFloor(floorNumber, height) {
    console.log(`🏠 Building floor ${floorNumber}...`);

    const floorParts = [];
    const floorY = this.basePosition.y + height;

    // Floor slab
    floorParts.push({
      className: 'Part',
      properties: {
        Name: `Floor${floorNumber}`,
        Size: '98, 1, 78',
        Position: `${this.basePosition.x}, ${floorY}, ${this.basePosition.z}`,
        Anchored: true,
        BrickColor: 'Dark stone grey',
        Material: 'Wood'
      },
      parent: 'Workspace'
    });

    // Exterior walls (4 walls)
    const wallHeight = 15;
    const wallThickness = 1;

    // Front wall with entrance
    floorParts.push({
      className: 'Part',
      properties: {
        Name: `Floor${floorNumber}_FrontWallLeft`,
        Size: `35, ${wallHeight}, ${wallThickness}`,
        Position: `${this.basePosition.x - 32.5}, ${floorY + wallHeight/2}, ${this.basePosition.z - 40}`,
        Anchored: true,
        BrickColor: 'White',
        Material: 'SmoothPlastic'
      },
      parent: 'Workspace'
    });

    floorParts.push({
      className: 'Part',
      properties: {
        Name: `Floor${floorNumber}_FrontWallRight`,
        Size: `35, ${wallHeight}, ${wallThickness}`,
        Position: `${this.basePosition.x + 32.5}, ${floorY + wallHeight/2}, ${this.basePosition.z - 40}`,
        Anchored: true,
        BrickColor: 'White',
        Material: 'SmoothPlastic'
      },
      parent: 'Workspace'
    });

    // Back wall
    floorParts.push({
      className: 'Part',
      properties: {
        Name: `Floor${floorNumber}_BackWall`,
        Size: `100, ${wallHeight}, ${wallThickness}`,
        Position: `${this.basePosition.x}, ${floorY + wallHeight/2}, ${this.basePosition.z + 40}`,
        Anchored: true,
        BrickColor: 'White',
        Material: 'SmoothPlastic'
      },
      parent: 'Workspace'
    });

    // Left wall
    floorParts.push({
      className: 'Part',
      properties: {
        Name: `Floor${floorNumber}_LeftWall`,
        Size: `${wallThickness}, ${wallHeight}, 78`,
        Position: `${this.basePosition.x - 50}, ${floorY + wallHeight/2}, ${this.basePosition.z}`,
        Anchored: true,
        BrickColor: 'White',
        Material: 'SmoothPlastic'
      },
      parent: 'Workspace'
    });

    // Right wall
    floorParts.push({
      className: 'Part',
      properties: {
        Name: `Floor${floorNumber}_RightWall`,
        Size: `${wallThickness}, ${wallHeight}, 78`,
        Position: `${this.basePosition.x + 50}, ${floorY + wallHeight/2}, ${this.basePosition.z}`,
        Anchored: true,
        BrickColor: 'White',
        Material: 'SmoothPlastic'
      },
      parent: 'Workspace'
    });

    await this.callTool('mass_create_objects_with_properties', {
      objects: floorParts
    });
  }

  async buildRooms(floorNumber, height) {
    console.log(`🚪 Building rooms for floor ${floorNumber}...`);

    const floorY = this.basePosition.y + height;
    const rooms = [];

    // Interior walls to divide rooms
    const wallHeight = 14;
    const wallThickness = 0.5;

    // Main hallway wall (divides front and back)
    rooms.push({
      className: 'Part',
      properties: {
        Name: `Floor${floorNumber}_HallwayWall`,
        Size: `98, ${wallHeight}, ${wallThickness}`,
        Position: `${this.basePosition.x}, ${floorY + wallHeight/2}, ${this.basePosition.z}`,
        Anchored: true,
        BrickColor: 'Beige',
        Material: 'SmoothPlastic',
        Transparency: 0
      },
      parent: 'Workspace'
    });

    // Vertical dividing walls
    for (let i = -30; i <= 30; i += 30) {
      rooms.push({
        className: 'Part',
        properties: {
          Name: `Floor${floorNumber}_RoomWall_${i}`,
          Size: `${wallThickness}, ${wallHeight}, 38`,
          Position: `${this.basePosition.x + i}, ${floorY + wallHeight/2}, ${this.basePosition.z - 20}`,
          Anchored: true,
          BrickColor: 'Beige',
          Material: 'SmoothPlastic'
        },
        parent: 'Workspace'
      });

      rooms.push({
        className: 'Part',
        properties: {
          Name: `Floor${floorNumber}_RoomWall2_${i}`,
          Size: `${wallThickness}, ${wallHeight}, 38`,
          Position: `${this.basePosition.x + i}, ${floorY + wallHeight/2}, ${this.basePosition.z + 20}`,
          Anchored: true,
          BrickColor: 'Beige',
          Material: 'SmoothPlastic'
        },
        parent: 'Workspace'
      });
    }

    await this.callTool('mass_create_objects_with_properties', {
      objects: rooms
    });
  }

  async buildWindows(floorNumber, height) {
    console.log(`🪟 Adding windows to floor ${floorNumber}...`);

    const floorY = this.basePosition.y + height;
    const windows = [];
    const windowSize = { x: 6, y: 8, z: 0.3 };

    // Front windows
    for (let i = -40; i <= 40; i += 20) {
      if (Math.abs(i) > 10) { // Skip entrance area
        windows.push({
          className: 'Part',
          properties: {
            Name: `Floor${floorNumber}_Window_Front_${i}`,
            Size: `${windowSize.x}, ${windowSize.y}, ${windowSize.z}`,
            Position: `${this.basePosition.x + i}, ${floorY + 8}, ${this.basePosition.z - 40}`,
            Anchored: true,
            BrickColor: 'Light blue',
            Material: 'Glass',
            Transparency: 0.5
          },
          parent: 'Workspace'
        });
      }
    }

    // Side windows
    for (let i = -30; i <= 30; i += 20) {
      windows.push({
        className: 'Part',
        properties: {
          Name: `Floor${floorNumber}_Window_Left_${i}`,
          Size: `${windowSize.z}, ${windowSize.y}, ${windowSize.x}`,
          Position: `${this.basePosition.x - 50}, ${floorY + 8}, ${this.basePosition.z + i}`,
          Anchored: true,
          BrickColor: 'Light blue',
          Material: 'Glass',
          Transparency: 0.5
        },
        parent: 'Workspace'
      });

      windows.push({
        className: 'Part',
        properties: {
          Name: `Floor${floorNumber}_Window_Right_${i}`,
          Size: `${windowSize.z}, ${windowSize.y}, ${windowSize.x}`,
          Position: `${this.basePosition.x + 50}, ${floorY + 8}, ${this.basePosition.z + i}`,
          Anchored: true,
          BrickColor: 'Light blue',
          Material: 'Glass',
          Transparency: 0.5
        },
        parent: 'Workspace'
      });
    }

    await this.callTool('mass_create_objects_with_properties', {
      objects: windows
    });
  }

  async buildStairs() {
    console.log('🪜 Building grand staircase...');

    const stairs = [];
    const stairWidth = 12;
    const stairDepth = 3;
    const stairHeight = 1.5;
    const numSteps = 10;

    for (let i = 0; i < numSteps; i++) {
      stairs.push({
        className: 'Part',
        properties: {
          Name: `Stair_${i}`,
          Size: `${stairWidth}, ${stairHeight}, ${stairDepth}`,
          Position: `${this.basePosition.x}, ${this.basePosition.y + 5 + (i * stairHeight)}, ${this.basePosition.z - 30 + (i * stairDepth)}`,
          Anchored: true,
          BrickColor: 'Dark stone grey',
          Material: 'Marble'
        },
        parent: 'Workspace'
      });
    }

    await this.callTool('mass_create_objects_with_properties', {
      objects: stairs
    });
  }

  async buildRoof() {
    console.log('🏠 Building roof...');

    const roof = [];
    const roofY = this.basePosition.y + 50;

    // Main roof
    roof.push({
      className: 'Part',
      properties: {
        Name: 'Roof',
        Size: '102, 1, 82',
        Position: `${this.basePosition.x}, ${roofY}, ${this.basePosition.z}`,
        Anchored: true,
        BrickColor: 'Dark red',
        Material: 'Slate'
      },
      parent: 'Workspace'
    });

    // Roof peaks (wedges for peaked roof design)
    roof.push({
      className: 'WedgePart',
      properties: {
        Name: 'RoofPeak1',
        Size: '102, 10, 20',
        Position: `${this.basePosition.x}, ${roofY + 5}, ${this.basePosition.z}`,
        Orientation: '0, 0, 0',
        Anchored: true,
        BrickColor: 'Dark red',
        Material: 'Slate'
      },
      parent: 'Workspace'
    });

    await this.callTool('mass_create_objects_with_properties', {
      objects: roof
    });
  }

  async buildBalconies() {
    console.log('🌆 Adding balconies...');

    const balconies = [];
    const balconyY = this.basePosition.y + 20;

    // Front balcony
    balconies.push({
      className: 'Part',
      properties: {
        Name: 'FrontBalcony',
        Size: '30, 1, 10',
        Position: `${this.basePosition.x}, ${balconyY}, ${this.basePosition.z - 45}`,
        Anchored: true,
        BrickColor: 'Light stone grey',
        Material: 'Concrete'
      },
      parent: 'Workspace'
    });

    // Balcony railings
    for (let i = -12; i <= 12; i += 3) {
      balconies.push({
        className: 'Part',
        properties: {
          Name: `BalconyRailing_${i}`,
          Size: '0.5, 3, 0.5',
          Position: `${this.basePosition.x + i}, ${balconyY + 2}, ${this.basePosition.z - 50}`,
          Anchored: true,
          BrickColor: 'Black',
          Material: 'Metal'
        },
        parent: 'Workspace'
      });
    }

    await this.callTool('mass_create_objects_with_properties', {
      objects: balconies
    });
  }

  async buildPool() {
    console.log('🏊 Building luxury pool...');

    const pool = [];
    const poolY = this.basePosition.y - 3;

    // Pool basin
    pool.push({
      className: 'Part',
      properties: {
        Name: 'Pool',
        Size: '40, 6, 20',
        Position: `${this.basePosition.x + 70}, ${poolY}, ${this.basePosition.z}`,
        Anchored: true,
        BrickColor: 'Light blue',
        Material: 'Glass',
        Transparency: 0.3
      },
      parent: 'Workspace'
    });

    // Pool deck
    pool.push({
      className: 'Part',
      properties: {
        Name: 'PoolDeck',
        Size: '50, 0.5, 30',
        Position: `${this.basePosition.x + 70}, ${this.basePosition.y + 1}, ${this.basePosition.z}`,
        Anchored: true,
        BrickColor: 'Medium stone grey',
        Material: 'Concrete'
      },
      parent: 'Workspace'
    });

    await this.callTool('mass_create_objects_with_properties', {
      objects: pool
    });
  }

  async buildGarage() {
    console.log('🚗 Building garage...');

    const garage = [];
    const garageX = this.basePosition.x - 70;
    const garageY = this.basePosition.y + 5;

    // Garage floor
    garage.push({
      className: 'Part',
      properties: {
        Name: 'GarageFloor',
        Size: '30, 1, 25',
        Position: `${garageX}, ${garageY}, ${this.basePosition.z + 20}`,
        Anchored: true,
        BrickColor: 'Dark stone grey',
        Material: 'Concrete'
      },
      parent: 'Workspace'
    });

    // Garage walls
    garage.push({
      className: 'Part',
      properties: {
        Name: 'GarageBackWall',
        Size: '30, 10, 1',
        Position: `${garageX}, ${garageY + 5}, ${this.basePosition.z + 32}`,
        Anchored: true,
        BrickColor: 'Medium stone grey',
        Material: 'Concrete'
      },
      parent: 'Workspace'
    });

    garage.push({
      className: 'Part',
      properties: {
        Name: 'GarageLeftWall',
        Size: '1, 10, 25',
        Position: `${garageX - 15}, ${garageY + 5}, ${this.basePosition.z + 20}`,
        Anchored: true,
        BrickColor: 'Medium stone grey',
        Material: 'Concrete'
      },
      parent: 'Workspace'
    });

    garage.push({
      className: 'Part',
      properties: {
        Name: 'GarageRightWall',
        Size: '1, 10, 25',
        Position: `${garageX + 15}, ${garageY + 5}, ${this.basePosition.z + 20}`,
        Anchored: true,
        BrickColor: 'Medium stone grey',
        Material: 'Concrete'
      },
      parent: 'Workspace'
    });

    // Garage roof
    garage.push({
      className: 'Part',
      properties: {
        Name: 'GarageRoof',
        Size: '30, 1, 25',
        Position: `${garageX}, ${garageY + 10}, ${this.basePosition.z + 20}`,
        Anchored: true,
        BrickColor: 'Dark stone grey',
        Material: 'Slate'
      },
      parent: 'Workspace'
    });

    await this.callTool('mass_create_objects_with_properties', {
      objects: garage
    });
  }

  async buildLighting() {
    console.log('💡 Adding lighting system...');

    const lights = [];

    // Exterior spotlights
    const spotlightPositions = [
      { x: -45, z: -35 },
      { x: 45, z: -35 },
      { x: -45, z: 35 },
      { x: 45, z: 35 }
    ];

    for (const pos of spotlightPositions) {
      lights.push({
        className: 'Part',
        properties: {
          Name: `SpotlightPost_${pos.x}_${pos.z}`,
          Size: '1, 15, 1',
          Position: `${this.basePosition.x + pos.x}, ${this.basePosition.y + 10}, ${this.basePosition.z + pos.z}`,
          Anchored: true,
          BrickColor: 'Black',
          Material: 'Metal'
        },
        parent: 'Workspace'
      });

      lights.push({
        className: 'SpotLight',
        properties: {
          Name: 'SpotLight',
          Brightness: 5,
          Range: 60,
          Angle: 90,
          Face: 'Top'
        },
        parent: `Workspace.SpotlightPost_${pos.x}_${pos.z}`
      });
    }

    await this.callTool('mass_create_objects_with_properties', {
      objects: lights
    });
  }

  async buildGarden() {
    console.log('🌳 Creating garden and landscaping...');

    const garden = [];

    // Trees (using cylinders for trunks and spheres for foliage)
    const treePositions = [
      { x: -60, z: -20 },
      { x: -60, z: 0 },
      { x: -60, z: 20 },
      { x: 60, z: -20 },
      { x: 60, z: 0 },
      { x: 60, z: 20 }
    ];

    for (let i = 0; i < treePositions.length; i++) {
      const pos = treePositions[i];

      // Tree trunk
      garden.push({
        className: 'Part',
        properties: {
          Name: `TreeTrunk_${i}`,
          Size: '2, 12, 2',
          Position: `${this.basePosition.x + pos.x}, ${this.basePosition.y + 8}, ${this.basePosition.z + pos.z}`,
          Anchored: true,
          BrickColor: 'Brown',
          Material: 'Wood',
          Shape: 'Cylinder'
        },
        parent: 'Workspace'
      });

      // Tree foliage
      garden.push({
        className: 'Part',
        properties: {
          Name: `TreeFoliage_${i}`,
          Size: '10, 10, 10',
          Position: `${this.basePosition.x + pos.x}, ${this.basePosition.y + 16}, ${this.basePosition.z + pos.z}`,
          Anchored: true,
          BrickColor: 'Dark green',
          Material: 'Grass',
          Shape: 'Ball'
        },
        parent: 'Workspace'
      });
    }

    // Lawn
    garden.push({
      className: 'Part',
      properties: {
        Name: 'Lawn',
        Size: '150, 0.5, 120',
        Position: `${this.basePosition.x}, ${this.basePosition.y}, ${this.basePosition.z}`,
        Anchored: true,
        BrickColor: 'Bright green',
        Material: 'Grass'
      },
      parent: 'Workspace'
    });

    await this.callTool('mass_create_objects_with_properties', {
      objects: garden
    });
  }

  async buildMainEntrance() {
    console.log('🚪 Building grand entrance...');

    const entrance = [];

    // Main door frame
    entrance.push({
      className: 'Part',
      properties: {
        Name: 'DoorFrame',
        Size: '12, 14, 1',
        Position: `${this.basePosition.x}, ${this.basePosition.y + 12}, ${this.basePosition.z - 40}`,
        Anchored: true,
        BrickColor: 'Dark stone grey',
        Material: 'Wood'
      },
      parent: 'Workspace'
    });

    // Double doors
    entrance.push({
      className: 'Part',
      properties: {
        Name: 'MainDoorLeft',
        Size: '5.5, 13, 0.5',
        Position: `${this.basePosition.x - 3}, ${this.basePosition.y + 11.5}, ${this.basePosition.z - 40}`,
        Anchored: true,
        BrickColor: 'Brown',
        Material: 'Wood'
      },
      parent: 'Workspace'
    });

    entrance.push({
      className: 'Part',
      properties: {
        Name: 'MainDoorRight',
        Size: '5.5, 13, 0.5',
        Position: `${this.basePosition.x + 3}, ${this.basePosition.y + 11.5}, ${this.basePosition.z - 40}`,
        Anchored: true,
        BrickColor: 'Brown',
        Material: 'Wood'
      },
      parent: 'Workspace'
    });

    // Entrance columns
    entrance.push({
      className: 'Part',
      properties: {
        Name: 'EntranceColumnLeft',
        Size: '2, 20, 2',
        Position: `${this.basePosition.x - 8}, ${this.basePosition.y + 15}, ${this.basePosition.z - 42}`,
        Anchored: true,
        BrickColor: 'White',
        Material: 'Marble',
        Shape: 'Cylinder'
      },
      parent: 'Workspace'
    });

    entrance.push({
      className: 'Part',
      properties: {
        Name: 'EntranceColumnRight',
        Size: '2, 20, 2',
        Position: `${this.basePosition.x + 8}, ${this.basePosition.y + 15}, ${this.basePosition.z - 42}`,
        Anchored: true,
        BrickColor: 'White',
        Material: 'Marble',
        Shape: 'Cylinder'
      },
      parent: 'Workspace'
    });

    await this.callTool('mass_create_objects_with_properties', {
      objects: entrance
    });
  }

  async buildMegaMansion() {
    console.log('\n🏰 Starting Mega Mansion Construction...\n');

    try {
      await this.connect();

      // Build in sequence
      await this.buildGarden();
      await this.buildFoundation();

      // Ground floor
      await this.buildFloor(1, 5);
      await this.buildRooms(1, 5);
      await this.buildWindows(1, 5);
      await this.buildMainEntrance();

      // Second floor
      await this.buildFloor(2, 20);
      await this.buildRooms(2, 20);
      await this.buildWindows(2, 20);
      await this.buildBalconies();

      // Third floor (optional luxury level)
      await this.buildFloor(3, 35);
      await this.buildWindows(3, 35);

      // Structural elements
      await this.buildStairs();
      await this.buildRoof();

      // Exterior features
      await this.buildPool();
      await this.buildGarage();
      await this.buildLighting();

      console.log('\n✅ Mega Mansion construction complete!');
      console.log('🎉 Your luxury mansion includes:');
      console.log('   • 3-story main building');
      console.log('   • Multiple rooms on each floor');
      console.log('   • Grand entrance with marble columns');
      console.log('   • Luxury swimming pool with deck');
      console.log('   • 3-car garage');
      console.log('   • Landscaped garden with trees');
      console.log('   • Balconies with views');
      console.log('   • Exterior lighting system');
      console.log('   • Grand staircase');
      console.log('\n🏠 Open Roblox Studio to see your mega mansion!');

    } catch (error) {
      console.error('❌ Error building mansion:', error);
      throw error;
    }
  }
}

// Main execution
if (require.main === module) {
  const builder = new RobloxMansionBuilder();
  builder.buildMegaMansion().catch(console.error);
}

module.exports = RobloxMansionBuilder;
