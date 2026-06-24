import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  chunkByCharacters,
  chunkBySentences,
  getParagraphs,
  inferParagraphs,
  normalizeParagraph,
  partitionText,
  splitIntoSentences,
  useTextPartitioner
} from './useTextPartitioner'

describe('useTextPartitioner', () => {
  it('normalizeParagraph collapses internal whitespace', () => {
    expect(normalizeParagraph('  line one\n\t line   two  ')).toBe('line one line two')
  })

  it('getParagraphs drops empty paragraphs after trimming', () => {
    expect(getParagraphs(' first\n\n\n second \n\n   \nthird ')).toEqual([
      'first',
      'second',
      'third'
    ])
  })

  it('splitIntoSentences keeps punctuation-based sentence boundaries', () => {
    expect(splitIntoSentences('Hello world! "Quoted question?" Last line.')).toEqual([
      'Hello world!',
      '"Quoted question?"',
      'Last line.'
    ])
  })

  it('chunkBySentences groups sentences by the requested size', () => {
    expect(chunkBySentences('One. Two! Three? Four.', 3)).toEqual([
      'One. Two! Three?',
      'Four.'
    ])
  })

  it('sentence mode groups sentences into clean chunks', () => {
    const input = ' First sentence.  Second sentence! Third sentence?  Fourth sentence. '

    expect(partitionText(input, 'sentences', 2)).toEqual([
      'First sentence. Second sentence!',
      'Third sentence? Fourth sentence.'
    ])
  })

  it('character mode avoids splitting words when building chunks', () => {
    const input = 'alpha beta gamma delta epsilon'

    expect(chunkByCharacters(input, 12)).toEqual([
      'alpha beta',
      'gamma delta',
      'epsilon'
    ])
  })

  it('inferParagraphs preserves existing paragraphs before inferring new ones', () => {
    const input = 'First paragraph.\n\nSecond paragraph.'

    expect(inferParagraphs(input, 2)).toEqual([
      'First paragraph.',
      'Second paragraph.'
    ])
  })

  it('auto mode preserves existing paragraphs and trims whitespace', () => {
    const input = '  First paragraph line.\n\n\n Second paragraph line.  '

    expect(partitionText(input, 'auto', 4)).toEqual([
      'First paragraph line.',
      'Second paragraph line.'
    ])
  })

  it('updates the parameter when switching to a stricter mode', async () => {
    const partitioner = useTextPartitioner()

    partitioner.parameter.value = 2
    partitioner.mode.value = 'characters'
    await nextTick()

    expect(partitioner.parameter.value).toBe(320)
    expect(partitioner.activeMode.value.value).toBe('characters')
  })

  it('clears output for blank or whitespace-only input', () => {
    const partitioner = useTextPartitioner()

    partitioner.inputText.value = '\t\n  '
    partitioner.outputChunks.value = ['existing chunk']
    partitioner.processText()

    expect(partitioner.outputChunks.value).toEqual([])
  })
})
