import test from 'node:test'
import assert from 'node:assert/strict'
import { nextTick } from 'vue'

import {
  chunkByCharacters,
  chunkBySentences,
  getParagraphs,
  inferParagraphs,
  normalizeParagraph,
  partitionText,
  splitIntoSentences,
  useTextPartitioner
} from '../app/composables/useTextPartitioner.ts'

test('normalizeParagraph collapses internal whitespace', () => {
  assert.equal(normalizeParagraph('  line one\n\t line   two  '), 'line one line two')
})

test('getParagraphs drops empty paragraphs after trimming', () => {
  assert.deepEqual(getParagraphs(' first\n\n\n second \n\n   \nthird '), [
    'first',
    'second',
    'third'
  ])
})

test('splitIntoSentences keeps punctuation-based sentence boundaries', () => {
  assert.deepEqual(splitIntoSentences('Hello world! "Quoted question?" Last line.'), [
    'Hello world!',
    '"Quoted question?"',
    'Last line.'
  ])
})

test('chunkBySentences groups sentences by the requested size', () => {
  assert.deepEqual(chunkBySentences('One. Two! Three? Four.', 3), [
    'One. Two! Three?',
    'Four.'
  ])
})

test('sentence mode groups sentences into clean chunks', () => {
  const input = ' First sentence.  Second sentence! Third sentence?  Fourth sentence. '

  assert.deepEqual(partitionText(input, 'sentences', 2), [
    'First sentence. Second sentence!',
    'Third sentence? Fourth sentence.'
  ])
})

test('character mode avoids splitting words when building chunks', () => {
  const input = 'alpha beta gamma delta epsilon'

  assert.deepEqual(chunkByCharacters(input, 12), [
    'alpha beta',
    'gamma delta',
    'epsilon'
  ])
})

test('inferParagraphs preserves existing paragraphs before inferring new ones', () => {
  const input = 'First paragraph.\n\nSecond paragraph.'

  assert.deepEqual(inferParagraphs(input, 2), [
    'First paragraph.',
    'Second paragraph.'
  ])
})

test('auto mode preserves existing paragraphs and trims whitespace', () => {
  const input = '  First paragraph line.\n\n\n Second paragraph line.  '

  assert.deepEqual(partitionText(input, 'auto', 4), [
    'First paragraph line.',
    'Second paragraph line.'
  ])
})

test('useTextPartitioner updates the parameter when switching to a stricter mode', async () => {
  const partitioner = useTextPartitioner()

  partitioner.parameter.value = 2
  partitioner.mode.value = 'characters'
  await nextTick()

  assert.equal(partitioner.parameter.value, 320)
  assert.equal(partitioner.activeMode.value.value, 'characters')
})

test('useTextPartitioner clears output for blank or whitespace-only input', () => {
  const partitioner = useTextPartitioner()

  partitioner.inputText.value = '\t\n  '
  partitioner.outputChunks.value = ['existing chunk']
  partitioner.processText()

  assert.deepEqual(partitioner.outputChunks.value, [])
})
