const UINT32_RANGE = 0x1_0000_0000;
const MULBERRY32_INCREMENT = 0x6d2b79f5;

export interface PrngStep {
  readonly state: number;
  readonly value: number;
}

const assertUint32 = (value: number, label: string): void => {
  if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
    throw new RangeError(`${label} must be an unsigned 32-bit integer`);
  }
};

export const initializePrngState = (seed: number): number => {
  assertUint32(seed, "seed");
  return seed;
};

export const nextPrng = (state: number): PrngStep => {
  assertUint32(state, "PRNG state");

  const nextState = (state + MULBERRY32_INCREMENT) >>> 0;
  let mixed = nextState;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

  return {
    state: nextState,
    value: ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE,
  };
};
