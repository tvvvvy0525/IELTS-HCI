export function flattenReadingExplanationItems(explanationData) {
  if (!explanationData?.questionExplanations || !Array.isArray(explanationData.questionExplanations)) {
    return []
  }

  return explanationData.questionExplanations.flatMap((section) => (
    Array.isArray(section.items) ? section.items : []
  ))
}

export function findReadingExplanation(explanationData, questionId) {
  return flattenReadingExplanationItems(explanationData)
    .find((item) => item.questionId === questionId) || null
}
