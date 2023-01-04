import "./style.css";
import javascriptLogo from "./javascript.svg";
import { setupCounter } from "./counter.js";
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
// create a renderer
var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 810,
    height: 800,
    pixelRatio: 1,
    background: "#fafa",
    wireframeBackground: "#222",
    hasBounds: true,
    enabled: true,
    wireframes: true,
    showSleeping: true,
    showDebug: false,
    showBroadphase: false,
    showBounds: false,
    showVelocity: false,
    showCollisions: false,
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
// create two boxes and a ground
var ball = Bodies.circle(200, 200, 40, 40);
ball.restitution = 0.8;
ball.inertia = Infinity;
ball.friction = 0;
ball.frictionAir = 0;
ball.frictionStatic = 0;

var paddleL = Bodies.rectangle(0, 200, 40, 160, { isStatic: true });
var paddleR = Bodies.rectangle(810, 200, 40, 160, { isStatic: true });

var wallT = Bodies.rectangle(0, 0, 8000, 50, { isStatic: true });
var wallB = Bodies.rectangle(0, 800, 8000, 50, { isStatic: true });

Matter.Body.applyForce(
  ball,
  { x: ball.position.x, y: ball.position.y },
  { x: -0.1, y: 0 }
);

// add all of the bodies to the world
Composite.add(engine.world, [paddleL, paddleR, ball, wallT, wallB]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

setInterval(function () {
  Engine.update(engine, 1000 / 60);
}, 1000 / 60);

document.body.addEventListener("keydown", (e) => {
  if (e.keyCode == "40") {
    Matter.Body.setPosition(paddleR, {
      x: paddleR.position.x,
      y: paddleR.position.y + 50,
    });
  }

  if (e.keyCode == "38") {
    Matter.Body.setPosition(paddleR, {
      x: paddleR.position.x,
      y: paddleR.position.y - 50,
    });
  }

  if (e.keyCode == "65") {
    Matter.Body.setPosition(paddleL, {
      x: paddleL.position.x,
      y: paddleL.position.y + 50,
    });
  }

  if (e.keyCode == "81") {
    Matter.Body.setPosition(paddleL, {
      x: paddleL.position.x,
      y: paddleL.position.y - 50,
    });
  }
});
