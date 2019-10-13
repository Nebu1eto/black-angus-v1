import fuzz from 'fuzzball'

const KOREAN_ALPHABETS_FIRST_MAP =
  ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ',
    'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'].map((item, idx) => {
      return { [item]: String.fromCharCode(4352 + idx) }
    }).reduce((prev, next) => ({ ...prev, ...next }))

const KOREAN_ALPHABETS_MIDDLE_MAP = [...Array(20 + 1).keys()].map(index => ({
    [String.fromCharCode(12623 + index)]: String.fromCharCode(4449 + index)
  })).reduce((prev, next) => ({ ...prev, ...next }))

const KOREAN_ALPHABETS_END_MAP =
  ['ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ',
    'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ',
    'ㅌ', 'ㅍ', 'ㅎ'].map((item, idx) => ({
      [item]: String.fromCharCode(4520 + idx)
    })).reduce((prev, next) => ({ ...prev, ...next }))

export function normalizeKoreanNFCToNFD (origin: string): string {
  for (const [from, to] of Object.entries(KOREAN_ALPHABETS_FIRST_MAP)) {
    origin = origin.split(from).join(to)
  }

  for (const [from, to] of Object.entries(KOREAN_ALPHABETS_MIDDLE_MAP)) {
    origin = origin.split(from).join(to)
  }

  for (const [from, to] of Object.entries(KOREAN_ALPHABETS_END_MAP)) {
    origin = origin.split(from).join(to)
  }

  return origin.normalize('NFD')
}

export function getFuzzyKoreanRatio (origin: string, target: string): number {
  return fuzz.ratio(
    normalizeKoreanNFCToNFD(origin),
    normalizeKoreanNFCToNFD(target)
  )
}

export function getFuzzyKoreanPartialRatio (origin: string, target: string): number {
  const normalizedOrigin = normalizeKoreanNFCToNFD(origin)
  const normalizedTarget = normalizeKoreanNFCToNFD(target)

  const lenOrigin = normalizedOrigin.length
  const lenTarget = normalizedTarget.length

  const ratio = fuzz.ratio(normalizedOrigin, normalizedTarget)
  if (lenOrigin * 1.2 < lenTarget || lenTarget * 1.2 < lenOrigin) {
    return Math.round(
      (fuzz.partial_ratio(normalizedOrigin, normalizedTarget) * 2 + ratio) / 3
    )
  }

  return ratio
}
