// an example config

import { defineActions, defineBuses, defineClips, defineConfig, defineEvents, defineSources, lin } from './engine';

const sources = defineSources([
  'drone_a',
  'mel_a',
  'mel_b',
  'iam_a',
])

const buses = defineBuses({
  master: {
    gain: 1
  },
  music: {
    gain: 0.2,
    destination: 'master'
  },
  effects: {
    gain: 0.5,
    destination: 'master'
  },
})

const clips = defineClips(buses, sources, {
  drone: {
    src: 'drone_a',
    gain: lin(-24),
    loop: 10,
    fadeIn: 4,
    fadeOut: 4,
    destination: 'master'
  },
  hover: {
    src: 'mel_a',
    gain: lin(-12),
    fadeIn: 0.2,
    fadeOut: 0.2,
    onended: 'mel_a_ended',
    destination: 'master'
  },
  ended: {
    src: 'mel_b',
    gain: lin(-12),
    destination: 'master'
  },
  iam: {
    src: 'iam_a',
    gain: lin(-12),
    fadeIn: 0.2,
    fadeOut: 0.2,
    destination: 'master'
  },
})

const actions = defineActions(clips, {
  play_drone: {
    action: 'play',
    type: 'clip',
    target: 'drone'
  },
  play_hover: {
    action: 'play',
    type: 'clip',
    target: 'hover'
  },
  play_ended: {
    action: 'play',
    type: 'clip',
    target: 'ended'
  },
  play_iam: {
    action: 'play',
    type: 'clip',
    target: 'iam'
  },
})

const events = defineEvents(actions, {
  sengine_started: ['play_drone'],
  a_enter: ['play_hover', 'play_iam'],
  mel_a_ended: ['play_ended'],
  iam_a_ended: ['play_ended']
})

export default defineConfig({
  buses,
  clips,
  actions,
  events,
})
