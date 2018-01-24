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

    drawPolygon(poly, fillColor, outlineColor, thickness = 2) {
        const cxt = this.cxt;
        cxt.strokeStyle = outlineColor;
        cxt.fillStyle = fillColor;
        cxt.lineWidth = thickness;

        cxt.beginPath();
        cxt.moveTo(poly.vertices[0][0], poly.vertices[0][1]);
        for(const vertex of poly.vertices) {
            cxt.lineTo(vertex[0], vertex[1]);
        }
        cxt.closePath();
        cxt.fill();
        cxt.stroke();
    }
}
