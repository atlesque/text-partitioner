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
    <NavBar />
    <UContainer class="py-4 sm:py-8">
      <div class="mx-auto flex max-w-6xl flex-col gap-8">
        <div class="grid gap-6 lg:grid-cols-2">
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
