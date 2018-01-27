class HeapQueue {
    // Comparitor should return true if the first argument has a
    // higher priority than the second.
    // Degree of 5 seems to be the most performant
    constructor(comparitor, degree = 5) {
        this.compare = comparitor;
        this.degree = degree;
        this.elements = [];
    }

    add(element) {
        this.elements.push(element);
        this.siftUp(this.elements.length - 1);
    }

    pop() {
        const element = this.elements[0];
        const end = this.elements.pop();

        if(!this.empty()) {
            this.elements[0] = end;
            this.siftDown(0);
        }

        return element;
    }

    empty() {
        return this.elements.length == 0;
    }

    siftUp(index) {
        if(index == 0) {
            // Already at root
            return;
        }

        const elems = this.elements;
        const parent = Math.floor((index - 1) / this.degree);

        if(this.compare(elems[index], elems[parent])) {
            [elems[index], elems[parent]] = [elems[parent], elems[index]];
            this.siftUp(parent);
        }
    }

    siftDown(index) {
        const elems = this.elements;
        const firstChild = index * this.degree + 1;
        const childAfterLast = Math.min(firstChild + this.degree, elems.length);

        if(firstChild == childAfterLast) {
            // Already at leaf
            return;
        }

        // Assume current element has highest priority
        let maxPriority = index;

        // Try to find a child with higher priority
        for(let child = firstChild; child < childAfterLast; child++) {
            if(this.compare(elems[child], elems[maxPriority])) {
                maxPriority = child;
            }
        }

        // Swap if necessary
        if(index != maxPriority) {
            [elems[index], elems[maxPriority]] = [elems[maxPriority], elems[index]];
            this.siftDown(maxPriority)
        }
    }
}
