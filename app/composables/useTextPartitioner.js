import { computed, ref, watch } from 'vue'

export const modeOptions = [
  {
    label: 'Sentences per chunk',
    value: 'sentences',
    parameterLabel: 'Sentences per chunk',
    description: 'Group nearby sentences into balanced paragraph-like chunks.',
    min: 1,
    step: 1,
    defaultValue: 3
  },
  {
    label: 'Average chunk size',
    value: 'characters',
    parameterLabel: 'Average characters per chunk',
    description: 'Create chunks near a target character length without splitting words.',
    min: 80,
    step: 20,
    defaultValue: 320
  },
  {
    label: 'Auto paragraph cleanup',
    value: 'auto',
    parameterLabel: 'Target sentences per paragraph',
    description: 'Preserve existing paragraphs or infer new ones from a continuous block.',
    min: 1,
    step: 1,
    defaultValue: 4
  }
]

export const modeConfig = Object.fromEntries(modeOptions.map(option => [option.value, option]))

export function normalizeParagraph(value) {
  return value.replace(/\s+/g, ' ').trim()
}

export function getParagraphs(value) {
  return value
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n+/)
    .map(normalizeParagraph)
    .filter(Boolean)
}

export function splitIntoSentences(value) {
  const normalized = normalizeParagraph(value)

  if (!normalized) {
    return []
  }

  return (normalized.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g) ?? [])
    .map(sentence => normalizeParagraph(sentence))
    .filter(Boolean)
}

export function chunkBySentences(value, sentencesPerChunk) {
  const sentences = splitIntoSentences(value)

  if (!sentences.length) {
    return []
  }

  const chunks = []

  for (let index = 0; index < sentences.length; index += sentencesPerChunk) {
    chunks.push(sentences.slice(index, index + sentencesPerChunk).join(' '))
  }

  return chunks.map(normalizeParagraph).filter(Boolean)
}

export function chunkByCharacters(value, targetSize) {
  const words = normalizeParagraph(value).split(/\s+/).filter(Boolean)

  if (!words.length) {
    return []
  }

  const chunks = []
  let currentChunk = ''

  for (const word of words) {
    const candidate = currentChunk ? `${currentChunk} ${word}` : word

    if (currentChunk && candidate.length > targetSize) {
      chunks.push(currentChunk)
      currentChunk = word
      continue
    }

    currentChunk = candidate
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  return chunks.filter(Boolean)
}

export function inferParagraphs(value, targetSentences) {
  const paragraphs = getParagraphs(value)

  if (paragraphs.length > 1) {
    return paragraphs
  }

  const sentenceChunks = chunkBySentences(value, targetSentences)

  if (sentenceChunks.length > 1) {
    return sentenceChunks
  }

  return chunkByCharacters(value, Math.max(targetSentences * 140, 140))
}

export function partitionText(inputText, mode, parameter) {
  const trimmedInput = inputText.trim()

  if (!trimmedInput) {
    return []
  }

  const activeMode = modeConfig[mode] ?? modeConfig.sentences
  const normalizedParameter = Math.max(activeMode.min, Math.round(parameter || activeMode.defaultValue))
  const paragraphs = getParagraphs(trimmedInput)
  const sourceBlocks = paragraphs.length > 1 ? paragraphs : [normalizeParagraph(trimmedInput)]

  let chunks = []

  if (mode === 'sentences') {
    chunks = sourceBlocks.flatMap(block => chunkBySentences(block, normalizedParameter))
  }
  else if (mode === 'characters') {
    chunks = sourceBlocks.flatMap(block => chunkByCharacters(block, normalizedParameter))
  }
  else {
    chunks = inferParagraphs(trimmedInput, normalizedParameter)
  }

  return chunks.map(normalizeParagraph).filter(Boolean)
}

export function useTextPartitioner() {
  const inputText = ref('')
  const mode = ref('sentences')
  const parameter = ref(modeConfig.sentences.defaultValue)
  const outputChunks = ref([])

  const activeMode = computed(() => modeConfig[mode.value])
  watch(mode, (nextMode) => {
    const nextConfig = modeConfig[nextMode]

    if (parameter.value < nextConfig.min) {
      parameter.value = nextConfig.defaultValue
    }
  })

  function processText() {
    outputChunks.value = partitionText(inputText.value, mode.value, parameter.value)
  }

  return {
    inputText,
    mode,
    parameter,
    outputChunks,
    activeMode,
    processText
  }
}
