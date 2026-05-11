#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const pdfPath = path.join(projectRoot, 'public', 'IELTS Writing Band 9 Essays.pdf')
const rawOutputPath = path.join(projectRoot, 'temp', 'ielts-writing-band9-extracted.json')
const promptOutputPath = path.join(projectRoot, 'temp', 'ielts-writing-band9-prompts.json')

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`)
  }
}

function readPdfText(filePath) {
  return execFileSync('pdftotext', ['-layout', filePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 64,
  })
}

function cleanLine(line) {
  return line.replace(/\u0000/g, '').replace(/\s+$/g, '')
}

function splitPages(text) {
  const rawPages = text.split('\f')
  return rawPages.map((raw, index) => {
    const lines = raw.split('\n').map(cleanLine)
    let printedPage = null
    let end = lines.length

    while (end > 0 && lines[end - 1].trim() === '') {
      end -= 1
    }

    if (end > 0 && /^\d+$/.test(lines[end - 1].trim())) {
      printedPage = Number(lines[end - 1].trim())
      end -= 1
    }

    const contentLines = lines.slice(0, end)
    return {
      pdfPageIndex: index + 1,
      printedPage,
      lines: contentLines,
    }
  })
}

function buildLineRecords(pages) {
  const records = []
  for (const page of pages) {
    for (const text of page.lines) {
      records.push({
        text,
        printedPage: page.printedPage,
        pdfPageIndex: page.pdfPageIndex,
      })
    }
  }
  return records
}

function parseTocEntries(fullText) {
  const entries = []

  const academicRegex = /^\s*(?!Essay Notes|General Task 1 Useful Language|Step \d)([A-Za-z][^\n]*?[–-][^\n]*?)\s*\.{3,}\s+(\d+)\s*$/gm
  const generalRegex = /^\s*(\d+\.\s+Letter\s+[^\n]*?[–-][^\n]*?)\s*\.{3,}\s+(\d+)\s*$/gm
  const topicEssayRegex = /^\s*Sample Essay\s+[–-]\s+([^\n]*?)\s*\.{3,}\s+(\d+)\s*$/gm
  const additionalEssayRegex = /^\s*(\d+\.\s+Essay(?: Topic)?\s+[^\n]*?[–-][^\n]*?)\s*\.{3,}\s+(\d+)\s*$/gm

  for (const match of fullText.matchAll(academicRegex)) {
    const printedPage = Number(match[2])
    if (printedPage < 40 || printedPage > 63) continue
    entries.push({
      type: 'academic_task1',
      heading: match[1].trim(),
      printedPage,
    })
  }

  for (const match of fullText.matchAll(generalRegex)) {
    const printedPage = Number(match[2])
    if (printedPage < 70 || printedPage > 89) continue
    entries.push({
      type: 'general_task1',
      heading: match[1].trim(),
      printedPage,
    })
  }

  for (const match of fullText.matchAll(topicEssayRegex)) {
    const printedPage = Number(match[2])
    if (printedPage < 100 || printedPage > 155) continue
    entries.push({
      type: 'task2',
      heading: `Sample Essay – ${match[1].trim()}`,
      printedPage,
    })
  }

  for (const match of fullText.matchAll(additionalEssayRegex)) {
    const printedPage = Number(match[2])
    if (printedPage < 157 || printedPage > 186) continue
    entries.push({
      type: 'task2',
      heading: match[1].trim(),
      printedPage,
    })
  }

  return entries.sort((a, b) => a.printedPage - b.printedPage)
}

function compactLines(lines) {
  const next = []
  let lastBlank = true
  for (const line of lines) {
    const text = line.trim()
    if (!text) {
      if (!lastBlank) next.push('')
      lastBlank = true
      continue
    }
    next.push(text)
    lastBlank = false
  }
  while (next.length && next[0] === '') next.shift()
  while (next.length && next[next.length - 1] === '') next.pop()
  return next
}

function paragraphsFromLines(lines) {
  const cleaned = compactLines(lines)
  const paragraphs = []
  let buffer = []

  function flush() {
    if (!buffer.length) return
    paragraphs.push(buffer.join(' ').replace(/\s+/g, ' ').trim())
    buffer = []
  }

  for (const line of cleaned) {
    if (!line) {
      flush()
      continue
    }
    buffer.push(line)
  }
  flush()
  return paragraphs
}

function sentenceLike(line) {
  const words = line.trim().split(/\s+/).filter(Boolean)
  return words.length >= 8 && /[.!?]$/.test(line.trim())
}

function looksLikeTask2Prompt(text) {
  return /(discuss|to what extent|do the advantages|do you agree|what are the advantages|what are the causes|give your opinion|what is your opinion|what are the pros and cons|what problems|what solutions|who('|’)s responsibility|is the|are the|should|why|how far|what are)/i.test(text)
}

function normalizeSpace(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function stripHeading(type, heading) {
  if (type === 'general_task1') {
    return heading.replace(/^\d+\.\s+/, '').trim()
  }
  if (type === 'task2') {
    return heading.replace(/^\d+\.\s+/, '').replace(/^Sample Essay\s+[–-]\s+/, '').replace(/^Essay(?: Topic)?\s+[–-]\s+/, '').trim()
  }
  return heading.trim()
}

function collectPromptAndEssay(type, bodyLines) {
  if (type === 'general_task1') {
    const dearIndex = bodyLines.findIndex((line) => /^Dear\b/.test(line))
    const promptLines = dearIndex >= 0 ? bodyLines.slice(0, dearIndex) : []
    const essayLines = dearIndex >= 0 ? bodyLines.slice(dearIndex) : bodyLines
    return { promptLines, essayLines }
  }

  if (type === 'task2') {
    const promptLines = []
    let endIndex = -1
    for (let i = 0; i < bodyLines.length; i += 1) {
      promptLines.push(bodyLines[i])
      const recent = promptLines.slice(-3).join(' ').replace(/\s+/g, ' ').trim()
      if (/[.?]$/.test(bodyLines[i].trim()) && promptLines.length >= 2 && looksLikeTask2Prompt(recent)) {
        endIndex = i
        break
      }
    }
    const essayLines = endIndex >= 0 ? bodyLines.slice(endIndex + 1) : bodyLines
    return { promptLines, essayLines }
  }

  const promptLines = []
  let endIndex = -1
  for (let i = 0; i < bodyLines.length; i += 1) {
    promptLines.push(bodyLines[i])
    if (/(appropriate|relevant)\.$/i.test(bodyLines[i].trim())) {
      endIndex = i
      break
    }
  }

  const afterPrompt = endIndex >= 0 ? bodyLines.slice(endIndex + 1) : bodyLines
  let essayStart = afterPrompt.findIndex((line, index) => {
    if (sentenceLike(line)) return true
    const next = afterPrompt[index + 1] || ''
    const words = line.trim().split(/\s+/).filter(Boolean)
    return words.length >= 6 && sentenceLike(next)
  })
  if (essayStart < 0) essayStart = 0
  if (essayStart > 0 && /^[a-z]/.test(afterPrompt[essayStart].trim())) {
    essayStart -= 1
  }
  const essayLines = afterPrompt.slice(essayStart)
  return { promptLines, essayLines }
}

function inferTaskType(entry) {
  if (entry.type === 'task2') return 'task2'
  if (entry.type === 'general_task1') return 'general_task1'
  return 'academic_task1'
}

function inferChartType(title) {
  const normalized = title.toLowerCase()
  if (normalized.includes('line graph')) return 'line-graph'
  if (normalized.includes('bar graph')) return 'bar-graph'
  if (normalized.includes('pie chart')) return 'pie-chart'
  if (normalized.includes('table')) return 'table'
  if (normalized.includes('flowchart')) return 'flowchart'
  if (normalized.includes('diagram')) return 'diagram'
  if (normalized.includes('letter')) return 'letter'
  return ''
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function extractEntries(records, entryDefs) {
  const results = []

  for (let i = 0; i < entryDefs.length; i += 1) {
    const entry = entryDefs[i]
    const next = entryDefs[i + 1]
    const slice = records.slice(entry.index + 1, next ? next.index : records.length)
    const notesMarker = slice.findIndex((line) => /^(Essay Notes|Notes)$/i.test(line.text.trim()))
    const vocabMarker = slice.findIndex((line) => /^(Essay Vocabulary|Key vocabulary)$/i.test(line.text.trim()))
    const bodyEnd = notesMarker >= 0 ? notesMarker : slice.length
    const bodyLines = slice.slice(0, bodyEnd).map((line) => line.text)

    const notesStart = notesMarker >= 0 ? notesMarker + 1 : slice.length
    const notesEnd = vocabMarker >= 0 ? vocabMarker : slice.length
    const noteLines = slice.slice(notesStart, notesEnd).map((line) => line.text)
    const vocabLines = vocabMarker >= 0 ? slice.slice(vocabMarker + 1).map((line) => line.text) : []

    const { promptLines, essayLines } = collectPromptAndEssay(entry.type, bodyLines)
    const prompt = paragraphsFromLines(promptLines).join('\n\n').trim()
    const essayParagraphs = paragraphsFromLines(essayLines)
    const notesParagraphs = paragraphsFromLines(noteLines)
    const vocabularyParagraphs = paragraphsFromLines(vocabLines)

    const sourceEndRecord = slice[slice.length - 1] ?? records[entry.index]
    const title = stripHeading(entry.type, entry.heading)
    const taskType = inferTaskType(entry)
    const chartType = inferChartType(title)

    results.push({
      id: `${taskType}-${String(results.length + 1).padStart(2, '0')}-${slugify(title)}`,
      sourcePdf: path.basename(pdfPath),
      title,
      taskType,
      chartType,
      prompt,
      essay: essayParagraphs.join('\n\n').trim(),
      essayParagraphs,
      notes: notesParagraphs.join('\n\n').trim(),
      notesParagraphs,
      vocabulary: vocabularyParagraphs.join('\n\n').trim(),
      vocabularyParagraphs,
      sourcePageStart: entry.printedPage,
      sourcePageEnd: sourceEndRecord.printedPage ?? entry.printedPage,
      sourcePdfPageStart: records[entry.index].pdfPageIndex,
      sourcePdfPageEnd: sourceEndRecord.pdfPageIndex ?? records[entry.index].pdfPageIndex,
    })
  }

  return results
}

function buildPromptBank(entries) {
  return entries.map((entry) => ({
    id: entry.id,
    taskType: entry.taskType,
    title: entry.title,
    prompt: entry.prompt,
    source: `${entry.sourcePdf} pp.${entry.sourcePageStart}-${entry.sourcePageEnd}`,
    chartType: entry.chartType || undefined,
  }))
}

function printedPageRecordIndex(records, entry) {
  return records.findIndex(
    (record) => record.printedPage === entry.printedPage
      && normalizeSpace(record.text) === normalizeSpace(entry.heading),
  )
}

function extractPromptFromStartPage(entry, pages) {
  const page = pages.find((item) => item.printedPage === entry.sourcePageStart)
  if (!page) return entry.prompt

  const lines = page.lines.map((line) => line.trim())
  const headingCandidates = [
    entry.title,
    `Sample Essay – ${entry.title}`,
    `${entry.title}`,
  ]
  if (entry.taskType === 'general_task1') {
    headingCandidates.push(`${entry.id.match(/general_task1-(\d+)/) ? '' : ''}`)
  }

  let headingIndex = lines.findIndex((line) => {
    const normalized = normalizeSpace(line)
    return headingCandidates.some((candidate) => normalized === normalizeSpace(candidate))
      || (entry.taskType === 'general_task1' && /Letter\s+[–-]\s+/.test(normalized) && normalized.includes(entry.title.replace(/^Letter\s+[–-]\s+/, '')))
      || (entry.taskType === 'task2' && /Essay/.test(normalized) && normalized.includes(entry.title))
  })

  if (headingIndex < 0) headingIndex = 0
  const tail = lines.slice(headingIndex + 1)

  if (entry.taskType === 'general_task1') {
    const end = tail.findIndex((line) => /^Dear\b/.test(line))
    return normalizeSpace(tail.slice(0, end >= 0 ? end : tail.length).join(' '))
  }

  if (entry.taskType === 'academic_task1') {
    const promptLines = []
    for (const line of tail) {
      promptLines.push(line)
      if (/(appropriate|relevant)\.$/i.test(line)) break
    }
    return normalizeSpace(promptLines.join(' '))
  }

  const promptLines = []
  for (let i = 0; i < tail.length; i += 1) {
    promptLines.push(tail[i])
    const recent = promptLines.slice(-3).join(' ').replace(/\s+/g, ' ').trim()
    if (/[.?]$/.test(tail[i]) && promptLines.length >= 2 && looksLikeTask2Prompt(recent)) {
      break
    }
  }
  return normalizeSpace(promptLines.join(' '))
}

function main() {
  ensureFile(pdfPath)
  const text = readPdfText(pdfPath)
  const pages = splitPages(text)
  const records = buildLineRecords(pages)
  const tocEntries = parseTocEntries(text)
  const entryDefs = tocEntries
    .map((entry) => ({
      ...entry,
      index: printedPageRecordIndex(records, entry),
    }))
    .filter((entry) => entry.index >= 0)
  const entries = extractEntries(records, entryDefs).map((entry) => ({
    ...entry,
    prompt: extractPromptFromStartPage(entry, pages),
  }))
  const promptBank = buildPromptBank(entries)

  fs.writeFileSync(rawOutputPath, JSON.stringify(entries, null, 2))
  fs.writeFileSync(promptOutputPath, JSON.stringify(promptBank, null, 2))

  const summary = {
    totalEntries: entries.length,
    academicTask1: entries.filter((item) => item.taskType === 'academic_task1').length,
    generalTask1: entries.filter((item) => item.taskType === 'general_task1').length,
    task2: entries.filter((item) => item.taskType === 'task2').length,
    rawOutputPath,
    promptOutputPath,
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
}

main()
