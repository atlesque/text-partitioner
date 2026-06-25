<script setup lang="ts">
const props = defineProps<{
  outputChunks: string[]
  copyState: 'idle' | 'copied' | 'error'
}>()

const emit = defineEmits<{
  copy: []
}>()

const outputSummary = computed(() => {
  if (!props.outputChunks.length) {
    return 'Your partitioned text will appear here.'
  }

  const count = props.outputChunks.length
  return `${count} chunk${count === 1 ? '' : 's'} ready`
})
</script>

<template>
  <div class="flex h-full flex-col gap-3 overflow-hidden rounded-lg border border-(--ui-border) bg-(--ui-bg) p-4">
    <div class="flex shrink-0 items-center justify-between gap-3">
      <p class="text-sm text-muted">
        {{ outputSummary }}
      </p>

      <UButton
        :disabled="!props.outputChunks.length"
        :color="props.copyState === 'error' ? 'error' : 'neutral'"
        :icon="props.copyState === 'copied' ? 'i-lucide-check' : 'i-lucide-copy'"
        variant="soft"
        size="sm"
        @click="emit('copy')"
      >
        {{ props.copyState === 'copied' ? 'Copied' : props.copyState === 'error' ? 'Copy failed' : 'Copy' }}
      </UButton>
    </div>

    <div v-if="props.outputChunks.length" class="flex-1 space-y-3 overflow-y-auto">
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
      description="Paste text, choose a mode, and process it to generate chunks."
      class="flex-1 justify-center"
    />
  </div>
</template>
