<script setup>
const props = defineProps({
  outputChunks: {
    type: Array,
    required: true
  },
  copyState: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['copy'])

const outputSummary = computed(() => {
  if (!props.outputChunks.length) {
    return 'Your partitioned text will appear here.'
  }

  const count = props.outputChunks.length
  return `${count} chunk${count === 1 ? '' : 's'} ready`
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-highlighted">
            Output
          </h2>
          <p class="text-sm text-muted">
            {{ outputSummary }}
          </p>
        </div>

        <UButton
          :disabled="!props.outputChunks.length"
          :color="props.copyState === 'error' ? 'error' : 'neutral'"
          :icon="props.copyState === 'copied' ? 'i-lucide-check' : 'i-lucide-copy'"
          variant="soft"
          @click="emit('copy')"
        >
          {{ props.copyState === 'copied' ? 'Copied' : props.copyState === 'error' ? 'Copy failed' : 'Copy full output' }}
        </UButton>
      </div>
    </template>

    <div v-if="props.outputChunks.length" class="space-y-4">
      <UCard
        v-for="(chunk, index) in props.outputChunks"
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
</template>
