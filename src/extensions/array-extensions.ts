declare global {
  export interface Array<T> {
    mapAndFilter<V>(mapper: (value: T) => V|undefined): V[]
  }
}

Array.prototype.mapAndFilter = function<T, V>(mapper: (value: T) => V|undefined): V[] {
  const result: V[] = []
  this.forEach((element: T) => {
    const mapped = mapper(element)
    if (mapped !== undefined) {
      result.push(mapped)
    }
  })

  return result
}
