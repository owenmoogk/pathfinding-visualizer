export default function Queue() {
    this.elements = []

    Queue.prototype.add = function(e) {
        this.elements.push(e)
    }

    Queue.prototype.dequeue = function () {
        return this.elements.shift()
    }

    Queue.prototype.isEmpty = function () {
        return this.elements.length === 0
    }
}