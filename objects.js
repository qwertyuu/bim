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
        this.enabled = true;
    }

    collidedWith() {}

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

    collides(other) {
        if (!this.enabled || !other.enabled) {
            return false;
        }
        return this.left() <= other.right() && this.right() >= other.left() &&
            this.top() <= other.bottom() && this.bottom() >= other.top();
    }

    static get1DCollisionZone(firstPos, firstWidth, secondPos, secondWidth) {
        const firstRight = firstPos + firstWidth;
        const secondRight = secondPos + secondWidth;
        if (secondPos < firstPos) {
            //L2 < L1 && R2 > R1 --- x: L1, W: W1
            if (secondRight > firstRight) {
                return {
                    pos: firstPos,
                    width: firstWidth,
                };
            } else {
                //2 < 1 --- x: L1, W: R2 - L1
                return {
                    pos: firstPos,
                    width: secondRight - firstPos,
                };
            }
        } else {
            //2 > 1 --- x: L2, W: R1 - L2
            if (secondRight > firstRight) {
                return {
                    pos: secondPos,
                    width: firstRight - secondPos,
                };
            } else {
                // --- x: L2, W: W2
                return {
                    pos: secondPos,
                    width: secondWidth,
                };
            }
        }
    }

    getCollisionBox(other) {
        const horizontalCollision = Box2D.get1DCollisionZone(this.left(), this.size.x, other.left(), other.size.x);
        const verticalCollision = Box2D.get1DCollisionZone(this.top(), this.size.y, other.top(), other.size.y);
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
        if (!this.enabled) {
            this.el.style.setProperty('display', 'none');
            return;
        }
        this.el.style.left = this.pos.x + 'px';
        this.el.style.top = this.pos.y + 'px';
    }
}

class Palett extends ElBox2D {
    setPosition(x) {
        this.pos.x = x - this.halfWidth;
        this._updateEl();
    }
}

class Brick extends ElBox2D {
    collidedWith(collider) {
        if (collider instanceof Ball) {
            this.enabled = false;
            this._updateEl();
        }
    }
}

class Ball extends ElBox2D {
    constructor(el, collidables) {
        super(el);
        this.movement = new Vector(0, 70);
        this.velocity = this.movement.velocity();
        this.collidables = collidables;
    }

    update(deltaTime) {
        let verticalCollisions = 0;
        let collidedPalletts = [];
        let horizontalCollisions = 0;
        this.collidables.forEach((collidable) => {
            if (this.collides(collidable)) {
                collidable.collidedWith(this);

                const collisionBox = this.getCollisionBox(collidable);

                let verticalCollision = false;
                if (collisionBox.top() > this.top() || collisionBox.bottom() > this.bottom()) { // collision is on bottom
                    this.pos.y -= collisionBox.size.y; // move upwards
                    verticalCollision = true;
                } else if (collisionBox.top() < this.top() || collisionBox.bottom() < this.bottom()) { // collision is on top
                    this.pos.y += collisionBox.size.y; // move downwards
                    verticalCollision = true;
                }
                if (verticalCollision) {
                    verticalCollisions++;
                    if (collidable instanceof Palett) {
                        collidedPalletts.push(collidable);
                    }
                }

                if (collisionBox.left() > this.left() || collisionBox.right() > this.right()) { // collision is on right
                    if (!verticalCollision) {
                        this.pos.x -= collisionBox.size.x; // move left
                    }
                    horizontalCollisions++;
                } else if (collisionBox.left() < this.left() || collisionBox.right() < this.right()) { // collision is on left
                    if (!verticalCollision) {
                        this.pos.x += collisionBox.size.x; // move right
                    }
                    horizontalCollisions++;
                }
            }
        });
        if (verticalCollisions) {
            this.movement.y *= -1;
            if (collidedPalletts.length) {
                this.movement.x = (this.pos.x - collidedPalletts[0].centerX()) / 3;
                this.movement = this.movement.toVelocity(this.velocity);
            }
        }
        if (horizontalCollisions && !verticalCollisions) {
            this.movement.x *= -1;
        }
        this.pos = this.pos.add(this.movement.scalarMult(deltaTime));
        this._updateEl();
    }
}