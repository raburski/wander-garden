function neutralTransform(data) {
    return data
}

export class LocalStorageAdapter {
    constructor(storeKey, defaultStoreValue = '[]', transforms = {}) {
        this.storeKey = storeKey
        this.defaultStoreValue = defaultStoreValue
        this.transforms = transforms
    }
    get() {
        const storedValue = localStorage.getItem(this.storeKey) || this.defaultStoreValue
        const transform = this.transforms.get || neutralTransform
        return transform(storedValue)
    }
    set(data) {
        const transform = this.transforms.set || neutralTransform
        localStorage.setItem(this.storeKey, transform(data))
    }
    clear() {
        this.set(this.defaultStoreValue)
    }
}