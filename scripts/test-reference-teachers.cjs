const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
test('the shipped portrait has the expected source dimensions', () => {
  const png = fs.readFileSync(path.join(root, 'public/teachers/reference-portrait.png'));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1536);
  assert.equal(png.readUInt32BE(20), 1024);
});
test('all five source regions are contiguous, bounded, and have a mouth inside the character', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/classroom/ReferenceTeacher.tsx'), 'utf8');
  const regions = [...source.matchAll(/\{ x: (\d+), width: (\d+), mouthX: (\d+), mouthY: (\d+) \}/g)].map(m => m.slice(1).map(Number));
  assert.equal(regions.length, 5);
  let edge = 0;
  for (const [x, width, mouthX, mouthY] of regions) {
    assert.equal(x, edge);
    assert.ok(mouthX > x + 16 && mouthX < x + width - 16);
    assert.ok(mouthY > 100 && mouthY < 250);
    edge += width;
  }
  assert.equal(edge, 1536);
});
test('the original source portrait is preserved byte-for-byte when available', { skip: !fs.existsSync('C:/Users/SREEKANTH REDDY/Downloads/Five Friends, One Stylish Portrait.png') }, () => {
  const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(hash(path.join(root, 'public/teachers/reference-portrait.png')), hash('C:/Users/SREEKANTH REDDY/Downloads/Five Friends, One Stylish Portrait.png'));
});
