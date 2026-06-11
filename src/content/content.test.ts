import { describe, expect, it } from 'vitest';
import { getUnit, getUnits, parseUnit } from './loader';
import { unitSchema } from './schema';
import starterPack from './units/starter-pack.json';

describe('content schema', () => {
  it('validates every shipped unit', () => {
    // Shipped units are loaded (and validated) at import time; reaching
    // this point at all means they parsed. Assert explicitly anyway.
    for (const unit of getUnits()) {
      expect(unitSchema.safeParse(unit).success).toBe(true);
    }
    expect(getUnits().length).toBeGreaterThan(0);
  });

  it('rejects a unit with an out-of-range quiz answerIndex', () => {
    const bad = {
      ...starterPack,
      quiz: [
        {
          id: 'q-bad',
          prompt: 'What does "aqua" mean?',
          emoji: '💧',
          choices: ['fire', 'water'],
          answerIndex: 5,
        },
      ],
    };
    expect(() => parseUnit(bad, 'bad-fixture.json')).toThrowError(
      /bad-fixture\.json.*answerIndex/s,
    );
  });

  it('rejects a grammar item whose correct answer is not an option', () => {
    const bad = {
      ...starterPack,
      grammar: [{ id: 'g-bad', word: 'puella', options: ['-a', '-us'], correct: '-um' }],
    };
    expect(() => parseUnit(bad, 'bad-fixture.json')).toThrowError(/correct/);
  });

  it('rejects structurally invalid content', () => {
    expect(() => parseUnit({ id: 'x' }, 'bad-fixture.json')).toThrowError(/bad-fixture\.json/);
    expect(() => parseUnit(null, 'bad-fixture.json')).toThrowError(/bad-fixture\.json/);
  });
});

describe('content loader', () => {
  it('exposes the starter pack with all consolidated words', () => {
    const units = getUnits();
    expect(units.map((u) => u.id)).toContain('starter-pack');

    const unit = getUnit('starter-pack');
    expect(unit).toBeDefined();
    expect(unit?.title).toBe('Starter Pack – Grade 2');

    const latinWords = unit?.vocab.map((v) => v.latin) ?? [];
    for (const word of ['puella', 'puer', 'canis', 'aqua', 'luna', 'sol', 'casa', 'templum']) {
      expect(latinWords).toContain(word);
    }

    expect(unit?.grammar.length).toBeGreaterThanOrEqual(7);
    expect(unit?.quiz.length).toBeGreaterThanOrEqual(4);
  });

  it('returns undefined for unknown unit ids', () => {
    expect(getUnit('nope')).toBeUndefined();
  });

  it('returns units sorted by order', () => {
    const orders = getUnits().map((u) => u.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});
