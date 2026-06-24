<script setup lang="ts">
const modeOptions = [
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
] as const

type SplitMode = typeof modeOptions[number]['value']
type CopyState = 'idle' | 'copied' | 'error'

type ModeOption = (typeof modeOptions)[number]

const modeConfig = modeOptions.reduce<Record<SplitMode, ModeOption>>((accumulator, option) => {
  accumulator[option.value] = option
  return accumulator
}, {} as Record<SplitMode, ModeOption>)

const inputText = ref('')
const mode = ref<SplitMode>('sentences')
const parameter = ref(modeConfig.sentences.defaultValue)
const outputChunks = ref<string[]>([])
const copyState = ref<CopyState>('idle')

const activeMode = computed(() => modeConfig[mode.value])
const fullOutput = computed(() => outputChunks.value.join('\n\n'))

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Text Partitioner',
  description: 'Split long text into clean, paragraph-like chunks in your browser.'
})

watch(mode, (nextMode) => {
  const nextConfig = modeConfig[nextMode]

  if (parameter.value < nextConfig.min) {
    parameter.value = nextConfig.defaultValue
  }

  copyState.value = 'idle'
})

watch(outputChunks, () => {
  copyState.value = 'idle'
})

function normalizeParagraph(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function getParagraphs(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n+/)
    .map(normalizeParagraph)
    .filter(Boolean)
}

function splitIntoSentences(value: string) {
  const normalized = normalizeParagraph(value)

  if (!normalized) {
    return []
  }

  return (normalized.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g) ?? [])
    .map(sentence => normalizeParagraph(sentence))
    .filter(Boolean)
}

function chunkBySentences(value: string, sentencesPerChunk: number) {
  const sentences = splitIntoSentences(value)

  if (!sentences.length) {
    return []
  }

  const chunks: string[] = []

  for (let index = 0; index < sentences.length; index += sentencesPerChunk) {
    chunks.push(sentences.slice(index, index + sentencesPerChunk).join(' '))
  }

  return chunks.map(normalizeParagraph).filter(Boolean)
}

function chunkByCharacters(value: string, targetSize: number) {
  const words = normalizeParagraph(value).split(/\s+/).filter(Boolean)

  if (!words.length) {
    return []
  }

  const chunks: string[] = []
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

function inferParagraphs(value: string, targetSentences: number) {
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

function processText() {
  const trimmedInput = inputText.value.trim()

  if (!trimmedInput) {
    outputChunks.value = []
    return
  }

  const paragraphs = getParagraphs(trimmedInput)
  const sourceBlocks = paragraphs.length > 1 ? paragraphs : [normalizeParagraph(trimmedInput)]
  const normalizedParameter = Math.max(activeMode.value.min, Math.round(parameter.value || activeMode.value.defaultValue))

  let chunks: string[] = []

  if (mode.value === 'sentences') {
    chunks = sourceBlocks.flatMap(block => chunkBySentences(block, normalizedParameter))
  }
  else if (mode.value === 'characters') {
    chunks = sourceBlocks.flatMap(block => chunkByCharacters(block, normalizedParameter))
  }
  else {
    chunks = inferParagraphs(trimmedInput, normalizedParameter)
  }

  outputChunks.value = chunks
    .map(normalizeParagraph)
    .filter(Boolean)
}

async function copyOutput() {
  if (!fullOutput.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(fullOutput.value)
    copyState.value = 'copied'
  }
  catch {
    copyState.value = 'error'
  }
}
</script>

<template>
  <UApp>
    <UContainer class="py-10 sm:py-16">
      <div class="mx-auto flex max-w-6xl flex-col gap-8">
        <section class="space-y-3">
          <UBadge color="primary" variant="subtle" label="Client-side Nuxt 4 tool" />
          <div class="space-y-2">
            <h1 class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
              Text Partitioner
            </h1>
            <p class="max-w-3xl text-base text-muted">
              Paste a large text block, choose how to split it, and generate tidy paragraph-like chunks without leaving the browser.
            </p>
          </div>
        </section>

        <div class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <UCard>
            <template #header>
              <div class="space-y-1">
                <h2 class="text-lg font-semibold text-highlighted">
                  Input
                </h2>
                <p class="text-sm text-muted">
                  Existing paragraphs are preserved where possible, and extra whitespace is cleaned up automatically.
                </p>
              </div>
            </template>

            <div class="space-y-6">
              <UFormField
                label="Text to partition"
                description="Paste raw text, notes, transcripts, or any other large text block."
              >
                <UTextarea
                  v-model="inputText"
                  :rows="16"
                  autoresize
                  placeholder="Paste or type your text here..."
                  class="w-full"
                />
              </UFormField>

              <div class="grid gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <UFormField
                  label="Splitting mode"
                  :description="activeMode.description"
                >
                  <USelect
                    v-model="mode"
                    :items="modeOptions"
                    value-key="value"
                    label-key="label"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  :label="activeMode.parameterLabel"
                  :description="`Minimum ${activeMode.min}`"
                >
                  <UInputNumber
                    v-model="parameter"
                    :min="activeMode.min"
                    :step="activeMode.step"
                    orientation="vertical"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </div>

            <template #footer>
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-sm text-muted">
                  Handles sentence splits with <span class="font-medium text-default">.</span>, <span class="font-medium text-default">!</span>, and <span class="font-medium text-default">?</span>
                </p>

                <UButton
                  icon="i-lucide-split"
                  size="lg"
                  @click="processText"
                >
                  Process text
                </UButton>
              </div>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div class="space-y-1">
                  <h2 class="text-lg font-semibold text-highlighted">
                    Output
                  </h2>
                  <p class="text-sm text-muted">
                    {{ outputChunks.length ? `${outputChunks.length} chunk${outputChunks.length === 1 ? '' : 's'} ready` : 'Your partitioned text will appear here.' }}
                  </p>
                </div>

                <UButton
                  :disabled="!outputChunks.length"
                  :color="copyState === 'error' ? 'error' : 'neutral'"
                  :icon="copyState === 'copied' ? 'i-lucide-check' : 'i-lucide-copy'"
                  variant="soft"
                  @click="copyOutput"
                >
                  {{ copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy full output' }}
                </UButton>
              </div>
            </template>

            <div v-if="outputChunks.length" class="space-y-4">
              <UCard
                v-for="(chunk, index) in outputChunks"
                :key="`${index}-${chunk.slice(0, 24)}`"
                variant="subtle"
              >
                <template #header>
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-sm font-medium text-highlighted">Chunk {{ index + 1 }}</span>
                    <span class="text-xs text-muted">{{ chunk.length }} characters</span>
                  </div>
                </template>

                <p class="whitespace-pre-wrap text-sm leading-6 text-default">
                  {{ chunk }}
                </p>
              </UCard>
            </div>

            <UEmpty
              v-else
              icon="i-lucide-file-text"
              title="No output yet"
              description="Paste text, choose a mode, and process it to generate clean paragraph-like chunks."
              class="min-h-[24rem] justify-center"
            />
          </UCard>
        </div>
      </div>
    </UContainer>
  </UApp>
</template>
