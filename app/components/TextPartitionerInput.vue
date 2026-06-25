<script setup lang="ts">
import type { ModeOption, SplitMode } from '~/composables/useTextPartitioner'
import { modeOptions } from '~/composables/useTextPartitioner'

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
</script>

<template>
  <div class="flex h-full flex-col gap-3 overflow-hidden rounded-lg border border-(--ui-border) bg-(--ui-bg) p-4">
    <UTextarea
      :model-value="props.inputText"
      placeholder="Paste or type your text here..."
      class="flex-1"
      :ui="{ base: 'h-full resize-none' }"
      @update:model-value="emit('update:inputText', $event)"
    />

    <div class="flex shrink-0 flex-wrap items-center gap-2">
      <USelect
        :model-value="props.mode"
        :items="modeOptions"
        value-key="value"
        label-key="label"
        class="min-w-0 flex-1"
        @update:model-value="emit('update:mode', $event)"
      />

      <UInputNumber
        :model-value="props.parameter"
        :min="props.activeMode.min"
        :step="props.activeMode.step"
        orientation="vertical"
        class="w-32 shrink-0"
        @update:model-value="emit('update:parameter', $event)"
      />

      <UButton
        icon="i-lucide-split"
        class="shrink-0"
        @click="emit('process')"
      >
        Process
      </UButton>
    </div>
  </div>
</template>
