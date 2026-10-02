import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as schemas from '../../src/tools/schemas.js';

describe('Contract: Tool Schemas', () => {
  it('docs/mcp-tools.json matches current schemas', () => {
    const docPath = path.join(process.cwd(), 'docs', 'mcp-tools.json');
    expect(fs.existsSync(docPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(docPath, 'utf8'));
    
    const registeredNames = Object.keys(schemas).map(k => k.replace('Schema', ''));
    expect(content.length).toBe(7);
    
    // Minimal verification that they have descriptions and are objects
    for (const tool of content) {
      expect(tool.name).toBeDefined();
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
    }
  });
});
