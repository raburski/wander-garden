
export default class Stack {
    readonly items: any[]
    currentIndex: number

    constructor(items: any[] = []) {
        this.items = items
        this.currentIndex = items.length
    }
    isFinished() {
        return this.currentIndex < 0
    }
    makeStep() {
        this.currentIndex = this.currentIndex - 1
        return !this.isFinished()
    }

    getCurrent() {
        return this.items[this.currentIndex]
    }
    getNext() {
        const nextIndex = this.currentIndex - 1
        return nextIndex < 0 ? null : this.items[nextIndex]
    }
    getPrevious() {
        const previousIndex = this.currentIndex + 1
        return previousIndex >= this.items.length ? null : this.items[previousIndex]
    }
}