# Roblox Mega Mansion Builder

An automated builder that creates a luxurious 3-story mansion in Roblox Studio using the Model Context Protocol (MCP).

## Features

Your mega mansion includes:

- **3-Story Main Building** with exterior walls and windows
- **Multiple Rooms** on each floor with interior walls
- **Grand Entrance** with marble columns and double doors
- **Luxury Swimming Pool** with deck area
- **3-Car Garage** with concrete structure
- **Landscaped Garden** with trees and lawn
- **Balconies** with railings and views
- **Exterior Lighting System** with spotlights
- **Grand Staircase** with marble steps
- **Peaked Roof** with slate material

## Prerequisites

1. **Roblox Studio** installed and running
2. **MCP Plugin** installed in Roblox Studio (located at `/Users/robinsonchan/Documents/Roblox/Plugins/MCPPlugin.rbxmx`)
3. **Node.js** installed on your system
4. **MCP Server** configured and running

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Step 1: Open Roblox Studio

1. Launch Roblox Studio
2. Create a new place or open an existing one
3. Make sure the MCP Plugin is enabled (check the Plugins toolbar)

### Step 2: Start the MCP Server

The MCP Plugin in Roblox Studio will automatically try to connect to the MCP server on port 3002.

### Step 3: Run the Mansion Builder

```bash
npm run build-mansion
```

Or directly:
```bash
node roblox-mega-mansion-builder.js
```

### Step 4: Watch the Magic Happen

The script will:
1. Connect to Roblox Studio via MCP
2. Build the foundation and lawn
3. Construct each floor with walls and windows
4. Add interior room divisions
5. Create the grand entrance
6. Build the staircase
7. Add the roof
8. Construct the pool and garage
9. Add landscaping and lighting

The entire process takes a few minutes depending on your system.

## Customization

You can customize the mansion by editing `roblox-mega-mansion-builder.js`:

### Change Mansion Size
```javascript
this.basePosition = { x: 0, y: 5, z: 0 };  // Change position
const foundationSize = { x: 100, y: 2, z: 80 };  // Change size
```

### Modify Colors
```javascript
BrickColor: 'White',  // Change to any Roblox BrickColor
Material: 'SmoothPlastic',  // Change material
```

### Add More Floors
```javascript
// In buildMegaMansion(), add:
await this.buildFloor(4, 50);
await this.buildWindows(4, 50);
```

### Adjust Room Layout
Modify the `buildRooms()` method to change interior wall positions and room divisions.

## Troubleshooting

### Port Already in Use
If you see `EADDRINUSE` error:
```bash
# Find and kill the process using port 3002
lsof -ti:3002 | xargs kill -9
```

### MCP Plugin Not Connecting
1. Check that Roblox Studio is running
2. Verify the MCP Plugin is enabled in the Plugins toolbar
3. Check the Output window in Roblox Studio for connection status

### Objects Not Appearing
1. Make sure you're in the correct workspace
2. Check the Explorer panel in Roblox Studio
3. Try zooming out to see the full mansion
4. Verify that HttpService is enabled in Game Settings

## Architecture

The builder uses the MCP (Model Context Protocol) to communicate with Roblox Studio:

- **Client**: Node.js script using `@modelcontextprotocol/sdk`
- **Transport**: Stdio communication with `robloxstudio-mcp` package
- **Server**: Roblox Studio plugin listening on port 3002

The script uses these MCP tools:
- `mass_create_objects_with_properties` - Efficiently creates multiple objects at once
- `create_object_with_properties` - Creates individual objects
- `set_property` - Modifies object properties

## Building Phases

1. **Garden & Foundation** (lawn, foundation slab)
2. **Ground Floor** (floor, walls, windows, entrance)
3. **Second Floor** (floor, walls, windows, balconies)
4. **Third Floor** (floor, walls, windows)
5. **Structural** (staircase, roof)
6. **Exterior** (pool, garage, lighting)

## File Structure

```
/Users/robinsonchan/
├── roblox-mega-mansion-builder.js  # Main builder script
├── package.json                     # Dependencies
├── .mcp.json                        # MCP server configuration
└── ROBLOX-MANSION-README.md         # This file
```

## Contributing

Feel free to modify and enhance the mansion! Some ideas:

- Add furniture to rooms
- Create a multi-car garage with vehicles
- Add a tennis court or basketball court
- Create a rooftop terrace
- Add a fountain in the front yard
- Create an underground basement level
- Add more decorative elements (paintings, chandeliers, etc.)

## License

MIT

## Credits

Built with:
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
- [robloxstudio-mcp](https://www.npmjs.com/package/robloxstudio-mcp)
- Roblox Studio

---

Enjoy your mega mansion! 🏰✨
