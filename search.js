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

    const inVertexAngle  = startVertex.sub(inEdge[0]).angle();
    const outVertexAngle = startVertex.sub(outEdge[1]).angle();
    const lineAngle      = startVertex.sub(endVertex).angle();

    return !angleLiesBetweenAngles(outVertexAngle, inVertexAngle, lineAngle, 0.00001);
}


// Sorts the edges of the polygons into radial bins that fan out from the start
// vertex. These bins are used to find all that edges might block a line between
// the start vertex and other vertices, allowing the other edges to be ignored.
function createRadialBins(vertex, polygons) {
    const numBins = 500;

    const bins = new Array(numBins);
    for(let bin = 0; bin < numBins; bin++) {
        bins[bin] = [];
    }

    let startPolygon = null;

    for(const polygon of polygons) {
        for(const edge of polygon.edges()) {
            if(edge.indexOf(vertex) != -1) {
                // Add edges containing the start vertex to all bins
                for(const bin of bins) {
                    bin.push(edge);
                }
                // Record start polygon for use by verticesAreNeighbors()
                startPolygon = polygon;
            }
            else {
                const angles = edge.map(vert => vert.sub(vertex).angle());
                let startAngle = Math.min(...angles);
                let endAngle   = Math.max(...angles);

                // No egde should ever span more than a half rotation,
                // so if that appears to be the case, the edge must have
                // wrapped around the from +pi to -pi. Adding 2*pi to the
                // ending angle allows this case to be be handled properly when
                // adding the edge to the bins.
                if(endAngle - startAngle > Math.PI) {
                    endAngle += 2 * Math.PI;
                }

                const start = Math.floor((startAngle / (2 * Math.PI) + 0.5) * numBins);
                const end   = Math.floor((endAngle   / (2 * Math.PI) + 0.5) * numBins);
                for(let bin = start; bin <= end; bin++) {
                    bins[bin % bins.length].push(edge);
                }
            }
        }
    }

    return {
        numBins: numBins,
        bins: bins,
        startPolygon: startPolygon
    };
}


// Checks whether startVertex and endVertex can be connected by a straight line
// that does not intercept any polygons
function verticesAreNeighbors(startVertex, endVertex, obstacleData) {
    // Bind the bin that the line between the vertics falls in
    const lineAngle = endVertex.sub(startVertex).angle() / (2 * Math.PI) + 0.5;
    const binIndex = Math.floor((lineAngle) * obstacleData.numBins) % obstacleData.numBins;
    const bin = obstacleData.bins[binIndex];

    // Check that the line between the start and end vertices does not intersect
    // the edges of obstacle, except for the edges that are directly connected
    // to the start and end vertices. These edges will always technically
    // intersect the line so they are avoided.
    for(const edge of bin) {
        if(edge.indexOf(startVertex) == -1 && edge.indexOf(endVertex) == -1) {
            if(linesIntersect(edge, [startVertex, endVertex])) {
                return false;
            }
        }
    }

    // Check that the line between the start and end vertices does not intersect
    // a polygon in the event that both vertices are part of the same polygon.
    if(obstacleData.startPolygon != null) {
        if(lineInterceptsPolygon(startVertex, endVertex, obstacleData.startPolygon)) {
            return false;
        }
    }

    return true;
}


// Finds all valid neighbors of a vertex, that is, all vertices that can connected
// to the start vertex by a stright line that is not obstructed by any polygons.
function getNeighbors(vertex, polygons, visited, otherVertices = []) {
    const binnedObstacles = createRadialBins(vertex, polygons);
    const accessable = [];

    for(const otherPolygon of polygons) {
        for(const otherVertex of otherPolygon.vertices) {
            if(!visited.has(otherVertex)) {
                if(verticesAreNeighbors(vertex, otherVertex, binnedObstacles)) {
                    accessable.push(otherVertex);
                }
            }
        }
    }

    for(const otherVertex of otherVertices) {
        if(verticesAreNeighbors(vertex, otherVertex, binnedObstacles)) {
            accessable.push(otherVertex);
        }
    }

    return accessable;
}


// Standard A* search using euclidean distance heuristic
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

        for(const neighbor of getNeighbors(vertex, obstacles, visited, [end])) {
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
