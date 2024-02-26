declare global {
  export interface Map<K, V> {
    getWithDefault(key: K, defaultValue: V): V
  }
  export interface MapConstructor {
    fromObject<V>(obj: Record<string, V>): Map<string, V>
    fromArray<V>(array: Array<V>, mapToKey: (value: V) => string): Map<string, V>
  }
}

Map.prototype.getWithDefault = function<K, V>(key: K, defaultValue: V): V {
  if (this.has(key)) {
    return this.get(key)
  }

  this.set(key, defaultValue)

  return defaultValue
}

Map.fromObject = function<V>(obj: Record<string, V>): Map<string, V> {
  return new Map(Object.entries(obj))
}

Map.fromArray = function<V>(array: Array<V>, mapToKey: (value: V) => string): Map<string, V> {
  const map = new Map<string, V>()
  for (const value of array) {
    map.set(mapToKey(value), value)
  }

  return map
}
