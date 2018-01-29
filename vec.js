class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }

    sub(vec) {
        return new Vec2(this.x - vec.x, this.y - vec.y);
    }

    mul(vec) {
        return new Vec2(this.x * vec.x, this.y * vec.y);
    }

    length(vec = new Vec2(0, 0)) {
        return Math.hypot(this.x - vec.x, this.y - vec.y);
    }
}


class Mat2 {
    constructor(theta) {
        this.xx = Math.cos(theta);
        this.yy = this.xx;
        this.xy = Math.sin(theta);
        this.yx = -this.xy;
    }

    mul(vec) {
        return new Vec2(
            this.xx * vec.x + this.yx * vec.y,
            this.xy * vec.x + this.yy * vec.y
        );
    }
}
