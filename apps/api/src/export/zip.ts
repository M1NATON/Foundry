/**
 * Минимальный ZIP-писатель без внешних зависимостей: метод STORE (без
 * сжатия). Картинки и wav внутри Resolve pack уже сжатые форматы, поэтому
 * deflate ничего бы не выиграл, а зависимость в lockfile — добавил.
 */

export interface ZipEntry {
  /** Путь внутри архива, прямые слеши (например "media/scene-01.jpg"). */
  name: string;
  data: Buffer;
}

/** Таблица CRC-32 (IEEE), считается один раз. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) {
    c = CRC_TABLE[(c ^ byte) & 0xff]! ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/** Фиксированная DOS-дата 1980-01-01: содержимое архива детерминировано. */
const DOS_TIME = 0;
const DOS_DATE = 0x21;
/** General purpose flag: бит 11 — имена в UTF-8. */
const UTF8_FLAG = 0x0800;

export function createZip(entries: ZipEntry[]): Buffer {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); // local file header signature
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(UTF8_FLAG, 6);
    local.writeUInt16LE(0, 8); // method: STORE
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18); // compressed size
    local.writeUInt32LE(size, 22); // uncompressed size
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28); // extra field length
    chunks.push(local, name, entry.data);

    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50, 0); // central directory signature
    record.writeUInt16LE(20, 4); // version made by
    record.writeUInt16LE(20, 6); // version needed
    record.writeUInt16LE(UTF8_FLAG, 8);
    record.writeUInt16LE(0, 10); // method: STORE
    record.writeUInt16LE(DOS_TIME, 12);
    record.writeUInt16LE(DOS_DATE, 14);
    record.writeUInt32LE(crc, 16);
    record.writeUInt32LE(size, 20);
    record.writeUInt32LE(size, 24);
    record.writeUInt16LE(name.length, 28);
    // 30..41 — extra/comment/internal/external attrs, все нули
    record.writeUInt32LE(offset, 42); // local header offset
    central.push(Buffer.concat([record, name]));

    offset += 30 + name.length + size;
  }

  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // EOCD signature
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...chunks, directory, end]);
}
