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

    static get1DCollision(firstPos, firstWidth, secondPos, secondWidth) {
        const firstRight = firstPos + firstWidth;
        const secondRight = secondPos + secondWidth;
        //L2 < L1 && R2 > R1 --- x: L1, W: W1
        if (secondPos < firstPos && secondRight > firstRight) {
            return {
                pos: firstPos,
                width: firstWidth,
            };
        }

        //2 < 1 --- x: L1, W: R2 - L1
        if (secondPos < firstPos && secondRight < firstRight) {
            return {
                pos: firstPos,
                width: secondRight - firstPos,
            };
        }

        //2 > 1 --- x: L2, W: R1 - L2
        if (secondPos > firstPos && secondRight > firstRight) {
            return {
                pos: secondPos,
                width: firstRight - secondPos,
            };
        }

        // --- x: L2, W: W2
        return {
            pos: secondPos,
            width: secondWidth,
        };
    }

    getCollisionBox(other) {
        const horizontalCollision = Box2D.get1DCollision(this.left(), this.size.x, other.left(), other.size.x);
        const verticalCollision = Box2D.get1DCollision(this.top(), this.size.y, other.top(), other.size.y);
        return new Box2D(
            new Vector(horizontalCollision.width, verticalCollision.width),
            new Vector(horizontalCollision.pos, verticalCollision.pos)
        );
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
    constructor(el, collidables) {
        super(el);
        this.movement = new Vector(50, 50);
        this.collidables = collidables;
    }

    update(deltaTime) {
        this.collidables.forEach((collidable) => {
            if (this.collides(collidable)) {

                const collisionBox = this.getCollisionBox(collidable);
                if (collisionBox.left() > this.left() || collisionBox.right() > this.right()) { // collision is on right
                    this.pos.x -= collisionBox.size.x; // move left
                    this.movement.x *= -1;
                } else if (collisionBox.left() < this.left() || collisionBox.right() < this.right()) { // collision is on left
                    this.pos.x += collisionBox.size.x; // move right
                    this.movement.x *= -1;
                }

                let verticalCollision = false;
                if (collisionBox.top() > this.top() || collisionBox.bottom() > this.bottom()) { // collision is on bottom
                    this.pos.y -= collisionBox.size.y; // move upwards
                    verticalCollision = true;
                } else if (collisionBox.top() < this.top() || collisionBox.bottom() < this.bottom()) { // collision is on top
                    this.pos.y += collisionBox.size.y; // move downwards
                    verticalCollision = true;
                }
                if (verticalCollision) {
                    this.movement.y *= -1;
                    if (collidable instanceof Palett) {
                        const beforeVelocity = this.movement.velocity();
                        this.movement.x = (this.pos.x - collidable.centerX()) / 3;
                        this.movement = this.movement.toVelocity(beforeVelocity);
                    }
                }
            }
        });
        this.pos = this.pos.add(this.movement.scalarMult(deltaTime));
        this._updateEl();
    }
}