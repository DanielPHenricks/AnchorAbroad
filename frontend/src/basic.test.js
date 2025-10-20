/**
 * Basic tests to ensure Jest is working
 * Simple 80/20 approach - test core functionality with minimal setup
 */

describe('Basic Tests', () => {
  test('JavaScript basics work', () => {
    expect(1 + 1).toBe(2);
    expect(typeof 'hello').toBe('string');
    expect(Array.isArray([])).toBe(true);
  });

  test('Math operations work correctly', () => {
    expect(Math.max(1, 2, 3)).toBe(3);
    expect(Math.min(1, 2, 3)).toBe(1);
    expect(Math.round(4.6)).toBe(5);
  });

  test('String operations work', () => {
    const testString = 'Hello World';
    expect(testString.toLowerCase()).toBe('hello world');
    expect(testString.split(' ')).toEqual(['Hello', 'World']);
    expect(testString.includes('World')).toBe(true);
  });

  test('Array operations work', () => {
    const testArray = [1, 2, 3, 4, 5];
    expect(testArray.length).toBe(5);
    expect(testArray.filter(n => n > 3)).toEqual([4, 5]);
    expect(testArray.map(n => n * 2)).toEqual([2, 4, 6, 8, 10]);
  });

  test('Object operations work', () => {
    const testObject = { name: 'Test', value: 42 };
    expect(testObject.name).toBe('Test');
    expect(Object.keys(testObject)).toEqual(['name', 'value']);
    expect(Object.values(testObject)).toEqual(['Test', 42]);
  });
});