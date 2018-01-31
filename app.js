class App {
    constructor() {
        this.renderer = new Renderer();
        this.renderer.setResizeHandler(() => this.handleResize());

        this.handleResize();

        this.renderer.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.renderer.canvas.addEventListener("mouseup",   this.handleMouseUp.bind(this));
        this.renderer.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.renderer.canvas.addEventListener("dblclick",  this.handleDoubleClick.bind(this));

        this.handleMouseUp();
        this.lastMousePosition = new Vec2(0, 0);
    }


    static get endPointSize() {
        return 10;
    }


    handleMouseDown(evt) {
        this.lastMousePosition = new Vec2(evt.offsetX, evt.offsetY);

        const obstacle = this.getObstacleAtPoint(this.lastMousePosition);
        if(obstacle != null) {
            // Make the obstacle render on top of all others
            this.obstacles.splice(this.obstacles.indexOf(obstacle), 1);
            this.obstacles.push(obstacle);

            this.updateObjectBeingDragged = delta => obstacle.move(delta);
        }
        else if(this.start.length(this.lastMousePosition) < App.endPointSize) {
            this.updateObjectBeingDragged = delta => this.start = this.start.add(delta);
        }
        else if(this.end.length(this.lastMousePosition) < App.endPointSize) {
            this.updateObjectBeingDragged = delta => this.end = this.end.add(delta);
        }
    }


    handleMouseUp(evt) {
        this.updateObjectBeingDragged = null;
    }


    handleMouseMove(evt) {
        const point = new Vec2(evt.offsetX, evt.offsetY);
        const delta = point.sub(this.lastMousePosition);
        this.lastMousePosition = point;

        if(this.updateObjectBeingDragged != null) {
            this.updateObjectBeingDragged(delta);
            this.search();
        }
    }


    handleDoubleClick(evt) {
        this.drawNeighbors(new Vec2(evt.offsetX, evt.offsetY));
    }


    handleResize() {
        this.pickDefaultEndpoints();
        this.createObstacles();
        this.search();
    }


    search() {
        const searchBlocksed =
            this.getObstacleAtPoint(this.start) != null ||
            this.getObstacleAtPoint(this.end) != null;

        if(searchBlocksed) {
            this.path = null;
        }
        else {
            this.path = search(this.start, this.end, this.obstacles);
        }

        this.draw();
    }


    draw() {
        this.renderer.clear("#FFF");

        for(const polygon of this.obstacles) {
            this.renderer.drawPolygon(polygon, "#888", "#555");
        }

        const pathColor = (this.path == null) ? "red" : "green";

        for(const vertex of [this.start, this.end]) {
            this.renderer.drawCircle(vertex, App.endPointSize, pathColor);
        }

        if(this.path != null) {
            for(const [prev, next] of this.path) {
                this.renderer.drawLine(prev, next, pathColor, 2);
            }
        }
    }


    drawNeighbors(vertex) {
        this.draw();
        const neighbors = getNeighbors(vertex, this.obstacles, new Map(),
            [this.start, this.end]);
        for(const neighbor of neighbors) {
            this.renderer.drawLine(vertex, neighbor, "blue", 2);
        }
    }


    pickDefaultEndpoints() {
        const size = this.renderer.getSize();
        this.start = size.mul(new Vec2(0.2, 0.2 + 0.6 * Math.random()));
        this.end   = size.mul(new Vec2(0.8, 0.2 + 0.6 * Math.random()));
    }


    createObstacles() {
        const numObstacles = 100;
        const startSizeDivisor = 10;
        const sizeChangeRate = 0.99;
        const minSize = 0.1;
        const placementAttempts = 10;

        const size = this.renderer.getSize();

        let currentSize = Math.min(size.x, size.y) / startSizeDivisor;
        const obstacles = [];

        while(obstacles.length < numObstacles && currentSize > minSize) {
            for(let attempt = 0; attempt < placementAttempts; attempt++) {
                const position = size.mul(new Vec2(Math.random(), Math.random()));

                const checkValid = ([otherPosition, otherSize]) =>
                    position.length(otherPosition) >= currentSize + otherSize;

                const valid =
                    obstacles.every(checkValid) &&
                    checkValid([this.start, App.endPointSize]) &&
                    checkValid([this.end,   App.endPointSize]);

                if(valid) {
                    obstacles.push([position, currentSize]);
                    break;
                }
            }
            currentSize *= sizeChangeRate;
        }

        this.obstacles = obstacles.map(pos => Polygon.createRandomPolygon(...pos));
    }


    getObstacleAtPoint(point) {
        // Iterate in reverse order so that if any polygons overlap, the one that
        // is drawn on top gets selected
        for(let index = this.obstacles.length - 1; index >= 0; index--) {
            const obstacle = this.obstacles[index]
            if(obstacle.containsPoint(point)) {
                return obstacle;
            }
        }
        return null;
    }
}

new App();
