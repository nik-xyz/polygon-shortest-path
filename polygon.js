class Polygon {
    constructor(vertices) {
        this.vertices = vertices;
    }


    static createRandomPolygon(pos, size, minSize = size * 0.3) {
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
            vertices.push(pos.add(new Mat2(theta).mul(new Vec2(0, distance))));
        }

        return new Polygon(vertices);
    }


    *edges() {
        const len = this.vertices.length;
        for(let index = 0; index < len; index++) {
            yield [this.vertices[index], this.vertices[(index + 1) % len]];
        }
    }


    edgesIncidentToVertex(vertex) {
        let inEdge = null, outEdge = null;
        for(const edge of this.edges()) {
            if(edge[0] == vertex) {
                outEdge = edge;
            }
            else if(edge[1] == vertex) {
                inEdge = edge;
            }
        }
        return [inEdge, outEdge];
    }


    move(vec) {
        for(let index = 0; index < this.vertices.length; index++) {
            this.vertices[index] = this.vertices[index].add(vec);
        }
    }


    containsPoint(point) {
        const pointOffset = 100000;

        let furthestPoint = new Vec2(this.vertices[0].x, this.vertices[0].y);

        for(const vertex of this.vertices) {
            furthestPoint.x = Math.max(furthestPoint.x, vertex.x);
            furthestPoint.y = Math.max(furthestPoint.y, vertex.y);
        }

        furthestPoint.x += pointOffset;

        const line = [point, furthestPoint];

        let numIntersections = 0;
        for(const edge of this.edges()) {
            if(linesIntersect(line, edge)) {
                numIntersections++;
            }
        }

        return (numIntersections % 2) == 1;
    }
}
