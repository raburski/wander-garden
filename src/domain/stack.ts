
export default class Stack<Item> {
    readonly items: Item[]
    currentIndex: number

    constructor(items: Item[] = []) {
        this.items = items
        this.currentIndex = items.length
    }
    isFinished(): boolean {
        return this.currentIndex < 0
    }
    makeStep(): boolean {
        this.currentIndex = this.currentIndex - 1
        return !this.isFinished()
    }
    moveToTop() {
        this.currentIndex = 0
    }

    getCurrent(): Item | undefined {
        return this.items[this.currentIndex]
    }
    getNext(): Item | undefined {
        const nextIndex = this.currentIndex - 1
        return nextIndex < 0 ? undefined : this.items[nextIndex]
    }
    getPrevious(): Item | undefined {
        const previousIndex = this.currentIndex + 1
        return previousIndex >= this.items.length ? undefined : this.items[previousIndex]
    }
    getAll(): Item[] {
        return this.items
    }

    push(item: Item) {
        this.items.unshift(item)
        this.currentIndex = this.currentIndex + 1
    }
    replaceCurrent(item: Item) {
        this.items[this.currentIndex] = item
    }
}