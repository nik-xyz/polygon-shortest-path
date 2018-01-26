// Line intersection test. Not very fast or elegant, but fine for testing algorithms.
function linesIntersect(line0, line1) {
    const length = ([[sx, sy], [ex, ey]]) => Math.hypot(sx - ex, sy - ey);

    if(length(line0) < length(line1)) {
        [line0, line1] = [line1, line0];
    }

    const translate = point => [point[0] - line0[0][0], point[1] - line0[0][1]];

    const line0Translated = line0.map(translate);
    const line1Translated = line1.map(translate);

    const theta = Math.atan2(line0Translated[1][0], line0Translated[1][1]);

    const rotate = point => [
        point[0] * Math.sin(theta) + point[1] * Math.cos(theta),
        point[0] * Math.cos(theta) + point[1] * -Math.sin(theta)
    ];

    const line0Rotated = line0Translated.map(rotate);
    const line1Rotated = line1Translated.map(rotate);

    if(Math.abs(line1Rotated[0][1] - line1Rotated[1][1]) < 0.00001) {
        // Lines are parallel
        return false;
    }

    if(Math.max(line1Rotated[0][1], line1Rotated[1][1]) < 0) {
        // Second line is below the first
        return false;
    }

    if(Math.min(line1Rotated[0][1], line1Rotated[1][1]) > 0) {
        // Second line is above the first
        return false;
    }

    const deltaX = line1Rotated[1][0] - line1Rotated[0][0];
    const deltaY = line1Rotated[1][1] - line1Rotated[0][1];
    const interceptX = line1Rotated[0][0] - line1Rotated[0][1] * (deltaX / deltaY);

    if(interceptX < 0 || interceptX > line0Rotated[1][0]) {
        // Lines do not intercept
        return false;
    }

    return true;
}


function lineIsBetweenEdges(startVertex, endVertex, startPolygon) {
    const [inEdge, outEdge] = startPolygon.edgesIncidentToVertex(startVertex);

    const translate = ([x, y]) => [x - startVertex[0], y - startVertex[1]];

    const inVertexAngle  = Math.atan2(...translate(inEdge[0]));
    const outVertexAngle = Math.atan2(...translate(outEdge[1]));
    const lineAngle      = Math.atan2(...translate(endVertex));

    const absMod2PI = x => (x + 2 * Math.PI) % (2 * Math.PI);

    const edgesAngle = absMod2PI(outVertexAngle - inVertexAngle);
    const edgeLineAngle = absMod2PI(outVertexAngle - lineAngle);
    const eps = 0.00001;

    return edgesAngle < edgeLineAngle + eps;
}


function verticesAreAccessable(vert0, vert1, polygon0, polygon1, polygons) {
    for(const polygon of polygons) {
        for(const edge of polygon.edges()) {
            // Check for intersection with the edge, but avoid edges incident to
            // the current vertex to prevent false positives
            if(edge.indexOf(vert0) == -1 && edge.indexOf(vert1) == -1) {
                if(linesIntersect(edge, [vert0, vert1])) {
                    return false;
                }
            }
        }
    }

    if(!lineIsBetweenEdges(vert0, vert1, polygon0)) {
        return false;
    }

    return true;
}


function getAccessableVertices(vertex, polygons, polygon = null) {
    const accessable = [];

    for(const otherPolygon of polygons) {
        for(const otherVertex of otherPolygon.vertices) {
            if(!verticesAreAccessable(vertex, otherVertex, polygon, otherPolygon, polygons)) {
                continue;
            }

            accessable.push(otherVertex);
        }
    }

    return accessable;
}



const renderer = new Renderer();
const obstacles = generateObstacles(window.innerWidth, window.innerHeight);


for(const polygon of obstacles) {
    renderer.drawPolygon(polygon, "#888", "#555");
}


for(const polygon of obstacles) {
    for(const vertex of polygon.vertices) {
        const accessable = getAccessableVertices(vertex, obstacles, polygon);

        for(const other of accessable) {
            renderer.drawLine(...vertex, ...other, "blue");
        }
    }
}
