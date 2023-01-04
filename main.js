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
var PAD_SPEED = 75;
let ball;

engine.world.gravity.y = 0;
// create a renderer
var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 810,
    height: 800,
    pixelRatio: 1,
    wireframeBackground: "#000000",
    hasBounds: true,
    enabled: true,
    wireframes: true,
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
// create two boxes and a ground

var paddleL = Bodies.rectangle(0, 200, 20, 160, { isStatic: true });
var paddleR = Bodies.rectangle(810, 200, 20, 160, { isStatic: true });

var wallT = Bodies.rectangle(0, 0, 8000, 50, {
  isStatic: true,
  label: "wallT",
});
var wallB = Bodies.rectangle(0, 800, 8000, 50, { isStatic: true });

// add all of the bodies to the world
Composite.add(engine.world, [paddleL, paddleR, wallT, wallB]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

setInterval(function () {
  Engine.update(engine, 1000 / 60);
  Matter.Events.on(engine, "collisionStart", (e) => {
    console.log(e.pairs[0]);
    //console.log("mathieu");
  });
  //console.log(ball.position.x + " - " + ball.position.y);
  if (ball != undefined)
    if (ball.position.y > 720 || ball.position.y < 80) {
      console.log("wall hit");
      let rejectForce = -(ball.velocity.y * 0.05);
      //console.log(rejectForce);
      if (rejectForce > 1) rejectForce = 1;
      Matter.Body.applyForce(
        ball,
        { x: ball.position.x, y: ball.position.y },
        { x: 0, y: rejectForce }
      );
    }
}, 1000 / 60);

document.body.addEventListener("keydown", (e) => {
  if (e.keyCode == "40") {
    Matter.Body.setPosition(paddleR, {
      x: paddleR.position.x,
      y: paddleR.position.y + PAD_SPEED,
    });
  }

  if (e.keyCode == "38") {
    Matter.Body.setPosition(paddleR, {
      x: paddleR.position.x,
      y: paddleR.position.y - PAD_SPEED,
    });
  }

  if (e.keyCode == "65") {
    Matter.Body.setPosition(paddleL, {
      x: paddleL.position.x,
      y: paddleL.position.y + PAD_SPEED,
    });
  }

  if (e.keyCode == "81") {
    Matter.Body.setPosition(paddleL, {
      x: paddleL.position.x,
      y: paddleL.position.y - PAD_SPEED,
    });
  }
  if (e.keyCode == "32") {
    console.log("game start");
    var b = Bodies.circle(200, 200, 40, 40);
    b.restitution = 1.1;
    b.inertia = Infinity;
    b.friction = 0;
    b.frictionAir = 0;
    b.frictionStatic = 0;
    Matter.Body.setPosition(b, {
      x: 500,
      y: 500,
    });
    Matter.Body.applyForce(
      b,
      { x: b.position.x, y: b.position.y },
      { x: -0.05, y: 0.01 }
    );
    Composite.add(engine.world, [b]);
    ball = b;
  }
});
