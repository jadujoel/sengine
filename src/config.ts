import type { BusConfig } from './bus'
import type { PlayClipOptions } from './clip'
export * from './bus'
export * from './clip'
export * from './utils'

export interface PlayClipActionConfig<TTargets extends string = string> {
  readonly action: 'play'
  readonly type: 'clip'
  readonly target: TTargets
}

export interface StopClipActionConfig<TTargets extends string = string> {
  readonly action: 'stop'
  readonly type: 'clip'
  readonly target: TTargets
}

export type ClipOptions<TSources extends string = string, TBusNames extends string = string> = PlayClipOptions<TSources, TBusNames>
export type ClipConfig<
TBusNames extends string = string,
TSources extends string = string,
TClipNames extends string = string,
> = Readonly<Record<
  TClipNames,
  ClipOptions<TSources, TBusNames>
>>

export type PlayActionConfig<TTargets extends string = string> = PlayClipActionConfig<TTargets>
export type PlayAction<TTargets extends string = string> = Omit<PlayClipActionConfig<TTargets>, 'action'>

export type StopActionConfig<TTargets extends string = string> = StopClipActionConfig<TTargets>
export type StopAction<TTargets extends string = string> = Omit<StopClipActionConfig<TTargets>, 'action'>

export type Action<TTargets extends string = string> = PlayAction<TTargets> | StopAction<TTargets>
export type ActionOptions<TTargets extends string = string> = PlayActionConfig<TTargets> | StopActionConfig<TTargets>
export type ActionsConfig<TActionNames extends string = string, TTargets extends string = string> = Readonly<Record<
  TActionNames,
  ActionOptions<TTargets>
>>

export type EventsConfig<TActionNames extends string = string, TEventNames extends string = string> = Readonly<Record<TEventNames, TActionNames[]>>

export interface SConfig<
TClipNames extends string = string,
TActionNames extends string = string,
TEventNames extends string = string,
TBusNames extends string = string
>{
  readonly clips: ClipConfig<TBusNames, TClipNames>
  readonly actions: ActionsConfig<TActionNames>
  readonly events: EventsConfig<TActionNames, TEventNames>
  readonly buses: BusConfig<TBusNames>
}

export interface SEngine {
  readonly trigger: (event: string) => void
}

export function defineBuses<const TBusConfig extends BusConfig>(buses: TBusConfig): TBusConfig {
  return buses
}

export function defineSources<const TSources extends string>(sources: TSources[]): readonly TSources[] {
  return sources
}

export type SKey<T> = T extends string ? T : never

export function defineClips<
const TBusConfig extends BusConfig = BusConfig,
const TSources extends readonly string[] = readonly string[],
const TClipConfig extends ClipConfig<SKey<keyof TBusConfig>, TSources[number]> =
  ClipConfig<SKey<keyof TBusConfig>, TSources[number]>,
>(
  _buses: TBusConfig,
  _sources: TSources,
  clips: TClipConfig,
): TClipConfig {
  return clips
}

export function defineActions<
const TClips extends ClipConfig = ClipConfig,
const TActionNames extends string = string>(
  _clips: TClips,
  actions: ActionsConfig<TActionNames, SKey<keyof TClips>>): ActionsConfig<TActionNames, SKey<keyof TClips>> {
  return actions
}

export function defineEvents<
const TActions extends ActionsConfig,
const TEventsConfig extends EventsConfig<SKey<keyof TActions>> = EventsConfig<SKey<keyof TActions>>
> (
  _actions: TActions,
  events: TEventsConfig
): TEventsConfig {
  return events
}

export function defineConfig<const TSConfig extends SConfig>(config: TSConfig): TSConfig {
  return config
}
