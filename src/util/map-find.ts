export function mapFind<ElementType, MappedType>(
  elements: ElementType[],
  mapper: (value: ElementType) => MappedType,
  finder: (value: MappedType) => boolean,
): MappedType|undefined {
  for (const element of elements) {
    const mappedValue = mapper(element)
    if (finder(mappedValue)) {
      return mappedValue
    }
  }
}
