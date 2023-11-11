export interface Transforms<Type> {
    get: (value: string) => Type
    set: (value: Type) => string
}

export type StorageSet<T> = (data: T, keysToReplace?: string[]) => Promise<any>

export interface StorageAdapter<Type> {
    initialValue: Type

    getInitial(): Type
    get(): Promise<Type>
    set(data: Type, keysToReplace: string[]): Promise<any>
    clearAll(): Promise<any>
}

export default {}