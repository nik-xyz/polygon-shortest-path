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

function getAccessableVertices(vertex, polygons) {
    const accessable = [];

    for(const polygon of polygons) {
        for(const edge of polygon.edges()) {
            // TODO: check if point is accessable
            accessable.push(edge[0]);
        }
    }

    return accessable;
}



const renderer = new Renderer();
const obstacles = generateObstacles(window.innerWidth, window.innerHeight);

/*
for(const polygon of obstacles) {
    renderer.drawPolygon(polygon, "#888", "#555");
}

// Arbitrary test point
const vertex = obstacles[50].vertices[3];
const accessable = getAccessableVertices(vertex, obstacles);

for(const other of accessable) {
    renderer.drawLine(...vertex, ...other, "red");
}
*/



// Random test of line intersection detection
const randPoint = () => [
    Math.random() * window.innerWidth,
    Math.random() * window.innerHeight];

const line0 = [randPoint(), randPoint()];
const line1 = [randPoint(), randPoint()];
const intersect = linesIntersect(line0, line1);

renderer.drawLine(...line0[0], ...line0[1], intersect ? "red" : "green");
renderer.drawLine(...line1[0], ...line1[1], intersect ? "red" : "green");
