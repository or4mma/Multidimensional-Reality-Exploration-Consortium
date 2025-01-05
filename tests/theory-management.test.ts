import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let theoryCount = 0;
const theories = new Map();
const theoryVotes = new Map();

// Simulated contract functions
function submitTheory(title: string, description: string, dimensions: number, creator: string) {
  const theoryId = ++theoryCount;
  theories.set(theoryId, {
    creator,
    title,
    description,
    dimensions,
    creationTime: Date.now(),
    votes: 0,
    status: "pending"
  });
  return theoryId;
}

function voteOnTheory(theoryId: number, vote: number, voter: string) {
  const theory = theories.get(theoryId);
  if (!theory) throw new Error('Invalid theory');
  if (vote < -1 || vote > 1) throw new Error('Invalid vote');
  const previousVote = theoryVotes.get(`${theoryId}-${voter}`) || 0;
  theoryVotes.set(`${theoryId}-${voter}`, vote);
  theory.votes += vote - previousVote;
  theories.set(theoryId, theory);
  return true;
}

function updateTheoryStatus(theoryId: number, newStatus: string, updater: string) {
  const theory = theories.get(theoryId);
  if (!theory) throw new Error('Invalid theory');
  if (updater !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  theory.status = newStatus;
  theories.set(theoryId, theory);
  return true;
}

describe('Theory Management Contract', () => {
  beforeEach(() => {
    theoryCount = 0;
    theories.clear();
    theoryVotes.clear();
  });
  
  it('should submit a new theory', () => {
    const id = submitTheory('String Theory', 'A theory of everything based on 1-dimensional strings', 11, 'researcher1');
    expect(id).toBe(1);
    const theory = theories.get(id);
    expect(theory.title).toBe('String Theory');
    expect(theory.dimensions).toBe(11);
    expect(theory.status).toBe('pending');
  });
  
  it('should allow voting on a theory', () => {
    const id = submitTheory('M-Theory', 'An extension of string theory', 11, 'researcher2');
    expect(voteOnTheory(id, 1, 'voter1')).toBe(true);
    const theory = theories.get(id);
    expect(theory.votes).toBe(1);
  });
  
  it('should update theory status', () => {
    const id = submitTheory('Loop Quantum Gravity', 'A theory of quantum spacetime', 4, 'researcher3');
    expect(updateTheoryStatus(id, 'approved', 'CONTRACT_OWNER')).toBe(true);
    const theory = theories.get(id);
    expect(theory.status).toBe('approved');
  });
  
  it('should not allow invalid votes', () => {
    const id = submitTheory('Holographic Principle', 'A principle in string theories', 10, 'researcher4');
    expect(() => voteOnTheory(id, 2, 'voter2')).toThrow('Invalid vote');
  });
  
  it('should not allow unauthorized status updates', () => {
    const id = submitTheory('Causal Dynamical Triangulations', 'A theory of quantum gravity', 4, 'researcher5');
    expect(() => updateTheoryStatus(id, 'approved', 'unauthorized_user')).toThrow('Not authorized');
  });
});

