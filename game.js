const palette = new Palett(document.getElementById('palette'));
const collidables = [
    palette,
    new ElBox2D(document.getElementById('left_wall')),
    new ElBox2D(document.getElementById('right_wall')),
    new ElBox2D(document.getElementById('top_wall')),
];
const balls = [
    new Ball(document.getElementById('ball1')),
    new Ball(document.getElementById('ball2')),
];

document.addEventListener('mousemove', ev => palette.setPosition(ev.x));

const COLLISION_VERTICAL = 1;
const COLLISION_HORIZONTAL = 2;
let time = new Date();
let diff;
const i = setInterval(() => {
    const newTime = new Date();
    diff = (newTime - time) / 100;
    balls.forEach((ball) => {
        collidables.forEach((collidable) => {
            if (ball.collides(collidable)) {
                let collisionSides = ball.getCollisionSides(collidable);
                if (bitCheck(collisionSides, COLLISION_HORIZONTAL)) {
                    ball.movement.y *= -1;
                    if (collidable instanceof Palett) {
                        ball.movement.x = (ball.pos.x - collidable.centerX()) / 3;
                        ball.movement = ball.movement.toVelocity(28.28);
                    }
                }
                if (bitCheck(collisionSides, COLLISION_VERTICAL)) {
                    ball.movement.x *= -1;
                }
            }
        });
        ball.update(diff);
    });
    time = newTime;
}, 1);
document.addEventListener('keydown', () => {
    clearInterval(i);
})