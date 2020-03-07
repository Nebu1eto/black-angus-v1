// check png is animated png.
export function isAnimatedPng (buffer: Buffer) {
  const header = buffer.slice(0, 8).toString('hex')
  if (header !== '89504e470d0a1a0a') return false

  let hasACTL = false
  let hasIDAT = false
  let hasFDAT = false
  let previousChunkType = null
  let offset = 8

  while (offset < buffer.length) {
    const chunkLength = buffer.readUInt32BE(offset)
    const chunkType = buffer.slice(offset + 4, offset + 8).toString('ascii')

    switch (chunkType) {
      case 'acTL':
        hasACTL = true
        break
      case 'IDAT':
        if (!hasACTL) return false
        if (previousChunkType !== 'fcTL') return false
        hasIDAT = true
        break
      case 'fdAT':
        if (!hasIDAT) return false
        if (previousChunkType !== 'fcTL') return false
        hasFDAT = true
        break
    }

    previousChunkType = chunkType
    offset += 4 + 4 + chunkLength + 4
  }

  return hasACTL && hasIDAT && hasFDAT
}
