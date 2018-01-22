class Renderer {
    constructor() {
        this.canvas = document.getElementById("render-output");
        this.cxt = this.canvas.getContext("2d");

        window.addEventListener("resize", () => this.setCanvasSize());
        this.setCanvasSize();
    }

    setCanvasSize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    drawLine(sx, sy, ex, ey, color, thickness = 2) {
        const cxt = this.cxt;
        cxt.strokeStyle = color;
        cxt.lineWidth = thickness;
        
        cxt.beginPath();
        cxt.moveTo(sx, sy);
        cxt.lineTo(ex, ey);
        cxt.stroke();
    }

    drawPolygon(points, color) {
        const cxt = this.cxt;
        cxt.fillStyle = color;

        cxt.beginPath();
        cxt.moveTo(points[0][0], points[0][1]);
        for(const point of points) {
            cxt.lineTo(point[0], point[1]);
        }
        cxt.closePath();
        cxt.fill();
    }
}


const renderer = new Renderer();
renderer.drawLine(0, 0, 100, 100, "red");
renderer.drawPolygon([[200, 200], [200, 300], [300, 200]], "green");
