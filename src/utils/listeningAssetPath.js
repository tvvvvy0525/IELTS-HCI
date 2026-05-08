const GENERATED_PREFIX = '/generated/IELTS Listening/'
const LEGACY_SEGMENT = '/generated/IELTS Listening/'

function normalizeSlashes(value) {
  return value.replace(/\\/g, '/')
}

export function isLegacyAbsoluteListeningPath(inputPath) {
  if (typeof inputPath !== 'string' || !inputPath.trim()) return false

  const normalized = normalizeSlashes(inputPath.trim())
  return normalized.startsWith('/')
    && !normalized.startsWith(GENERATED_PREFIX)
    && normalized.includes(LEGACY_SEGMENT)
}

export function buildListeningPublicPath(inputPath) {
  if (typeof inputPath !== 'string' || !inputPath.trim()) return ''

  const normalized = normalizeSlashes(inputPath.trim())

  if (normalized.startsWith(GENERATED_PREFIX)) {
    return normalized
  }

  const generatedIndex = normalized.indexOf(LEGACY_SEGMENT)
  if (generatedIndex >= 0) {
    return normalized.slice(generatedIndex)
  }

  if (normalized.startsWith('generated/IELTS Listening/')) {
    return `/${normalized}`
  }

  if (normalized.startsWith('/public/generated/IELTS Listening/')) {
    return normalized.replace('/public', '')
  }

  return ''
}

export function normalizeListeningAssetPath(inputPath) {
  return buildListeningPublicPath(inputPath)
}
