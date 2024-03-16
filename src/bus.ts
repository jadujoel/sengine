export type Bus = AudioNode
export type Buses = Map<string, Bus>

export interface BusOptions<TBusNames extends string = string> {
  readonly gain?: number
  readonly destination?: TBusNames
}

export type BusConfig<TBusNames extends string = string> = Readonly<Record<TBusNames, BusOptions<TBusNames>>>

export function setupBuses(context: AudioContext, config: BusConfig, map = new Map<string, Bus>()): Buses {
  for (const [name, options] of Object.entries(config)) {
    const bus = context.createGain()
    bus.gain.value = options.gain ?? 1
    map.set(name, bus)
  }

  // connect the buses
  for (const [name, bus] of map.entries()) {
    if (name === 'master') {
      bus.connect(context.destination)
      continue
    }
    const destination = map.get(config[name]?.destination ?? 'master')
    if (destination) {
      bus.connect(destination)
    }
  }
  return map
}
