import '../extensions/map-extensions.js'

export function grouping<ElementType>(
  elements: ElementType[],
  mapper: (value: ElementType) => string,
): Map<string, ElementType[]> {
  return elements.reduce((result, element) => {
    const key = mapper(element)
    result
      .getWithDefault(key, [])
      .push(element)

    return result
  }, new Map<string, ElementType[]>)
}
