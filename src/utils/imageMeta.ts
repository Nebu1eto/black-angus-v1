// Code Implementation from https://github.com/vivaxy/is-animated-image

export interface ImageType {
  ext: string,
  mime: string,
  animated: boolean
}

// check png is animated png.
export function isAnimatedPng (buffer: Buffer) {
  try {
    const meta = getImageMeta(buffer)
    return meta.ext === 'png' && meta.animated
  } catch {
    return false
  }
}

export function getImageMeta (buffer: any): ImageType {
  if (!(buffer instanceof Uint8Array)) {
    buffer = new Uint8Array(buffer)
  }

  if (check(buffer, [0xff, 0xd8, 0xff])) {
    return {
      ext: 'jpg',
      mime: 'image/jpeg',
      animated: false
    }
  }

  if (check(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    // apng has `61 63 54 4C` before first `00 00 00 08`
    if (findIndex(buffer, [0x61, 0x63, 0x54, 0x4c]) === -1) {
      return {
        ext: 'png',
        mime: 'image/png',
        animated: false
      }
    }

    return {
      ext: 'png',
      mime: 'image/png',
      animated: true
    }
  }
  if (check(buffer, [0x47, 0x49, 0x46])) {
    return {
      ext: 'gif',
      mime: 'image/gif',
      animated: true
    }
  }
  if (check(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    if (findIndex(buffer, [0x41, 0x4e, 0x49, 0x4d]) === -1) {
      return {
        ext: 'webp',
        mime: 'image/webp',
        animated: false
      }
    }

    return {
      ext: 'webp',
      mime: 'image/webp',
      animated: true
    }
  }

  throw new Error('Cannnot find image type.')
}

function check (buffer: Buffer, codes: number[], offset: number = 0) {
  for (let i = 0; i < codes.length; i++) {
    if (buffer[i + offset] !== codes[i]) return false
  }

  return true
}

function findIndex (buffer: Buffer, codes: number[], from: number = 0, to: number = buffer.length) {
  // eslint-disable-next-line no-unreachable-loop
  for (let i = from; i < to; i++) {
    for (let j = 0; j < codes.length; j++) {
      if (buffer[i + j] !== codes[j]) continue
    }

    return i
  }

  return -1
}
