import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildListeningPublicPath,
  isLegacyAbsoluteListeningPath,
  normalizeListeningAssetPath,
} from '../src/utils/listeningAssetPath.js'
import { normalizeExamRecord } from '../src/utils/examHistory.js'
import { buildListeningRoute } from '../src/utils/examNavigation.js'

test('normalizeListeningAssetPath converts legacy absolute paths to public generated URLs', () => {
  const input = '/Users/tiffany/code/Ielts-HCI/generated/IELTS Listening/P1/72. P1 Film club/72. P1 Film club.html'

  assert.equal(
    normalizeListeningAssetPath(input),
    '/generated/IELTS Listening/P1/72. P1 Film club/72. P1 Film club.html',
  )
})

test('normalizeListeningAssetPath preserves already normalized public paths', () => {
  const input = '/generated/IELTS Listening/P2/70. P2 Museum Tour/70. P2 Museum Tour.html'

  assert.equal(normalizeListeningAssetPath(input), input)
  assert.equal(buildListeningPublicPath(input), input)
})

test('normalizeListeningAssetPath returns empty string for invalid input', () => {
  assert.equal(normalizeListeningAssetPath(''), '')
  assert.equal(normalizeListeningAssetPath(null), '')
  assert.equal(normalizeListeningAssetPath('/tmp/not-listening.html'), '')
})

test('legacy absolute path detection is limited to repo listening assets', () => {
  assert.equal(
    isLegacyAbsoluteListeningPath('/Users/tiffany/code/Ielts-HCI/generated/IELTS Listening/P3/58. P3 Peer Assessment/58. P3 Peer Assessment.html'),
    true,
  )
  assert.equal(
    isLegacyAbsoluteListeningPath('/Users/tiffany/code/Ielts-HCI/generated/IELTS Reading/P1/foo.html'),
    false,
  )
})

test('normalizeExamRecord upgrades old listening routeTarget query path', () => {
  const record = normalizeExamRecord({
    subject: 'listening',
    examId: 'listening-p1-72',
    title: 'Listening-P1-Film club',
    part: 'P1',
    score: 18,
    maxScore: 20,
    durationSecs: 760,
    routeTarget: {
      path: '/exam/listening/listening-p1-72',
      query: {
        path: '/Users/tiffany/code/Ielts-HCI/generated/IELTS Listening/P1/72. P1 Film club/72. P1 Film club.html',
        title: 'Film club',
      },
    },
  })

  assert.equal(
    record.routeTarget.query.path,
    '/generated/IELTS Listening/P1/72. P1 Film club/72. P1 Film club.html',
  )
})

test('buildListeningRoute emits normalized public path for old records', () => {
  const route = buildListeningRoute({
    examId: 'listening-p1-72',
    routeTarget: {
      path: '/exam/listening/listening-p1-72',
      query: {
        path: '/Users/tiffany/code/Ielts-HCI/generated/IELTS Listening/P1/72. P1 Film club/72. P1 Film club.html',
        title: 'Film club',
      },
    },
  })

  assert.deepEqual(route, {
    path: '/exam/listening/listening-p1-72',
    query: {
      path: '/generated/IELTS Listening/P1/72. P1 Film club/72. P1 Film club.html',
      title: 'Film club',
    },
  })
})
