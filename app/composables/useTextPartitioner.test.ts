import { describe, expect, it } from 'vitest'

import {
  chunkByCharacters,
  chunkBySentences,
  flattenText,
  partitionText,
  splitIntoSentences,
  useTextPartitioner
} from './useTextPartitioner'

describe('useTextPartitioner', () => {
  it('flattenText collapses all whitespace including newlines', () => {
    expect(flattenText('  line one\n\t line   two  ')).toBe('line one line two')
  })

  it('splitIntoSentences ignores newlines and keeps punctuation-based sentence boundaries', () => {
    expect(splitIntoSentences('Hello world!\n\n"Quoted question?"\nLast line.')).toEqual([
      'Hello world!',
      '"Quoted question?"',
      'Last line.'
    ])
  })

  it('splitIntoSentences handles multiline input with no punctuation at end', () => {
    expect(splitIntoSentences('This.\nis.\nan.\nexample.')).toEqual([
      'This.',
      'is.',
      'an.',
      'example.'
    ])
  })

  it('chunkBySentences groups sentences by the requested size', () => {
    expect(chunkBySentences(['One.', 'Two!', 'Three?', 'Four.'], 3)).toEqual([
      'One. Two! Three?',
      'Four.'
    ])
  })

  it('sentence mode groups sentences into clean chunks', () => {
    const input = 'First sentence.  Second sentence!\n\nThird sentence?  Fourth sentence.'

    expect(partitionText(input, 'sentences', 2)).toEqual([
      'First sentence. Second sentence!',
      'Third sentence? Fourth sentence.'
    ])
  })

  it('character mode groups sentences to approximate target size', () => {
    const sentences = [
      'Alpha beta gamma delta epsilon zeta eta theta iota kappa.',
      'Lambda mu nu xi omicron pi rho sigma tau upsilon.',
      'Phi chi psi omega.'
    ]

    expect(chunkByCharacters(sentences, 80)).toEqual([
      'Alpha beta gamma delta epsilon zeta eta theta iota kappa.',
      'Lambda mu nu xi omicron pi rho sigma tau upsilon. Phi chi psi omega.'
    ])
  })

  it('character mode handles single long sentence exceeding target', () => {
    expect(partitionText('A very long sentence that exceeds the chunk size target by itself.', 'characters', 20)).toEqual([
      'A very long sentence that exceeds the chunk size target by itself.'
    ])
  })

  it('sentence mode with count 2 on user example', () => {
    expect(partitionText('This. is. an. example.', 'sentences', 2)).toEqual([
      'This. is.',
      'an. example.'
    ])
  })

  it('resets parameter to the new mode default when switching modes', async () => {
    const partitioner = useTextPartitioner()

    partitioner.mode.value = 'sentences'
    await nextTick()
    partitioner.parameter.value = 2
    partitioner.mode.value = 'characters'
    await nextTick()

    expect(partitioner.parameter.value).toBe(800)
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
