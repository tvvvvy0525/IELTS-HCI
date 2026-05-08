import { normalizeListeningAssetPath } from './listeningAssetPath.js'

function fallbackRoute(subject, examId = '') {
  if (subject === 'listening') {
    return {
      path: examId ? `/exam/listening/${examId}` : '/exam/listening',
    }
  }

  if (subject === 'reading') {
    return {
      path: examId ? `/exam/reading/${examId}` : '/exam/reading',
    }
  }

  return {
    path: '/exam/dashboard',
  }
}

export function buildReadingRoute(record) {
  if (record?.routeTarget?.path) {
    return {
      path: record.routeTarget.path,
    }
  }

  return fallbackRoute('reading', record?.examId)
}

export function buildListeningRoute(record) {
  const normalizedPath = record?.routeTarget?.query?.path
    ? normalizeListeningAssetPath(record.routeTarget.query.path)
    : ''

  if (record?.routeTarget?.path && normalizedPath) {
    return {
      path: record.routeTarget.path,
      query: {
        ...record.routeTarget.query,
        path: normalizedPath,
      },
    }
  }

  return {
    path: '/exam/listening',
  }
}

export async function resolveListeningRoute(record) {
  try {
    await import('../generated/listening-exams/manifest.js')
    const manifest = window.__LISTENING_EXAM_MANIFEST__ || {}
    const manifestItem = manifest[record?.examId]

    if (manifestItem?.examId && manifestItem?.path) {
      return {
        path: `/exam/listening/${manifestItem.examId}`,
        query: {
          path: normalizeListeningAssetPath(manifestItem.path),
          title: manifestItem.title || record?.routeTarget?.query?.title || '',
        },
      }
    }
  } catch (error) {
    console.warn('Failed to resolve listening route from manifest', error)
  }

  return buildListeningRoute(record)
}

export function buildRouteFromRecord(record) {
  if (record?.subject === 'listening') {
    return buildListeningRoute(record)
  }

  if (record?.subject === 'reading') {
    return buildReadingRoute(record)
  }

  return {
    path: '/exam/dashboard',
  }
}

export async function resolveRouteFromRecord(record) {
  if (record?.subject === 'listening') {
    return resolveListeningRoute(record)
  }

  return buildRouteFromRecord(record)
}
