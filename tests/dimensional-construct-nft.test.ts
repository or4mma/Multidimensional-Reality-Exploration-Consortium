import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lastTokenId = 0;
const tokenMetadata = new Map();
const tokenOwners = new Map();

// Simulated contract functions
function mintConstruct(name: string, description: string, dimensions: number, visualizationUrl: string, creator: string) {
  const tokenId = ++lastTokenId;
  tokenMetadata.set(tokenId, {
    creator,
    name,
    description,
    dimensions,
    visualizationUrl,
    creationTime: Date.now()
  });
  tokenOwners.set(tokenId, creator);
  return tokenId;
}

function transferConstruct(tokenId: number, sender: string, recipient: string) {
  if (tokenOwners.get(tokenId) !== sender) throw new Error('Not authorized');
  tokenOwners.set(tokenId, recipient);
  return true;
}

describe('Dimensional Construct NFT Contract', () => {
  beforeEach(() => {
    lastTokenId = 0;
    tokenMetadata.clear();
    tokenOwners.clear();
  });
  
  it('should mint a new dimensional construct NFT', () => {
    const id = mintConstruct('Hypercube', 'A four-dimensional cube', 4, 'https://example.com/hypercube.gif', 'creator1');
    expect(id).toBe(1);
    const metadata = tokenMetadata.get(id);
    expect(metadata.name).toBe('Hypercube');
    expect(metadata.dimensions).toBe(4);
    expect(tokenOwners.get(id)).toBe('creator1');
  });
  
  it('should transfer dimensional construct NFT ownership', () => {
    const id = mintConstruct('Klein Bottle', 'A non-orientable surface', 4, 'https://example.com/klein-bottle.gif', 'creator2');
    expect(transferConstruct(id, 'creator2', 'collector1')).toBe(true);
    expect(tokenOwners.get(id)).toBe('collector1');
  });
  
  it('should not allow unauthorized transfers', () => {
    const id = mintConstruct('Calabi-Yau Manifold', 'A complex manifold', 6, 'https://example.com/calabi-yau.gif', 'creator3');
    expect(() => transferConstruct(id, 'unauthorized_user', 'collector2')).toThrow('Not authorized');
  });
});

