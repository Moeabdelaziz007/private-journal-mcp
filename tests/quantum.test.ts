import { superpose, measure } from '../src/quantum';

test('superpose and measure basic', () => {
  const s = superpose(3);
  expect(s.amplitudes.length).toBe(3);
  const m = measure(s);
  expect(m).toBeGreaterThanOrEqual(0);
  expect(m).toBeLessThan(3);
});
