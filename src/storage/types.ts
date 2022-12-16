export interface Transforms<Type> {
    get: (value: string) => Type
    set: (value: Type) => string
}

export default {}