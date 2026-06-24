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
    </UContainer>
  </UApp>
</template>
