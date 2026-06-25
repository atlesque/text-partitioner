<script setup lang="ts">
const { inputText, mode, parameter, outputChunks, activeMode, processText } = useTextPartitioner()

const copyState = ref<'idle' | 'copied' | 'error'>('idle')

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Text Partitioner',
  description: 'Split long text into clean, paragraph-like chunks in your browser.'
})

watch(outputChunks, () => {
  copyState.value = 'idle'
})

async function copyOutput() {
  const fullOutput = outputChunks.value.join('\n\n')

  if (!fullOutput) {
    return
  }

  try {
    await navigator.clipboard.writeText(fullOutput)
    copyState.value = 'copied'
  }
  catch {
    copyState.value = 'error'
  }
}
</script>

<template>
  <UApp>
    <div class="flex h-screen flex-col overflow-hidden">
      <div class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 overflow-hidden px-4 py-4 sm:px-6">
        <header class="shrink-0 space-y-0.5">
          <h1 class="text-xl font-semibold tracking-tight text-highlighted">
            Text Partitioner
          </h1>
          <p class="text-sm text-muted">
            Split long text into clean, paragraph-like chunks in your browser.
          </p>
        </header>

        <div class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <TextPartitionerInput
            v-model:input-text="inputText"
            v-model:mode="mode"
            v-model:parameter="parameter"
            :active-mode="activeMode"
            @process="processText"
          />

          <TextPartitionerOutput
            :output-chunks="outputChunks"
            :copy-state="copyState"
            @copy="copyOutput"
          />
        </div>
      </div>
    </div>
  </UApp>
</template>
