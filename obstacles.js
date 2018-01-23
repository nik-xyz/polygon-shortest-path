
function generatePolygon(x, y, size, variance = 0.7) {
    const points = [];
    const minPoints = 5;
    const maxPoints = 10;
    const numPoints = Math.floor(Math.random() * minPoints + maxPoints - minPoints);

    const generateRandomDistance = () =>
        size * (1 - variance + variance * Math.random());

    const lastDistanceWeight = 0.3;
    const lastDistance = generateRandomDistance();

    for(let i = 0; i < numPoints; i++) {
        const distance =
            lastDistance             * lastDistanceWeight +
            generateRandomDistance() * (1 - lastDistanceWeight);

        const theta = i / numPoints * Math.PI * 2;
        points.push([
            x + Math.sin(theta) * distance,
            y + Math.cos(theta) * distance
        ]);
    }

    return points;
}

function generateObstacles(width, height, ) {
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

    return positions.map(([x, y, size]) => generatePolygon(x, y, size));
}

const renderer = new Renderer();
const obstacles = generateObstacles(window.innerWidth, window.innerHeight);


for(const obstacle of obstacles) {
    renderer.drawPolygon(obstacle, "#888", "#555");
}
