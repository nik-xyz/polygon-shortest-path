class Renderer {
    constructor() {
        this.canvas = document.getElementById("render-output");
        this.cxt = this.canvas.getContext("2d");
        this.resizeHandler = () => {};

        window.addEventListener("resize", () => this.setCanvasSize());
        this.setCanvasSize();
    }

    setCanvasSize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.resizeHandler();
    }

    setResizeHandler(resizeHandler) {
        this.resizeHandler = resizeHandler;
    }

    getSize() {
        return new Vec2(this.canvas.width, this.canvas.height);
    }

    clear(color) {
        const cxt = this.cxt;
        cxt.fillStyle = color;

        cxt.beginPath();
        cxt.rect(0, 0, this.canvas.width, this.canvas.height)
        cxt.fill();
    }

    drawLine(start, end, color, thickness = 1) {
        const cxt = this.cxt;
        cxt.strokeStyle = color;
        cxt.lineWidth = thickness;

        cxt.beginPath();
        cxt.moveTo(start.x, start.y);
        cxt.lineTo(end.x, end.y);
        cxt.stroke();
    }

    drawPolygon(poly, fillColor, outlineColor, thickness = 2) {
        const cxt = this.cxt;
        cxt.strokeStyle = outlineColor;
        cxt.fillStyle = fillColor;
        cxt.lineWidth = thickness;

        cxt.beginPath();
        cxt.moveTo(poly.vertices[0].x, poly.vertices[0].y);
        for(const vertex of poly.vertices) {
            cxt.lineTo(vertex.x, vertex.y);
        }
        cxt.closePath();
        cxt.fill();
        cxt.stroke();
    }

    drawCircle(pos, radius, fillColor, thickness = 2) {
        const cxt = this.cxt;
        cxt.fillStyle = fillColor;
        cxt.lineWidth = thickness;

        cxt.beginPath();
        cxt.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
        cxt.closePath();
        cxt.fill();
    }
}
