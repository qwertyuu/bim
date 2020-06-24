const palette = new Palett(document.getElementById('palette'));

let collidables = [
    palette,
    new ElBox2D(document.getElementById('left_wall')),
    new ElBox2D(document.getElementById('right_wall')),
    new ElBox2D(document.getElementById('top_wall')),
];

const game = document.getElementById('game');
for (let i = 0; i < 20; i++) {
    const brickElement = document.createElement('div');
    brickElement.style.setProperty('left', (i * 50 + 150) + 'px');
    brickElement.style.setProperty('top', Math.sin(i) * 30 + 100 + 'px');
    brickElement.classList.add('game_element', 'brick');
    game.appendChild(brickElement);
    collidables.push(new Brick(brickElement));
}
const balls = [
    new Ball(document.getElementById('ball1'), collidables),
];

document.addEventListener('mousemove', ev => palette.setPosition(ev.x));

let time = new Date();
const i = setInterval(() => {
    const newTime = new Date();
    const diff = (newTime - time) / 100;
    balls.forEach((ball) => {
        ball.update(diff);
    });
    time = newTime;
}, 1);
document.addEventListener('keydown', () => {
    clearInterval(i);
});