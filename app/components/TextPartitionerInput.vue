<script setup>
import { modeOptions } from '~/composables/useTextPartitioner'

const props = defineProps({
  inputText: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    required: true
  },
  parameter: {
    type: Number,
    required: true
  },
  activeMode: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:inputText', 'update:mode', 'update:parameter', 'process'])
</script>

<template>
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
          :model-value="props.inputText"
          :rows="16"
          autoresize
          placeholder="Paste or type your text here..."
          class="w-full"
          @update:model-value="emit('update:inputText', $event)"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
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
    </div>

    <template #footer>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-muted">
          Handles sentence splits with <span class="font-medium text-default">.</span>, <span class="font-medium text-default">!</span>, and <span class="font-medium text-default">?</span>
        </p>

        <UButton
          icon="i-lucide-split"
          size="lg"
          @click="emit('process')"
        >
          Process text
        </UButton>
      </div>
    </template>
  </UCard>
</template>
