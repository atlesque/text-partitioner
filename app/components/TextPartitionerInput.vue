<script setup lang="ts">
import type { ModeOption, SplitMode } from '~/composables/useTextPartitioner';
import { modeOptions } from '~/composables/useTextPartitioner';

const props = defineProps<{
  inputText: string
  mode: SplitMode
  parameter: number | null
  activeMode: ModeOption
}>()

const emit = defineEmits<{
  'update:inputText': [value: string]
  'update:mode': [value: SplitMode]
  'update:parameter': [value: number | null]
  process: []
}>()

const isDragging = ref(false)
const dropError = ref<string | null>(null)

function handleDragOver(event: DragEvent) {
  if (!event.dataTransfer) return
  const hasTxtFile = Array.from(event.dataTransfer.types).includes('Files')
  if (!hasTxtFile) return
  event.preventDefault()
  isDragging.value = true
  dropError.value = null
}

function handleDragLeave(event: DragEvent) {
  const target = event.currentTarget as HTMLElement
  const related = event.relatedTarget as HTMLElement | null
  if (target && related && target.contains(related)) return
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  dropError.value = null

  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
    dropError.value = 'Only .txt files are supported.'
    return
  }

  event.preventDefault()

  const reader = new FileReader()
  reader.onload = () => {
    const text = reader.result as string
    emit('update:inputText', text)
  }
  reader.onerror = () => {
    dropError.value = 'Failed to read the file.'
  }
  reader.readAsText(file)
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-highlighted">
          Input
        </h2>
        <UButton
          icon="i-lucide-split"
          size="sm"
          @click="emit('process')"
        >
          Process text
        </UButton>
      </div>
    </template>

    <div class="space-y-6">
      <div class="flex flex-col gap-4">
        <UFormField
          label="Splitting mode"
          :description="props.activeMode.description"
        >
          <USelect
            :model-value="props.mode"
            :items="modeOptions"
            value-key="value"
            label-key="label"
            class="w-full"
            @update:model-value="emit('update:mode', $event)"
          />
        </UFormField>

        <UFormField
          :label="props.activeMode.parameterLabel"
          :description="`Minimum ${props.activeMode.min}`"
        >
          <UInputNumber
            :model-value="props.parameter"
            :min="props.activeMode.min"
            :step="props.activeMode.step"
            orientation="vertical"
            class="w-full"
            @update:model-value="emit('update:parameter', $event)"
          />
        </UFormField>
      </div>

      <UFormField
        label="Text to partition"
        description="Paste or drag &amp; drop raw text, notes, transcripts, or any other large text block."
      >
        <div
          class="relative"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <UTextarea
            :model-value="props.inputText"
            :rows="16"
            autoresize
            placeholder="Paste or type your text here..."
            class="w-full"
            @update:model-value="emit('update:inputText', $event)"
          />

          <Transition name="fade">
            <div
              v-if="isDragging"
              class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-(--ui-bg)/80"
            >
              <div class="flex flex-col items-center gap-2 text-primary">
                <span class="i-lucide-file-text size-8" />
                <span class="text-sm font-medium">Drop .txt file here</span>
              </div>
            </div>
          </Transition>

          <Transition name="fade">
            <p
              v-if="dropError"
              class="mt-2 text-xs text-error"
            >
              {{ dropError }}
            </p>
          </Transition>
        </div>
      </UFormField>
    </div>

  </UCard>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
