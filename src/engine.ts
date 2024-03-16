import { SoundManager, playClip, setupBuses, stopClip, type PlayAction, type SConfig, type SContext, type StopAction } from './context'
export * from './context'

export interface SEngineOptions {
  readonly manager: SoundManager
  readonly config: SConfig
}

export type SEngine = SContext

export function Sengine({ manager, config }: SEngineOptions): SEngine {
  const context = manager.context as AudioContext
  const buses = setupBuses(context, config.buses)
  const scontext = {
    context,
    manager,
    config,
    buses,
    trigger
  };
  trigger(scontext, 'sengine_started')
  return scontext;
}

export async function SengineFromUrls(configUrl: string, loadPath: string, atlasUrl = `${loadPath}/.atlas.json`): Promise<SEngine> {
  const manager = new SoundManager();
  manager.setLoadPath(loadPath)
  manager.loadAtlas(atlasUrl).then(() => {
    (manager as any).activePackageNames = ['joellof'];
    (manager as any).activeLanguages = ['_'];
  })
  const config = await fetch(configUrl).then(response => response.json())
  return Sengine({ manager, config })
}

export function trigger(scontext: SContext, event: string): void {
  console.debug('[sengine] trigger', event)
  const record = scontext.config.events[event]
  if (record === undefined) {
    console.debug(`No event for "${event}"`)
    return
  }
  for (const name of record) {
    const actionc = scontext.config.actions[name]
    if (actionc === undefined) {
      console.debug(`No action for "${name}"`)
      continue
    }
    const {action, ...options} = actionc
    console.debug('[sengine] action', action)
    switch (action) {
      case 'play':
        play(scontext, options)
        break
      case 'stop':
        stop(scontext, options)
        break
    }
  }
}

export function play(scontext: SContext, { type, target }: PlayAction) {
  switch (type) {
    case 'clip':
      const clip = scontext.config.clips[target]
      if (clip === undefined) {
        console.debug(`No clip for "${target}"`)
        return
      }
      playClip(scontext, clip)
      break
  }
}

export function stop(scontext: SContext, { type, target }: StopAction) {
  switch (type) {
    case 'clip':
      const clip = scontext.config.clips[target]
      if (clip === undefined) {
        console.debug(`No clip for "${target}"`)
        return
      }
      stopClip(clip)
      break
  }
}
