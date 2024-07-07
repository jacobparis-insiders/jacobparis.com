import zlib from "node:zlib"

const shadesOfBlack = [
  "#000000",
  "#0A0A0A",
  "#141414",
  "#1E1E1E",
  "#282828",
  "#2F2F2F",
  "#2A2626",
  "#2C2828",
  "#2E2A2A",
  "#302C2C",
  "#322E2E",
  "#343030",
  "#262A2A",
  "#282C2C",
  "#2A2E2E",
  "#2C3030",
  "#2E3232",
  "#303434",
  "#26262A",
  "#28282C",
  "#2A2A2E",
  "#2C2C30",
  "#2E2E32",
  "#303034",
  "#262A26",
  "#282C28",
  "#2A2E2A",
  "#2C302C",
  "#2E322E",
  "#303430",
]

export function hashStringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32bit integer
  }
  return shadesOfBlack[Math.abs(hash) % shadesOfBlack.length]
}

export function createRect(
  width: number,
  height: number,
  color: string,
): Buffer {
  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const a = 255 // Full opacity

  // PNG file signature
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ])

  // IHDR chunk
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0) // Width
  ihdrData.writeUInt32BE(height, 4) // Height
  ihdrData[8] = 8 // Bit depth
  ihdrData[9] = 6 // Color type (RGBA)
  ihdrData[10] = 0 // Compression method
  ihdrData[11] = 0 // Filter method
  ihdrData[12] = 0 // Interlace method
  const ihdrChunk = createChunk("IHDR", ihdrData)

  // IDAT chunk
  const imageData = Buffer.alloc(width * height * 4 + height)
  for (let y = 0; y < height; y++) {
    imageData[y * (width * 4 + 1)] = 0 // No filter
    for (let x = 0; x < width; x++) {
      const idx = y * (width * 4 + 1) + 1 + x * 4
      imageData[idx] = r
      imageData[idx + 1] = g
      imageData[idx + 2] = b
      imageData[idx + 3] = a
    }
  }
  const compressedData = zlib.deflateSync(imageData)
  const idatChunk = createChunk("IDAT", compressedData)

  // IEND chunk
  const iendChunk = createChunk("IEND", Buffer.alloc(0))

  // Combine all parts into one buffer
  const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
  return pngBuffer
}

function createChunk(type: string, data: Buffer): Buffer {
  const length = data.length
  const chunk = Buffer.alloc(length + 12)
  chunk.writeUInt32BE(length, 0)
  chunk.write(type, 4, 4, "ascii")
  data.copy(chunk, 8)
  const crc = crc32(chunk.slice(4, chunk.length - 4))
  chunk.writeUInt32BE(crc, chunk.length - 4)
  return chunk
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const crcTable = (() => {
  const table: number[] = []
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1)
      } else {
        c = c >>> 1
      }
    }
    table[i] = c >>> 0
  }
  return table
})()
