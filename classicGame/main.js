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
var PADDLE_HEIGHT = 150;

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
var scorer = 1;
var keys = [];

/// CREATION OF ALL BODIES ///

var paddleL = Bodies.rectangle(20, GAME_HEIGHT / 2, 20, PADDLE_HEIGHT, { 
  isStatic: true,
  label: "PaddleLeft",
  render: {
    fillStyle: "black"
  },
  height: PADDLE_HEIGHT,
});
var paddleR = Bodies.rectangle(GAME_WIDTH - 20, GAME_HEIGHT / 2, 20, PADDLE_HEIGHT, { 
  isStatic: true,
  label: "PaddleRight",
  render: {
    fillStyle: "black",
  },
  height: PADDLE_HEIGHT,
});
var wallT = Bodies.rectangle(0, 0, GAME_WIDTH * 2, WALL_THICKNESS, {
  isStatic: true,
  label: "WallT",
  render: {
    fillStyle: "white",
  }
});
var wallB = Bodies.rectangle(0, GAME_HEIGHT, GAME_WIDTH * 2, WALL_THICKNESS, { 
  isStatic: true, 
  label: "WallB",
  render: {
    fillStyle: "white",
  }, 
});

/// ADD BODIES TO THE WORLD ///

Composite.add(engine.world, [paddleL, paddleR, wallT, wallB]);

/// CREATE AND RUN THE RUNNER ///

var runner = Runner.create();
Runner.run(runner, engine);

initBall();

/// GAME LOOP ///

setInterval(function () {
  updateColorMode();
  updateMovePaddle();
  if (ball != undefined) {
    gestionBallVelocity();
    gestionCollisions();
    gestionScore();
    Engine.update(engine, 1000 / 120);
  }
}, 1000 / 60);

function updateColorMode() {
  if (document.getElementById("hardcoreBtn").innerHTML == "ON") {
    document.querySelector('body').style.color = "black"
    paddleL.render.fillStyle = "black"
    paddleR.render.fillStyle = "black"
    ball.render.fillStyle = "black"
    wallB.render.fillStyle = "white"
    wallT.render.fillStyle = "white"
    render.options.background = "white"
  } else {
    document.querySelector('body').style.color = "white"
    paddleL.render.fillStyle = "white"
    paddleR.render.fillStyle = "white"
    ball.render.fillStyle = "white"
    wallB.render.fillStyle = "black"
    wallT.render.fillStyle = "black"
    render.options.background = "black"
  }
}

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
      fillStyle: "black"
    }
  });
  b.restitution = 1.05;
  b.inertia = Infinity;
  b.friction = 0;
  b.frictionAir = 0;
  b.frictionStatic = 0;
  Matter.Body.setPosition(b, {x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2,});
  Composite.add(engine.world, [b]);
  ball = b;
}

function launchBall() {
  Matter.Body.setVelocity(ball, { x: 3 * scorer, y: randomNumberInterval(-3, 3) })
}

function resetBall() {
  Matter.Body.setPosition(ball, {x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2,});
  Matter.Body.setVelocity(ball, { x: 0, y: 0 })
  if (document.getElementById("hardcoreBtn").innerHTML == "ON" && paddleL.height > 50) {
    PADDLE_HEIGHT = PADDLE_HEIGHT * 0.9;
    paddleL.height = PADDLE_HEIGHT;
    Matter.Body.scale(paddleR, 1, 0.9);
    Matter.Body.scale(paddleL, 1, 0.9);
  }
}

function gestionBallVelocity() {
  if (ball.velocity.y >= 3.5 ) {
    var ballVelocityX = ball.velocity.x
    Matter.Body.setVelocity(ball, { x: ballVelocityX, y: 3.5 })
  } else if (ball.velocity.y <= -3.5) {
    var ballVelocityX = ball.velocity.x
    Matter.Body.setVelocity(ball, { x: ballVelocityX, y: -3.5 })
  }
  if (ball.velocity.x <= 2 && ball.velocity.x > 0) {
    var ballVelocityY = ball.velocity.y
    Matter.Body.setVelocity(ball, { x: 2, y: ballVelocityY })
  } else if (ball.velocity.x >= -2 && ball.velocity.x < 0) {
    var ballVelocityY = ball.velocity.y
    Matter.Body.setVelocity(ball, { x: -2, y: ballVelocityY })
  }
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
    if (paddleR.position.y > (PADDLE_HEIGHT / 2) + 22)
      Matter.Body.translate(paddleR, { x: 0, y: -PAD_SPEED});
  if (keys[40])
    if (paddleR.position.y < (GAME_HEIGHT - (PADDLE_HEIGHT / 2)) - 22)
      Matter.Body.translate(paddleR, { x: 0, y: PAD_SPEED });

  if (keys[65])
    if (paddleL.position.y < (GAME_HEIGHT - (PADDLE_HEIGHT / 2)) - 22)
      Matter.Body.translate(paddleL, { x: 0, y: PAD_SPEED });
  if (keys[81])
    if (paddleL.position.y > (PADDLE_HEIGHT / 2) + 22)
      Matter.Body.translate(paddleL, { x: 0, y: -PAD_SPEED });
}

document.body.addEventListener("keydown", (e) => {
  if (e.keyCode == "32" && (ball.velocity.x == 0 && ball.velocity.y == 0))
    launchBall();
});

/// SCORE GESTION ///

function gestionScore() {
  if (ball.position.x < 0)
    scorer = -1;
  else if (ball.position.x > GAME_WIDTH)
    scorer = 1;
  if (ball.position.x < 0 || ball.position.x > GAME_WIDTH) {
    updateScore();
    resetBall();
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

//////////

function onbuttonclick() {
  console.log("oui!")
}