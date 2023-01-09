import "./style.css";
import Matter from "matter-js";

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();
engine.world.gravity.y = 0;

let ball;
const PAD_SPEED = 12;
const GAME_HEIGHT = 650;
const GAME_WIDTH = 1000;
const BALL_RADIUS = 15;
const WALL_THICKNESS = 20

// create a renderer
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
    showSleeping: true,
    showDebug: false,
    showBroadphase: false,
    showBounds: false,
    showVelocity: true,
    showCollisions: true,
    showSeparations: false,
    showAxes: false,
    showPositions: true,
    showAngleIndicator: true,
    showIds: false,
    showShadows: false,
    showVertexNumbers: false,
    showConvexHulls: false,
    showInternalEdges: false,
    showMousePosition: false,
  },
});

// create 2 paddles
var paddleL = Bodies.rectangle(20, GAME_HEIGHT / 2, 20, 160, { 
  isStatic: true,
  label: "PaddleLeft",
  render: {
    fillStyle: "white"
  }
});
var paddleR = Bodies.rectangle(GAME_WIDTH - 20, GAME_HEIGHT / 2, 20, 160, { 
  isStatic: true,
  label: "PaddleRight",
  render: {
    fillStyle: "white"
  }
});

// create a top and bottom walls
var wallT = Bodies.rectangle(0, 0, GAME_WIDTH * 2, WALL_THICKNESS, {
  isStatic: true,
  label: "WallT",
  render: {
    fillStyle: "black",
    strokeStyle: 'red',
    lineWidth: 5
  }
});
var wallB = Bodies.rectangle(0, GAME_HEIGHT, GAME_WIDTH * 2, WALL_THICKNESS, { 
  isStatic: true, 
  label: "WallB",
  render: {
    fillStyle: "black",
    strokeStyle: 'red',
    lineWidth: 5
  }
});

// add all of the bodies to the world
Composite.add(engine.world, [paddleL, paddleR, wallT, wallB]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

spawnBall();

setInterval(function () {
  updateMovePaddle();
  if (ball != undefined) {
    Matter.Events.on(engine, "collisionStart", (e) => {
      const pairs = e.pairs
      const objA = pairs[0].bodyA.label
      const objB = pairs[0].bodyB.label
      if (objB === 'Ball' && (objA === 'WallB' || objA === 'WallT')) {
        setTimeout(() => {
          let velocity = ball.velocity.y
          if (Math.abs(velocity) < 1)
            velocity = velocity + Math.sign(velocity)
          Matter.Body.setVelocity(ball, { x: ball.velocity.x, y: velocity })
        }, 1000 / 60)
      }
      if (objB === 'Ball' && (objA === 'PaddleRight' || objA === 'PaddleLeft')) {
        setTimeout(() => {
          let velocity = ball.velocity.y
          if (Math.abs(velocity) < 1)
            velocity = velocity + Math.sign(velocity)
          Matter.Body.setVelocity(ball, { x: ball.velocity.x, y: velocity })
        }, 1000 / 120)
      }
    });
    if (ball.position.x < 0 || ball.position.x > GAME_WIDTH) {
      updateScore(ball.position);
      resetBall(ball)
    }
    Engine.update(engine, 1000 / 120);
  }
}, 1000 / 60);

function randomNumberInterval(min, max) { 
  let x = Math.floor(Math.random() * (max - min) + min);
  if (x == 0)
    return randomNumberInterval(min, max);
  return x;
}

function launchBall(ball) {
  let starter = randomNumberInterval(1, 3)
  starter == 1 ? starter = 1 : starter = -1;
  Matter.Body.setVelocity(ball, { x: 3 * starter, y: randomNumberInterval(-4, 5) })
}

function spawnBall() {
  var b = Bodies.circle(200, 200, BALL_RADIUS, {
    label: "Ball",
    render : {
      fillStyle: "white"
    }
  });
  b.restitution = 1.08;
  b.inertia = Infinity;
  b.friction = 0;
  b.frictionAir = 0;
  b.frictionStatic = 0;
  let starter = randomNumberInterval(1, 3)
  starter == 1 ? starter = 1 : starter = -1;
  Matter.Body.setPosition(b, {x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2,});
  Matter.Body.setVelocity(b, { x: 3 * starter, y: randomNumberInterval(-4, 5) })
  Composite.add(engine.world, [b]);
  ball = b;
}

function resetBall() {
  Matter.Body.setPosition(ball, {x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2,});
  Matter.Body.setVelocity(ball, { x: 0, y:0 })
}

var keys = [];

document.body.addEventListener("keydown", function (e) {
  keys[e.keyCode] = true;
})
document.body.addEventListener("keyup", function (e) {
  keys[e.keyCode] = false;
})

function updateMovePaddle() {
  if (keys[38]) {
    Matter.Body.translate(paddleR, {
      x: 0,
      y: -PAD_SPEED,
    });
  }
  if (keys[40]) {
    Matter.Body.translate(paddleR, {
      x: 0,
      y: PAD_SPEED,
    });
  }
  if (keys[65]) {
    Matter.Body.translate(paddleL, {
      x: 0,
      y: PAD_SPEED,
    });
  }
  if (keys[81]) {
    Matter.Body.translate(paddleL, {
      x: 0,
      y: -PAD_SPEED,
    });
  }
}

document.body.addEventListener("keydown", (e) => {
  if (e.keyCode == "32") {
    launchBall(ball);
  }
});

////////SCORE GESTION////////

var currentScoreLeft = 0;
var currentScoreRight = 0;

function updateScore(ball) {
  console.log(ball);
  if (ball.x >= GAME_WIDTH)
    document.getElementById('score left span').innerHTML = ++currentScoreLeft;
  else if (ball.x <= 0)
    document.getElementById('score right span').innerHTML = ++currentScoreRight;
}
