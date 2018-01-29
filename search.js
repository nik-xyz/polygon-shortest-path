function linesIntersect(line0, line1) {
    if(line0[0].length(line0[1]) < line1[0].length(line1[1])) {
        [line0, line1] = [line1, line0];
    }

    const line0EndBeforeRotation = line0[1].sub(line0[0]);

    const theta = Math.atan2(-line0EndBeforeRotation.y, line0EndBeforeRotation.x);
    const matrix = new Mat2(theta)

    const line0End   = matrix.mul(line0[1].sub(line0[0]));
    const line1Start = matrix.mul(line1[0].sub(line0[0]));
    const line1End   = matrix.mul(line1[1].sub(line0[0]));

    if(Math.abs(line1Start.y - line1End.y) < 0.00001) {
        // Lines are parallel
        return false;
    }

    if(Math.max(line1Start.y, line1End.y) < 0) {
        // Second line is below the first
        return false;
    }

    if(Math.min(line1Start.y, line1End.y) > 0) {
        // Second line is above the first
        return false;
    }

    const delta = line1Start.sub(line1End);
    const interceptX = line1Start.x - line1Start.y * (delta.x / delta.y);

    if(interceptX < 0 || interceptX > line0End.x) {
        // Lines do not intercept
        return false;
    }

    return true;
}


function angleLiesBetweenAngles(ccwBound, cwBound, angle, eps = 0) {
    if(ccwBound - eps <= angle && angle <= cwBound + eps) {
        return true;
    }
    if(angle - eps <= cwBound && cwBound <= ccwBound + eps) {
        return true;
    }
    if(cwBound - eps <= ccwBound && ccwBound <= angle + eps) {
        return true;
    }
    return false;
}


function lineInterceptsPolygon(startVertex, endVertex, polygon) {
    const [inEdge, outEdge] = polygon.edgesIncidentToVertex(startVertex);

    const angle = vec => Math.atan2(vec.x, vec.y);

    const inVertexAngle  = angle(startVertex.sub(inEdge[0]));
    const outVertexAngle = angle(startVertex.sub(outEdge[1]));
    const lineAngle      = angle(startVertex.sub(endVertex));

    return !angleLiesBetweenAngles(outVertexAngle, inVertexAngle, lineAngle, 0.00001);
}


// Checks whether startVertex and endVertex can be connected by a straight line
// that does not intercept any polygons
function verticesAreNeighbors(startVertex, endVertex, polygons) {
    // Check that the line between the start and end vertices does not intersect
    // the edges of obstacle, except for the edges that are directly connected
    // to the start and end vertices. These edges will always technically
    // intersect the line so they are avoided.

    let startPolygon = null;
    for(const polygon of polygons) {
        for(const edge of polygon.edges()) {
            if(edge.indexOf(startVertex) != -1) {
                // Record which polygon contains the start vertex for further
                // further intercept testing
                startPolygon = polygon;
            }
            else if(edge.indexOf(endVertex) != -1) {
            }
            else {
                if(linesIntersect(edge, [startVertex, endVertex])) {
                    return false;
                }
            }
        }
    }

    // Check that the line between the start and end vertices does not intersect
    // a polygon in the event that both vertices are part of the same polygon.
    if(startPolygon != null) {
        if(lineInterceptsPolygon(startVertex, endVertex, startPolygon)) {
            return false;
        }
    }

    return true;
}


function getNeighbors(vertex, polygons, otherVertices = []) {
    const accessable = [];

    for(const otherPolygon of polygons) {
        for(const otherVertex of otherPolygon.vertices) {
            if(verticesAreNeighbors(vertex, otherVertex, polygons)) {
                accessable.push(otherVertex);
            }
        }
    }

    for(const otherVertex of otherVertices) {
        if(verticesAreNeighbors(vertex, otherVertex, polygons)) {
            accessable.push(otherVertex);
        }
    }

    return accessable;
}


function search(start, end, obstacles) {
    const border = new HeapQueue((a, b) => a.estimate < b.estimate);
    const visited = new Map();

    border.add({vertex: start, prev: null, cost: 0, estimate: 0});

    while(!border.empty()) {
        let {vertex: vertex, cost: cost, prev: prev} = border.pop();

        if(visited.has(vertex)) {
            continue;
        }
        visited.set(vertex, prev);

        if(vertex == end) {
            const path = [];

            while(visited.get(vertex) != null) {
                const prevVertex = visited.get(vertex);
                path.push([prevVertex, vertex]);
                vertex = prevVertex;
            }
            return path;
        }

        for(const neighbor of getNeighbors(vertex, obstacles, [end])) {
            if(!visited.has(neighbor)) {

                border.add({
                    vertex:   neighbor,
                    prev:     vertex,
                    cost:     cost + neighbor.length(vertex),
                    estimate: cost + neighbor.length(vertex) + neighbor.length(end)
                });
            }
        }
    }

    return null;
}
