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
    </div>

  </UCard>
</template>
