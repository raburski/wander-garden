import { Transforms } from "./types"

export class LocalStorageAdapter<Type> {
    storeKey: string
    defaultStoreValue: string
    transforms: Transforms<Type>

    constructor(storeKey: string, defaultStoreValue: string = '[]', transforms: Transforms<Type>) {
        this.storeKey = storeKey
        this.defaultStoreValue = defaultStoreValue
        this.transforms = transforms
    }
    get(): Type {
        const storedValue: string = localStorage.getItem(this.storeKey) || this.defaultStoreValue
        return this.transforms.get(storedValue)
    }
    set(data: Type) {
        localStorage.setItem(this.storeKey, this.transforms.set(data))
    }
    clear() {
        localStorage.setItem(this.storeKey, this.defaultStoreValue)
    }
}