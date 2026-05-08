function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function stripPunctuation(value) {
  return value.replace(/[.,!?;:()[\]{}"'`]/g, ' ')
}

function stripArticles(value) {
  return value.replace(/\b(a|an|the)\b/g, ' ')
}

function singularizeToken(token) {
  if (token.endsWith('ies') && token.length > 4) {
    return `${token.slice(0, -3)}y`
  }

  if (/(ches|shes|sses|xes|zes|oes)$/.test(token) && token.length > 4) {
    return token.slice(0, -2)
  }

  if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) {
    return token.slice(0, -1)
  }

  return token
}

function singularizePhrase(value) {
  return value
    .split(' ')
    .filter(Boolean)
    .map(singularizeToken)
    .join(' ')
}

function normalizeBase(value) {
  return normalizeWhitespace(stripPunctuation(String(value || '').toLowerCase()))
}

function buildVariants(value) {
  const base = normalizeBase(value)
  const noArticles = normalizeWhitespace(stripArticles(base))
  const singularBase = singularizePhrase(base)
  const singularNoArticles = singularizePhrase(noArticles)

  return new Set([base, noArticles, singularBase, singularNoArticles].filter(Boolean))
}

export function isReadingAnswerCorrect(userAnswer, correctAnswer) {
  const userVariants = buildVariants(userAnswer)
  const correctVariants = buildVariants(correctAnswer)

  for (const candidate of userVariants) {
    if (correctVariants.has(candidate)) {
      return true
    }
  }

  return false
}
