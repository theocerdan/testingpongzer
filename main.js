import "./style.css";
import Matter from "matter-js";

/// MODULE ALIASES ///

var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

/// ENGINE CREATION ///

var engine = Engine.create();
engine.world.gravity.y = 0;

/// CONSTANTS ///

const PAD_SPEED = 12;
const GAME_HEIGHT = 650;
const GAME_WIDTH = 850;
const BALL_RADIUS = 15;
const WALL_THICKNESS = 20;
const PADDLE_LENGHT = 150;

/// RENDERER CREATION ///

var render = Render.create({
  element: document.querySelector("#gameBoard"),
  engine: engine,
  options: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelRatio: 1,
    background: "black",
    hasBounds: true,
    enabled: true,
    wireframes: false,
    showSleeping: false,
    showDebug: false,
    showBroadphase: false,
    showBounds: false,
    showVelocity: false,
    showCollisions: false,
    showSeparations: false,
    showAxes: false,
    showPositions: false,
    showAngleIndicator: false,
    showIds: false,
    showShadows: false,
    showVertexNumbers: false,
    showConvexHulls: false,
    showInternalEdges: false,
    showMousePosition: false,
  },
});

/// RUN THE RENDERER ///

Render.run(render);

/// VARIABLES /// 

let ball;
var currentScoreLeft = 0;
var currentScoreRight = 0;
var keys = [];

/// CREATION OF ALL BODIES ///

var paddleL = Bodies.rectangle(20, GAME_HEIGHT / 2, 20, PADDLE_LENGHT, { 
  isStatic: true,
  label: "PaddleLeft",
  render: {
    fillStyle: "white"
  }
});
var paddleR = Bodies.rectangle(GAME_WIDTH - 20, GAME_HEIGHT / 2, 20, PADDLE_LENGHT, { 
  isStatic: true,
  label: "PaddleRight",
  render: {
    fillStyle: "white"
  }
});
var wallT = Bodies.rectangle(0, 0, GAME_WIDTH * 2, WALL_THICKNESS, {
  isStatic: true,
  label: "WallT",
  render: {
    fillStyle: "black",
  }
});
var wallB = Bodies.rectangle(0, GAME_HEIGHT, GAME_WIDTH * 2, WALL_THICKNESS, { 
  isStatic: true, 
  label: "WallB",
  render: {
    fillStyle: "black",
  }
});

/// ADD BODIES TO THE WORLD ///
Composite.add(engine.world, [paddleL, paddleR, wallT, wallB]);

/// CREATE AND RUN THE RUNNER ///

var runner = Runner.create();
Runner.run(runner, engine);

initBall();

/// GAME LOOP ///

setInterval(function () {
  updateMovePaddle();
  if (ball != undefined) {
    gestionCollisions();
    gestionScore();
    Engine.update(engine, 1000 / 120);
  }
}, 1000 / 60);

/// COLLISION FUNCTIONS ///

function gestionCollisions() {
  Matter.Events.on(engine, "collisionStart", (e) => {
    const objA = e.pairs[0].bodyA.label
    const objB = e.pairs[0].bodyB.label
    if (objB === 'Ball' && (objA === 'WallB' || objA === 'WallT')) {
      setTimeout(() => {
        calculNewVelocityCollisions();
      }, 1000 / 60)
    }
    if (objB === 'Ball' && (objA === 'PaddleRight' || objA === 'PaddleLeft')) {
      setTimeout(() => {
        calculNewVelocityCollisions();
      }, 1000 / 120)
    }
  });
}

function calculNewVelocityCollisions() {
  let velocity = ball.velocity.y
  if (Math.abs(velocity) < 1)
    velocity = velocity + Math.sign(velocity)
  Matter.Body.setVelocity(ball, { x: ball.velocity.x, y: velocity })
}

/// BALL FUNCTIONS MANAGER ///

function initBall() {
  var b = Bodies.circle(200, 200, BALL_RADIUS, {
    label: "Ball",
    render : {
      fillStyle: "white"
    }
  });
  b.restitution = 1.09;
  b.inertia = Infinity;
  b.friction = 0;
  b.frictionAir = 0;
  b.frictionStatic = 0;
  let starter = randomNumberInterval(1, 3)
  starter == 1 ? starter = 1 : starter = -1;
  Matter.Body.setPosition(b, {x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2,});
  Composite.add(engine.world, [b]);
  ball = b;
}

function launchBall() {
  let starter = randomNumberInterval(1, 3)
  starter == 1 ? starter = 1 : starter = -1;
  Matter.Body.setVelocity(ball, { x: 3 * starter, y: randomNumberInterval(-4, 5) })
}

function resetBall() {
  Matter.Body.setPosition(ball, {x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2,});
  Matter.Body.setVelocity(ball, { x: 0, y:0 })
}

/// KEY MANAGEMENT ///

document.body.addEventListener("keydown", function (e) {
  keys[e.keyCode] = true;
})
document.body.addEventListener("keyup", function (e) {
  keys[e.keyCode] = false;
})

function updateMovePaddle() {
  if (keys[38])
    if (paddleR.position.y > 80)
      Matter.Body.translate(paddleR, { x: 0, y: -PAD_SPEED});
  if (keys[40])
    if (paddleR.position.y < (GAME_HEIGHT - (PADDLE_LENGHT / 2)))
      Matter.Body.translate(paddleR, { x: 0, y: PAD_SPEED });
  if (keys[65])
    if (paddleL.position.y < (GAME_HEIGHT - (PADDLE_LENGHT / 2)))
      Matter.Body.translate(paddleL, { x: 0, y: PAD_SPEED });
  if (keys[81])
    if (paddleL.position.y > 80)
      Matter.Body.translate(paddleL, { x: 0, y: -PAD_SPEED });
}

document.body.addEventListener("keydown", (e) => {
  if (e.keyCode == "32" && (ball.velocity.x == 0 && ball.velocity.y == 0))
    launchBall();
});

/// SCORE GESTION ///

function gestionScore() {
  if (ball.position.x < 0 || ball.position.x > GAME_WIDTH) {
    updateScore();
    resetBall()
  }
}

function updateScore() {
  if (ball.position.x >= GAME_WIDTH)
    document.getElementById('score left span').innerHTML = ++currentScoreLeft;
  else if (ball.position.x <= 0)
    document.getElementById('score right span').innerHTML = ++currentScoreRight;
}

/// UTILS ///

function randomNumberInterval(min, max) { 
  let x = Math.floor(Math.random() * (max - min) + min);
  if (x == 0)
    return randomNumberInterval(min, max);
  return x;
}
