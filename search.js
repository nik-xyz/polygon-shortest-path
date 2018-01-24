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


for(const polygon of obstacles) {
    renderer.drawPolygon(polygon, "#888", "#555");
}

// Arbitrary test point
const vertex = obstacles[50].vertices[3];
const accessable = getAccessableVertices(vertex, obstacles);

for(const other of accessable) {
    //renderer.drawLine(...vertex, ...other, "red");
}
