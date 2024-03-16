export function db(lin: number) {
  return 20 * Math.log10(lin)
}

export function lin(db: number) {
  return Math.pow(10, db / 20)
}
