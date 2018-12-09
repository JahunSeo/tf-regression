const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const x_vals = [];
const y_vals = [];
const x_norms = [];
const y_norms = [];

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
    console.log(x, y, x_norm, y_norm);
  });

  // set coefficient as tf
  co_A = tf.scalar(Math.random()).variable();
  co_B = tf.scalar(Math.random()).variable();
  co_C = tf.scalar(Math.random()).variable();
  console.log(co_A.print());
  // set predict & loss function
  // y = a*x^2 + b*x + c
  predict = xs =>
    co_A
      .mul(xs.square())
      .add(co_B.mul(xs))
      .add(co_C);
  loss = (pred, label) =>
    pred
      .sub(label)
      .square()
      .mean();
  // set optimizer & learning rate
  learningRate = 0.01;
  optimizer = tf.train.sgd(learningRate);
}

function draw() {
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
  requestAnimationFrame(draw);
}

function train({ x_norms, y_norms, predict, loss, optimizer } = {}) {
  let xs = tf.tensor1d(x_norms);
  let ys = tf.tensor1d(y_norms);
  optimizer.minimize(() => loss(predict(xs), ys));
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
  ctx.stroke();
}

setup();
draw();
