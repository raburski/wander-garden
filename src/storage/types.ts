export interface Transforms<Type> {
    get: (value: string) => Type
    set: (value: Type) => string
}

export interface StorageAdapter<Type> {
    initialValue: Type

    get(): Promise<Type>
    set(data: Type, keysToReplace: string[]): Promise<any>
    clearAll(): Promise<any>
}

export default {}