const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const modeText = document.getElementById("modeText");
const linearBtn = document.getElementById("linear_btn");
const polyBtn = document.getElementById("poly_btn");

const x_vals = [];
const y_vals = [];
const x_norms = [];
const y_norms = [];

let MODE = "LINEAR";
let co_A, co_B, co_C;
let predict;
let loss;
let learningRate;
let optimizer;

function setup() {
  // add onClick event
  canvas.addEventListener("click", e => {
    let { x, y, x_norm, y_norm } = getMousePosition(e);
    x_vals.push(x);
    y_vals.push(y);
    x_norms.push(x_norm);
    y_norms.push(y_norm);
  });
  linearBtn.addEventListener("click", () => {
    MODE = "LINEAR";
    tf.dispose([co_A, co_B, co_C, optimizer]);
    setFormula();
  });
  polyBtn.addEventListener("click", () => {
    MODE = "POLY";
    tf.dispose([co_A, co_B, co_C, optimizer]);
    setFormula();
  });
  // set fomula
  setFormula();
}

function setFormula() {
  modeText.innerText = MODE;
  switch (MODE) {
    case "POLY":
      // set coefficient as tf
      tf.tidy(() => {
        co_A = tf.scalar(Math.random()).variable();
        co_B = tf.scalar(Math.random()).variable();
        co_C = tf.scalar(Math.random()).variable();
      });
      // set predict function
      // y = a*x^2 + b*x + c
      predict = xs =>
        co_A
          .mul(xs.square())
          .add(co_B.mul(xs))
          .add(co_C);
      // set loss function
      loss = (pred, label) =>
        pred
          .sub(label)
          .square()
          .mean();
      // set optimizer & learning rate
      learningRate = 0.5;
      optimizer = tf.train.adam(learningRate);
      break;
    case "LINEAR":
    default:
      // set coefficient as tf
      tf.tidy(() => {
        co_A = tf.scalar(Math.random()).variable();
        co_B = tf.scalar(Math.random()).variable();
      });
      // set predict function
      // y = a*x + b
      predict = xs => co_A.mul(xs).add(co_B);
      // set loss function
      loss = (pred, label) =>
        pred
          .sub(label)
          .square()
          .mean();
      // set optimizer & learning rate
      learningRate = 0.5;
      optimizer = tf.train.sgd(learningRate);
      break;
  }
  console.log(tf.memory());
}

function draw() {
  // draw background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // do nothing when there is no dots to calculate
  if (x_vals.length < 1) {
    requestAnimationFrame(draw);
    return;
  }
  // train the regression
  train({ x_norms, y_norms, predict, loss, optimizer });
  // draw Dots
  for (let i = 0; i < x_vals.length; i++) {
    drawDot(x_vals[i], y_vals[i]);
  }
  // draw regression graph
  drawGraph();

  // console.log(tf.memory());
  requestAnimationFrame(draw);
}

function train({ x_norms, y_norms, predict, loss, optimizer } = {}) {
  tf.tidy(() => {
    let xs = tf.tensor1d(x_norms);
    let ys = tf.tensor1d(y_norms);
    optimizer.minimize(() => loss(predict(xs), ys));
  });
}

function getMousePosition(e) {
  const rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  let x_norm = x / rect.width;
  let y_norm = y / rect.height; //*(-1)
  return {
    x,
    y,
    x_norm,
    y_norm
  };
}

function drawDot(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
  ctx.stroke();
}

function drawGraph() {
  let lineX = [];
  let lineY;
  let segmentCnt;
  tf.tidy(() => {
    switch (MODE) {
      case "POLY":
        segmentCnt = 20;
        break;
      case "LINEAR":
      default:
        segmentCnt = 1;
        break;
    }
    for (let i = 0; i <= segmentCnt; i++) {
      lineX.push(i / segmentCnt);
    }

    lineY = predict(tf.tensor1d(lineX)).dataSync();
  });

  connectDots(lineX, lineY);
}

function connectDots(lineX, lineY) {
  let w = canvas.width;
  let h = canvas.height;
  ctx.beginPath();
  ctx.moveTo(lineX[0] * w, lineY[0] * h);
  for (let i = 1; i < lineX.length; i++) {
    ctx.lineTo(lineX[i] * w, lineY[i] * h);
  }
  ctx.lineWidth = "1";
  ctx.strokeStyle = "white";
  ctx.stroke();
}

setup();
draw();
