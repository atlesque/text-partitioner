<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const colorMode = useColorMode()

const modes = [
  { label: 'Light', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-lucide-moon' },
  { label: 'Auto', value: 'system', icon: 'i-lucide-sun-moon' },
] as const

const currentMode = computed(() => {
  return modes.find(m => m.value === colorMode.preference) ?? modes[2]
})

function cycleMode() {
  const values = ['light', 'dark', 'system'] as const
  const idx = values.indexOf(colorMode.preference as 'light' | 'dark' | 'system')
  colorMode.preference = values[(idx + 1) % values.length]
}

const items = computed<DropdownMenuItem[][]>(() => [
  modes.map(m => ({
    label: m.label,
    icon: m.icon,
    type: 'radio' as const,
    checked: colorMode.preference === m.value,
    onSelect: () => { colorMode.preference = m.value }
  }))
])
</script>

<template>
  <header class="border-b border-(--ui-border) bg-(--ui-bg)">
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
      <!-- Left: logo + title -->
      <div class="flex items-center gap-2.5">
        <div class="flex size-8 items-center justify-center rounded-lg bg-(--ui-primary) text-(--ui-primary-fg)">
          <UIcon name="i-lucide-scissors" class="size-4" />
        </div>
        <span class="text-lg font-semibold text-(--ui-text)">Text Partitioner</span>
      </div>

      <!-- Right: theme toggle -->
      <div class="flex items-center">
        <!-- Desktop: dropdown -->
        <UDropdownMenu :items="items" class="hidden sm:flex">
          <UButton
            color="neutral"
            variant="ghost"
            class="group"
          >
            <UIcon :name="currentMode.icon" class="size-4" />
            {{ currentMode.label }}
            <UIcon name="i-lucide-chevron-down" class="size-3 text-(--ui-text-muted) transition-transform group-data-[state=open]:rotate-180" />
          </UButton>
        </UDropdownMenu>

        <!-- Mobile: icon button that cycles -->
        <UButton
          color="neutral"
          variant="ghost"
          square
          class="sm:hidden"
          aria-label="Toggle color mode"
          @click="cycleMode"
        >
          <UIcon :name="currentMode.icon" class="size-5" />
        </UButton>
      </div>
    </div>
  </header>
</template>
