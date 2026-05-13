const BAND_TABLES = {
  listening: [
    { min: 39, max: 40, band: 9.0 },
    { min: 37, max: 38, band: 8.5 },
    { min: 35, max: 36, band: 8.0 },
    { min: 32, max: 34, band: 7.5 },
    { min: 30, max: 31, band: 7.0 },
    { min: 26, max: 29, band: 6.5 },
    { min: 23, max: 25, band: 6.0 },
    { min: 18, max: 22, band: 5.5 },
    { min: 16, max: 17, band: 5.0 },
    { min: 13, max: 15, band: 4.5 },
    { min: 10, max: 12, band: 4.0 },
    { min: 8, max: 9, band: 3.5 },
    { min: 6, max: 7, band: 3.0 },
    { min: 4, max: 5, band: 2.5 },
    { min: 2, max: 3, band: 2.0 },
    { min: 1, max: 1, band: 1.0 },
    { min: 0, max: 0, band: 0.0 },
  ],
  reading: [
    { min: 39, max: 40, band: 9.0 },
    { min: 37, max: 38, band: 8.5 },
    { min: 35, max: 36, band: 8.0 },
    { min: 33, max: 34, band: 7.5 },
    { min: 30, max: 32, band: 7.0 },
    { min: 27, max: 29, band: 6.5 },
    { min: 23, max: 26, band: 6.0 },
    { min: 19, max: 22, band: 5.5 },
    { min: 15, max: 18, band: 5.0 },
    { min: 13, max: 14, band: 4.5 },
    { min: 10, max: 12, band: 4.0 },
    { min: 8, max: 9, band: 3.5 },
    { min: 6, max: 7, band: 3.0 },
    { min: 4, max: 5, band: 2.5 },
    { min: 2, max: 3, band: 2.0 },
    { min: 1, max: 1, band: 1.0 },
    { min: 0, max: 0, band: 0.0 },
  ],
}

function clampCorrectCount(correctCount) {
  if (!Number.isFinite(correctCount)) {
    throw new Error('请输入 0 到 40 之间的正确题数')
  }

  if (correctCount < 0 || correctCount > 40) {
    throw new Error('正确题数必须在 0 到 40 之间')
  }

  return Math.round(correctCount)
}

export function convertScoreToBand(module, correctCount) {
  const table = BAND_TABLES[module]
  if (!table) {
    throw new Error('暂不支持该科目换算')
  }

  const normalizedCount = clampCorrectCount(correctCount)
  const matched = table.find((item) => normalizedCount >= item.min && normalizedCount <= item.max)

  if (!matched) {
    throw new Error('未找到对应的 Band 换算结果')
  }

  return {
    module,
    correctCount: normalizedCount,
    band: matched.band.toFixed(1),
    bandLabel: `Band ${matched.band.toFixed(1)}`,
    rangeLabel: `${matched.min}-${matched.max} 题`,
    summary: `${normalizedCount} 题约为 Band ${matched.band.toFixed(1)}`,
  }
}

