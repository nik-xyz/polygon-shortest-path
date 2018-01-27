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

        const mousePoint = [evt.offsetX, evt.offsetY];
        if(evt.button == 0) {
            this.start = mousePoint;
        }
        else if(evt.button == 2) {
            this.end = mousePoint;
        }

        this.search();
    }

    handleResize() {
        this.pickEndpoints();
        this.createObstacles();
        this.search();
    }

    search() {
        this.path = search(this.start, this.end, this.obstacles);
        this.draw();
    }

    pickEndpoints() {
        // Pick start points on oppisite sides of the screen
        const [width, height] = this.renderer.getSize();
        this.start = [0,     Math.random() * height];
        this.end   = [width, Math.random() * height];
    }

    createObstacles() {
        // Prevent any obstacles being placed over the start and end points
        const reservedPoints = [this.start.concat(10), this.end.concat(10)];
        const [width, height] = this.renderer.getSize();
        this.obstacles = generateObstacles(width, height, reservedPoints);
    }

    draw() {
        this.renderer.clear("#FFF");

        for(const polygon of this.obstacles) {
            this.renderer.drawPolygon(polygon, "#888", "#555");
        }

        for(const vertex of [this.start, this.end]) {
            this.renderer.drawCircle(...vertex, 10, "green");
        }

        if(this.path != null) {
            for(const [prev, next] of this.path) {
                this.renderer.drawLine(...prev, ...next, "green", 2);
            }
        }
    }
}

new App();
