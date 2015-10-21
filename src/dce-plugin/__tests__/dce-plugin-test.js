jest.autoMockOff();

const babel = require('babel-core');

function transform(code) {
  return babel.transform(code,  {
    plugins: [require('../index')],
    blacklist: ['strict'],
  }).code;
}

function unpad(str) {
  const lines = str.split('\n');
  const m = lines[1] && lines[1].match(/^\s+/);
  if (!m) {
    return str;
  }
  const spaces = m[0].length;
  return lines.map(
    line => line.slice(spaces)
  ).join('\n').trim();
}

describe('dce-plugin', () => {
  it('should remove bindings with no references', () => {
    const expected = '';
    const source = 'var x = 1;';
    expect(transform(source)).toBe(expected);
  });

  it('should inline binding with one reference', () => {
    const expected = 'console.log(1);';
    const source = unpad(`
      var x = 1;
      console.log(x);
    `);

    expect(transform(source).trim()).toBe(expected);
  });

  it('should remove side effectless statements', () => {
    const expected = unpad(`
      function x() {}
    `);
    const source = unpad(`
      function x() {
        1;
      }
    `);

    expect(transform(source).trim()).toBe(expected);
  });
});