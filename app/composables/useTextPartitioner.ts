import { computed, ref, watch } from 'vue'

export type SplitMode = 'sentences' | 'characters'

export interface ModeOption {
  label: string
  value: SplitMode
  parameterLabel: string
  description: string
  min: number
  step: number
  defaultValue: number
}

export const modeOptions: ModeOption[] = [
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
    description: 'Create chunks near a target character length by grouping sentences.',
    min: 80,
    step: 20,
    defaultValue: 320
  }
]

export const modeConfig = Object.fromEntries(modeOptions.map(option => [option.value, option])) as Record<SplitMode, ModeOption>

export function flattenText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

export function splitIntoSentences(value: string) {
  const flattened = flattenText(value)

  if (!flattened) {
    return []
  }

  return (flattened.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g) ?? [])
    .map(s => s.trim())
    .filter(Boolean)
}

export function chunkBySentences(sentences: string[], sentencesPerChunk: number) {
  if (!sentences.length) {
    return []
  }

  const chunks: string[] = []

  for (let index = 0; index < sentences.length; index += sentencesPerChunk) {
    chunks.push(sentences.slice(index, index + sentencesPerChunk).join(' '))
  }

  return chunks
}

export function chunkByCharacters(sentences: string[], targetSize: number) {
  if (!sentences.length) {
    return []
  }

  const chunks: string[] = []
  let current: string[] = []
  let currentLength = 0

  for (const sentence of sentences) {
    const gap = current.length > 0 ? 1 : 0
    const candidateLength = currentLength + gap + sentence.length

    if (current.length > 0 && candidateLength > targetSize) {
      chunks.push(current.join(' '))
      current = [sentence]
      currentLength = sentence.length
    }
    else {
      current.push(sentence)
      currentLength = candidateLength
    }
  }

  if (current.length > 0) {
    chunks.push(current.join(' '))
  }

  return chunks
}

export function partitionText(inputText: string, mode: SplitMode, parameter: number | null | undefined) {
  const trimmedInput = inputText.trim()

  if (!trimmedInput) {
    return []
  }

  const activeMode = modeConfig[mode] ?? modeConfig.sentences
  const normalizedParameter = Math.max(activeMode.min, Math.round(parameter || activeMode.defaultValue))

  const sentences = splitIntoSentences(trimmedInput)

  if (!sentences.length) {
    return []
  }

  if (mode === 'sentences') {
    return chunkBySentences(sentences, normalizedParameter)
  }

  return chunkByCharacters(sentences, normalizedParameter)
}

export function useTextPartitioner() {
  const inputText = ref('')
  const mode = ref<SplitMode>('sentences')
  const parameter = ref<number | null>(modeConfig.sentences.defaultValue)
  const outputChunks = ref<string[]>([])
  const hasProcessed = ref(false)

  const activeMode = computed(() => modeConfig[mode.value])

  watch(mode, (nextMode) => {
    const nextConfig = modeConfig[nextMode]

    if ((parameter.value ?? 0) < nextConfig.min) {
      parameter.value = nextConfig.defaultValue
    }
  })

  function processText() {
    outputChunks.value = partitionText(inputText.value, mode.value, parameter.value)
    hasProcessed.value = true
  }

  watch([mode, parameter], () => {
    if (hasProcessed.value && inputText.value.trim()) {
      outputChunks.value = partitionText(inputText.value, mode.value, parameter.value)
    }
  })

  return {
    inputText,
    mode,
    parameter,
    outputChunks,
    activeMode,
    processText
  }
}
