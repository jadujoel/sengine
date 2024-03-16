import { type SContext, isDefined } from './context'

export interface Clip {
  readonly node: AudioBufferSourceNode
  readonly start: number
}

export interface StopClipOptions<TSources extends string = string> {
  readonly src: TSources
}

export interface PlayClipOptions<
TSources extends string = string,
TBusNames extends string = string
> {
  readonly src: TSources,
  readonly gain?: number,
  readonly destination?: TBusNames,
  readonly minTimeBetween?: number,
  readonly loop?: number,
  readonly fadeIn?: number,
  readonly fadeOut?: number,
  readonly onended?: string,
  readonly limit?: number,
  readonly steal?: boolean,
  readonly stealTime?: number,
}

const playing: Record<string, Array<Clip | undefined>> = {}


export function playClip(scontext: SContext, {
  src,
  gain,
  minTimeBetween = 0,
  destination = 'master',
  loop = 0,
  fadeIn = 0,
  fadeOut = 0,
  limit = 2,
  steal = true,
  stealTime = 0.2,
  onended,
}: PlayClipOptions) {
  const ctx = scontext.context
  const buffer = scontext.manager.requestBufferSync(src)
  if (buffer === null) {
    console.warn(`No buffer for "${src}"`)
    return
  }
  const cplaying = playing[src] ??= []
  const playIndex = cplaying.length
  const lookahead = 0.01
  const when = ctx.currentTime + lookahead

  const nextStartTime = (cplaying.findLast(isDefined)?.start ?? 0) + minTimeBetween
  if (when < nextStartTime) {
    return
  }

  const numPlaying = cplaying.filter(isDefined).length

  if (numPlaying >= limit) {
    console.debug('stealing', src)
    if (steal) {
      const index = cplaying.findIndex(isDefined)
      const toSilence = cplaying[index]
      cplaying[index] = undefined
      if (toSilence) {
        // const fader = context.createGain()
        // fader.gain.value = 1
        // fader.gain.setValueCurveAtTime([1, 0], context.currentTime, stealTime)
        // toSilence.node.disconnect()
        // toSilence.node.connect(fader)
        // fader.connect(buses['master']!)
        toSilence.node.stop(ctx.currentTime + stealTime)
      }
    } else {
      console.warn(`Too many clips playing for "${src}"`)
      return
    }
  }

  const snode = ctx.createBufferSource()
  let last: AudioNode = snode

  snode.onended = () => {
    cplaying[playIndex] = undefined
    if (onended) {
      scontext.trigger(scontext, onended)
    }
  }
  snode.buffer = buffer
  let duration = buffer.duration
  // let endTime = when + duration

  if (loop > 0) {
    snode.loop = true
    duration = buffer.duration * loop
  }

  if (gain) {
    const gnode = ctx.createGain()
    gnode.gain.value = gain
    snode.connect(gnode)
    last = gnode
  }

  if (fadeIn > 0) {
    const fader = ctx.createGain()
    fader.gain.value = 0
    fader.gain.setValueCurveAtTime([0, 1], when, fadeIn)
    last.connect(fader)
    last = fader
  }

  let fadeOutTime = when + duration - fadeOut
  if (fadeOut > 0) {
    const fader = ctx.createGain()
    fader.gain.value = 1
    fader.gain.setValueCurveAtTime([1, 0], fadeOutTime, fadeOut)
    last.connect(fader)
    last = fader
  }

  const dnode = scontext.buses.get(destination)
  if (dnode === undefined) {
    console.warn(`No bus for "${destination}"`)
    return
  }
  last.connect(dnode)
  snode.start(0, 0, duration)

  {
    const clip = {
      node: snode,
      start: ctx.currentTime,
    }
    cplaying[playIndex] = clip
  }
}

export function stopClip({
  src,
}: StopClipOptions) {
  const current = playing[src] ?? []
  for (const item of current) {
    item?.node.stop()
  }
}
