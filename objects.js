class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    scalarMult(s) {
        return new Vector(this.x * s, this.y * s);
    }
    toVelocity(vel) {
        return this.toUnit().scalarMult(vel);
    }
    toUnit() {
        let velocity = this.velocity();
        return new Vector(this.x / velocity, this.y / velocity);
    }
    velocity() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

class Box2D {
    constructor(size, pos) {
        this.pos = pos;
        this.size = size;
        this.halfWidth = this.size.x / 2;
        this.halfHeight = this.size.y / 2;
    }

    bottom() {
        return this.pos.y + this.size.y;
    }

    top() {
        return this.pos.y;
    }

    left() {
        return this.pos.x;
    }

    right() {
        return this.pos.x + this.size.x;
    }

    centerX() {
        return this.pos.x + this.halfWidth;
    }

    centerY() {
        return this.pos.y + this.halfHeight;
    }

    center() {
        return new Vector(this.centerX(), this.centerY());
    }

    collides(other) {
        return this.left() <= other.right() && this.right() >= other.left() &&
            this.top() <= other.bottom() && this.bottom() >= other.top();
    }

    getCollisionSides(other) {
        let sides = 0;
        if (this.left() <= other.left() || this.right() >= other.right()) {
            sides += 1;
        }
        if (this.top() <= other.top() || this.bottom() >= other.bottom()) {
            sides += 2;
        }
        return sides;
    }

    getCollisionBox(other) {
        let W;
        let x;
        if (this.right() > other.right()) {
            W = other.right() - this.left();
            x = other.pos.x + (other.size.x - W);
        } else {
            W = this.right() - other.left();
            x = this.pos.x + (this.size.x - W);
        }

        let H;
        let y;
        if (this.bottom() > other.bottom()) {
            H = other.bottom() - this.top();
            y = other.pos.y + (other.size.y - H);
        } else {
            H = this.bottom() - other.top();
            y = this.pos.y + (this.size.y - H);
        }
        return new Box2D(new Vector(W, H), new Vector(x, y));
    }
}

class ElBox2D extends Box2D {
    constructor(el) {
        super(
            new Vector(el.offsetWidth, el.offsetHeight),
            new Vector(el.offsetLeft, el.offsetTop)
        );
        this.el = el;
    }

    _updateEl() {
        this.el.style.left = this.pos.x + 'px';
        this.el.style.top = this.pos.y + 'px';
    }
}

class Palett extends ElBox2D {
    constructor(el) {
        super(el);
    }

    setPosition(x) {
        this.pos.x = x - this.halfWidth;
        this._updateEl();
    }
}

class Ball extends ElBox2D {
    constructor(el) {
        super(el);
        this.movement = new Vector(20, 20);
    }

    update(deltaTime) {
        this.pos = this.pos.add(this.movement.scalarMult(deltaTime));
        this._updateEl();
    }
}