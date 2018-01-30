class App {
    constructor() {
        this.renderer = new Renderer();
        this.renderer.setResizeHandler(() => this.handleResize());

        this.handleResize();

        this.renderer.canvas.addEventListener("click", evt => this.handleClick(evt));
        this.renderer.canvas.addEventListener("contextmenu", evt => this.handleClick(evt));

        this.renderer.canvas.addEventListener("contextmenu", evt => {
        });
    }

    handleClick(evt) {
        evt.preventDefault();

        if(evt.button == 0) {
            this.start = new Vec2(evt.offsetX, evt.offsetY);
        }
        else if(evt.button == 2) {
            this.end = new Vec2(evt.offsetX, evt.offsetY);
        }

        this.search();
    }

    handleResize() {
        this.pickDefaultEndpoints();
        this.createObstacles();
        this.search();
    }

    search() {
        const startTime = Date.now();
        this.path = search(this.start, this.end, this.obstacles);
        const endTime = Date.now();
        console.log(`Search completed in ${endTime - startTime} ms`);

        this.draw();
    }

    pickDefaultEndpoints() {
        // Pick start points on oppisite sides of the screen
        const size = this.renderer.getSize();
        this.start = new Vec2(0,      Math.random() * size.y);
        this.end   = new Vec2(size.x, Math.random() * size.y);
    }

    draw() {
        this.renderer.clear("#FFF");

        for(const polygon of this.obstacles) {
            this.renderer.drawPolygon(polygon, "#888", "#555");
        }

        for(const vertex of [this.start, this.end]) {
            this.renderer.drawCircle(vertex, 10, "green");
        }

        if(this.path != null) {
            for(const [prev, next] of this.path) {
                this.renderer.drawLine(prev, next, "green", 2);
            }
        }
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
                    checkValid([this.start, 10]) &&
                    checkValid([this.end,   10]);

                if(valid) {
                    obstacles.push([position, currentSize]);
                    break;
                }
            }
            currentSize *= sizeChangeRate;
        }

        this.obstacles = obstacles.map(pos => Polygon.createRandomPolygon(...pos));
    }
}

new App();
