import test from 'node:test'
import assert from 'node:assert/strict'

import {
  findReadingExplanation,
  flattenReadingExplanationItems,
} from '../src/utils/readingExplanations.js'

const mockExplanationData = {
  questionExplanations: [
    {
      items: [
        { questionId: 'q1', questionNumber: 1, text: '解析 1' },
        { questionId: 'q2', questionNumber: 2, text: '解析 2' },
      ],
    },
    {
      items: [
        { questionId: 'q7', questionNumber: 7, text: '解析 7' },
      ],
    },
  ],
}

test('flattenReadingExplanationItems flattens nested explanation items', () => {
  const items = flattenReadingExplanationItems(mockExplanationData)
  assert.equal(items.length, 3)
  assert.equal(items[2].questionId, 'q7')
})

test('findReadingExplanation returns matching explanation item', () => {
  assert.equal(findReadingExplanation(mockExplanationData, 'q2')?.text, '解析 2')
  assert.equal(findReadingExplanation(mockExplanationData, 'q9'), null)
})
