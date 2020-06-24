const palette = new Palett(document.getElementById('palette'));
const collidables = [
    palette,
    new ElBox2D(document.getElementById('left_wall')),
    new ElBox2D(document.getElementById('right_wall')),
    new ElBox2D(document.getElementById('top_wall')),
];
const balls = [
    new Ball(document.getElementById('ball1'), collidables),
    new Ball(document.getElementById('ball2'), collidables),
];

document.addEventListener('mousemove', ev => palette.setPosition(ev.x));

let time = new Date();
let diff;
const i = setInterval(() => {
    const newTime = new Date();
    diff = (newTime - time) / 100;
    balls.forEach((ball) => {
        ball.update(diff);
    });
    time = newTime;
}, 1);
document.addEventListener('keydown', () => {
    clearInterval(i);
})