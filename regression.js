const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const x_vals = [];
const y_vals = [];

let co_A, co_B;

function setup() {
  // add onClick event
  canvas.addEventListener("click", e => {
    let { x, y } = getMousePosition(e);
    x_vals.push(x);
    y_vals.push(y);
  });

  // set coefficient as tf
  co_A = tf.variable(tf.scalar(Math.random()));
  co_B = tf.variable(tf.scalar(Math.random()));
}

function draw() {
  for (let i = 0; i < x_vals.length; i++) {
    drawDot(x_vals[i], y_vals[i]);
  }
  requestAnimationFrame(draw);
}

function getMousePosition(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
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
