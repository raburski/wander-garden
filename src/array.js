export function onlyUnique(value, index, self) {
    return self.indexOf(value) === index
}

Array.prototype.last = function() {
    return this[this.length - 1]
}

Array.prototype.first = function() {
    return this[0]
}

Array.prototype.reversed = function() {
    return this.map((_,idx) => this[this.length-1-idx])
}