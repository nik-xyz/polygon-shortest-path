class Polygon {
    constructor(vertices) {
        this.vertices = vertices;
    }

    static createRandomPolygon(x, y, size, minSize = size * 0.3) {

        const mix = (ratio, start, end) => ratio * (end - start) + start;
        const randInRange = (low, high) => mix(Math.random(), low, high);

        const minVerts = 5;
        const maxVerts = 10;
        const numVerts = Math.floor(randInRange(minVerts, maxVerts));

        const lastDistanceWeight = 0.3;
        const lastDistance = randInRange(minSize, size);

        const vertices = [];

        for(let vert = 0; vert < numVerts; vert++) {
            const distance = mix(
                lastDistanceWeight, randInRange(minSize, size), lastDistance);

            const theta = vert / numVerts * Math.PI * 2;
            vertices.push([
                x + Math.sin(theta) * distance,
                y + Math.cos(theta) * distance
            ]);
        }

        return new Polygon(vertices);
    }

    *edges() {
        const len = this.vertices.length;
        for(let index = 0; index < len; index++) {
            yield [this.vertices[index], this.vertices[(index + 1) % len]];
        }
    }
}

function generateObstacles(width, height) {
    const numObstacles = 100;
    const startSizeDivisor = 10;
    const sizeChangeRate = 0.99;
    const minSize = 0.1;
    const placementAttempts = 10;

    const positions = [];

    let size = Math.min(width, height) / startSizeDivisor;

    while(positions.length < numObstacles && size > minSize) {
        for(let attempt = 0; attempt < placementAttempts; attempt++) {
            const x = Math.random() * width;
            const y = Math.random() * height;

            let valid = true;
            for(const [otherX, otherY, otherSize] of positions) {
                if(Math.hypot(otherX - x, otherY - y) < size + otherSize) {
                    valid = false;
                    break;
                }
            }
            if(valid) {
                positions.push([x, y, size]);
                break;
            }
        }
        size *= sizeChangeRate;
    }

    return positions.map(pos => Polygon.createRandomPolygon(...pos));
}
