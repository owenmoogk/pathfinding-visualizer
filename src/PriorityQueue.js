// https://www.geeksforgeeks.org/implementation-priority-queue-javascript/

// User defined class
// to store element and its priority
class QElement {
    constructor(priority, priority2, element) {
        this.element = element;
        this.priority = priority;
        this.priority2 = priority2
    }
}

// PriorityQueue class
export default class PriorityQueue {

    // An array is used to implement priority
    constructor() {
        this.items = [];
    }

    // functions to be implemented
    // put(item, priority)
    // dequeue()
    // front()
    // isEmpty()
    // printPQueue()


    put(priority, priority2, element) {
        // creating object from queue element
        var qElement = new QElement(priority, priority2, element);
        var contain = false;

        // iterating through the entire
        // item array to add element at the
        // correct location of the Queue
        for (var i = 0; i < this.items.length; i++) {
            if ((this.items[i].priority > qElement.priority) || (this.items[i].priority === qElement.priority && this.items[i].priority2 > qElement.priority2)) {
                this.items.splice(i, 0, qElement);
                contain = true;
                break;
            }
        }

        // if the element have the highest priority
        // it is added at the end of the queue
        if (!contain) {
            this.items.push(qElement);
        }
    }

    get() {
        // return the dequeued element
        // and remove it.
        // if the queue is empty
        // returns Underflow
        if (this.isEmpty())
            return "Underflow";
        return this.items.shift().element;
    }
    front() {
        // returns the highest priority element
        // in the Priority queue without removing it.
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[0];
    }

    isEmpty() {
        // return true if the queue is empty.
        return this.items.length === 0;
    }

    look() {
        return(this.items)
    }
}