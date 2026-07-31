/**
 * Generates a tileable grayscale noise PNG for span-band grain overlays.
 * Run: bun scripts/generate-noise-texture.ts
 */
import { deflateSync } from "node:zlib"
import { writeFileSync } from "node:fs"
import { join } from "node:path"

const SIZE = 256
const OUTPUT = join(import.meta.dir, "../static/textures/noise.png")

function crc32(data: Buffer): number {
	let crc = 0xffffffff
	for (let i = 0; i < data.length; i++) {
		crc ^= data[i]!
		for (let j = 0; j < 8; j++) {
			crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
		}
	}
	return (crc ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
	const typeBuf = Buffer.from(type, "ascii")
	const length = Buffer.alloc(4)
	length.writeUInt32BE(data.length)
	const crcInput = Buffer.concat([typeBuf, data])
	const crc = Buffer.alloc(4)
	crc.writeUInt32BE(crc32(crcInput))
	return Buffer.concat([length, typeBuf, data, crc])
}

function createNoisePng(size: number): Buffer {
	const ihdr = Buffer.alloc(13)
	ihdr.writeUInt32BE(size, 0)
	ihdr.writeUInt32BE(size, 4)
	ihdr[8] = 8 // bit depth
	ihdr[9] = 0 // grayscale
	ihdr[10] = 0 // compression
	ihdr[11] = 0 // filter
	ihdr[12] = 0 // interlace

	const raw = Buffer.alloc(size * (1 + size))
	let offset = 0
	for (let y = 0; y < size; y++) {
		raw[offset++] = 0 // filter type: none
		for (let x = 0; x < size; x++) {
			raw[offset++] = Math.floor(Math.random() * 256)
		}
	}

	const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
	return Buffer.concat([
		signature,
		chunk("IHDR", ihdr),
		chunk("IDAT", deflateSync(raw)),
		chunk("IEND", Buffer.alloc(0)),
	])
}

writeFileSync(OUTPUT, createNoisePng(SIZE))
console.log(`Wrote ${OUTPUT} (${SIZE}x${SIZE})`)
