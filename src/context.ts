import type { SoundManager } from 'smanager';
import type { SConfig, Buses } from './config';
export * from './config'
export * from 'smanager'

export interface SContext {
  readonly context: AudioContext,
  readonly manager: SoundManager,
  readonly config: SConfig,
  readonly buses: Buses
  readonly trigger: (scontext: SContext, event: string) => void
}
