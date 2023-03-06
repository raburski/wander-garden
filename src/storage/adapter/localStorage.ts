import { Transforms, StorageAdapter } from "../types"

export default class LocalStorageAdapter<Type> implements StorageAdapter<Type> {
    storeKey: string
    defaultStoreValue: string
    transforms: Transforms<Type>
    initialValue: Type

    constructor(storeKey: string, defaultStoreValue: string = '[]', transforms: Transforms<Type>) {
        this.storeKey = storeKey
        this.defaultStoreValue = defaultStoreValue
        this.transforms = transforms
        this.initialValue = this.transforms.get(this.defaultStoreValue)
    }
    get(): Promise<Type> {
        const storedValue: string = localStorage.getItem(this.storeKey) || this.defaultStoreValue
        return Promise.resolve(this.transforms.get(storedValue))
    }
    set(data: Type) {
        try {
            localStorage.setItem(this.storeKey, this.transforms.set(data))
        } catch (e) {
            return Promise.reject(e)
        } finally {
            return Promise.resolve()
        }
    }
    clearAll() {
        try {
            localStorage.setItem(this.storeKey, this.defaultStoreValue)
        } catch (e) {
            return Promise.reject(e)
        } finally {
            return Promise.resolve()
        }
    }
}