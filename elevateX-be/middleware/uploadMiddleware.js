const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../uploads/payments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const maxFileSize = 2 * 1024 * 1024;

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const hasValidJpeg = (buffer) => {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return false;

  let offset = 2;
  let hasFrame = false;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return false;
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset++];

    if (marker === 0xd9) return hasFrame;
    if (marker === 0xda) {
      if (offset + 2 > buffer.length) return false;
      const segmentLength = buffer.readUInt16BE(offset);
      if (segmentLength < 2 || offset + segmentLength > buffer.length) return false;
      offset += segmentLength;
      while (offset + 1 < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        let next = offset + 1;
        while (next < buffer.length && buffer[next] === 0xff) next += 1;
        if (next >= buffer.length) return false;
        if (buffer[next] === 0x00) {
          offset = next + 1;
          continue;
        }
        if (buffer[next] === 0xd9) return hasFrame;
        offset = next;
        break;
      }
      return false;
    }

    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > buffer.length) return false;
    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) return false;
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7)
      || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      hasFrame = true;
    }
    offset += segmentLength;
  }
  return false;
};

const hasValidPng = (buffer) => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < signature.length || !buffer.subarray(0, 8).equals(signature)) return false;

  let offset = 8;
  let hasHeader = false;
  let hasData = false;
  let hasEnd = false;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const chunkEnd = offset + 12 + length;
    if (chunkEnd > buffer.length) return false;
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    const expectedCrc = buffer.readUInt32BE(offset + 8 + length);
    const actualCrc = crc32(buffer.subarray(offset + 4, offset + 8 + length));
    if (expectedCrc !== actualCrc) return false;

    if (!hasHeader) {
      if (type !== 'IHDR' || length !== 13 || data.readUInt32BE(0) === 0 || data.readUInt32BE(4) === 0) return false;
      hasHeader = true;
    } else if (type === 'IHDR') {
      return false;
    }
    if (type === 'IDAT' && length > 0) hasData = true;
    if (type === 'IEND' && length === 0) {
      hasEnd = true;
      offset = chunkEnd;
      break;
    }
    offset = chunkEnd;
  }
  return hasHeader && hasData && hasEnd && offset === buffer.length;
};

const hasValidWebp = (buffer) => {
  if (buffer.length < 20 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return false;
  if (buffer.readUInt32LE(4) + 8 !== buffer.length) return false;

  let offset = 12;
  let hasImageChunk = false;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const length = buffer.readUInt32LE(offset + 4);
    const chunkEnd = offset + 8 + length + (length % 2);
    if (chunkEnd > buffer.length) return false;
    if (type === 'VP8 ' || type === 'VP8L' || type === 'VP8X') hasImageChunk = length > 0;
    offset = chunkEnd;
  }
  return hasImageChunk && offset === buffer.length;
};

const hasValidImageContent = (buffer, extension) => {
  if (extension === '.png') return hasValidPng(buffer);
  if (extension === '.webp') return hasValidWebp(buffer);
  return hasValidJpeg(buffer);
};

const createFilename = (originalName) => {
  const basename = path.basename(String(originalName || '').replace(/\\/g, '/'));
  const extension = path.extname(basename).toLowerCase();
  return `payment-${Date.now()}-${crypto.randomBytes(16).toString('hex')}${extension}`;
};

const storage = {
  _handleFile: (req, file, cb) => {
    const chunks = [];
    let totalSize = 0;
    let completed = false;

    const fail = (error) => {
      if (completed) return;
      completed = true;
      cb(error);
    };

    file.stream.on('data', (chunk) => {
      totalSize += chunk.length;
      if (totalSize <= maxFileSize) chunks.push(chunk);
    });
    file.stream.on('limit', () => fail(new multer.MulterError('LIMIT_FILE_SIZE')));
    file.stream.on('error', fail);
    file.stream.on('end', () => {
      if (completed) return;
      const extension = path.extname(path.basename(String(file.originalname || '').replace(/\\/g, '/'))).toLowerCase();
      const buffer = Buffer.concat(chunks);
      if (totalSize > maxFileSize || !hasValidImageContent(buffer, extension)) {
        return fail(new Error('Uploaded file is not a valid JPG, JPEG, PNG, or WEBP image.'));
      }

      const filename = createFilename(file.originalname);
      const destination = path.join(uploadDir, filename);
      fs.writeFile(destination, buffer, (error) => {
        if (error) return fail(error);
        completed = true;
        cb(null, { destination: uploadDir, filename, path: destination, size: buffer.length });
      });
    });
  },
  _removeFile: (_req, file, cb) => {
    if (file.path) return fs.unlink(file.path, cb);
    cb(null);
  },
};

const fileFilter = (_req, file, cb) => {
  const basename = path.basename(String(file.originalname || '').replace(/\\/g, '/'));
  const ext = path.extname(basename).toLowerCase();
  if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
    return cb(new Error('Only JPG, JPEG, PNG, and WEBP payment screenshots are allowed.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter,
});

module.exports = { upload }; 
