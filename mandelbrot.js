
// Reference:
// http://www.wikihow.com/Plot-the-Mandelbrot-Set-By-Hand
// http://en.wikipedia.org/wiki/Mandelbrot_set

var MANDEL_ITERS = 50; // how many iterations in the mandelbrot sequence

var canvasData = {
  top: 2,
  left: -4,
  bottom: -2,
  right: 4
}; // image data for the canvas

var insideColor = {
  r: 10,
  g: 10,
  b: 200
};

var outsideColor = {
  r: 10,
  g: 100,
  b: 100
};

/**
 * Complex number data structure
 */
function Complex(a, b) {
  this.a = a;
  this.b = b;

  this.multiply = function(z) {
    var new_a = this.a * z.a - this.b * z.b;
    var new_b = this.a * z.b + this.b * z.a;
    return new Complex(new_a, new_b);
  }

  this.add = function(z) {
    var new_a = this.a + z.a;
    var new_b = this.b + z.b;
    return new Complex(new_a, new_b);
  }
}

/**
 * determine if the point (a, b) is in the Mandelbrot Set
 * (a, b) is said to be in the mandelbrot set if, after a set number of iterations,
 * ||(a,b)|| < 2, or equivalently, a^2 + b^2 < 4
 *
 * (a, b) <-> a + bi
 * @a instance of Complex
 * @b instance of Complex
 */
function mandelbrot(c) {
  var z = new Complex(0, 0),
      belongs = true,
      val;

  for(var i = 1; i < MANDEL_ITERS; i++) {
    z = z.multiply(z).add(c);
    if(Math.pow(z.a, 2) + Math.pow(z.b, 2) > 4) {
      belongs = false;
      break;
    }
  }

  if(belongs) {
    val = Math.sqrt(z.a * z.a + z.b * z.b);
  } else {
    val = i;
  }

  return {
    inside: belongs,
    weight: val
  };
}

function drawMandelbrot(canvas) {
  drawMandelbrotFromCoords(canvas, canvasData.top, canvasData.left, canvasData.bottom, canvasData.right);
}

function drawMandelbrotFromCoords(canvas, top, left, bottom, right) {
  var height = canvas.height;
  var width = canvas.width;
  var ctx = canvas.getContext("2d");
  var imgData = ctx.getImageData(0, 0, width, height);

  var length_a = right - left;
  var length_b = top - bottom;
  var diff_a = length_a / width;
  var diff_b = length_b / height;

  // start iterating from the top left
  var currPoint = new Complex(left, top);
  //var a = -2, b = 2;

  // iterate through all pixels
  for(var i = 0; i < height * width; i++) {

    // move to the next point
    if(i % width == 0) {
      currPoint.a = left;
      currPoint.b -= diff_b;
    } else {
      currPoint.a += diff_a;
    }

    // color based on how many iterations to leave the set
    response = mandelbrot(currPoint);
    weight = response.weight;
    //colorPixel(imgData, i, 100 * weight, 50 * weight, 200 * weight, 250);
    if(response.inside) {
      colorPixel(imgData, i, insideColor.r * weight, insideColor.g * weight, insideColor.b * weight, 300);
    } else {
      colorPixel(imgData, i, outsideColor.r * weight, outsideColor.g * weight, outsideColor.b * weight, 300);
    }

  }

  ctx.putImageData(imgData, 0, 0);

  // save information for our friends
  canvasData.imgData  = imgData;
  canvasData.left     = left;
  canvasData.right    = right;
  canvasData.bottom   = bottom;
  canvasData.top      = top;
  canvasData.canvas   = canvas;



  // add click listener and redraw on click
  canvas.addEventListener("click", function(event) {
    // remove the current listener before calling draw
    var oldCanv = document.getElementById("mandelbrot");
    var newCanv = oldCanv.cloneNode(true);
    oldCanv.parentNode.replaceChild(newCanv, oldCanv);

    newBounds = newBoundsFromClick(newCanv, event, top, left, bottom, right, width, height, length_a, length_b);

    drawMandelbrotFromCoords(newCanv, newBounds.top, newBounds.left, newBounds.bottom, newBounds.right);
  } , false);
}

// all those parameters...
function newBoundsFromClick(canvas, event, top, left, bottom, right, width, height, length_a, length_b) {
  // convert mouse click to a point on the complex plane
  var mouse_a = left + ((event.pageX - canvas.offsetLeft) / width) * length_a;
  var mouse_b = top - ((event.pageY - canvas.offsetTop) / height) * length_b;

  var newTop = (top + mouse_b) / 2;
  var newLeft = (left + mouse_a) / 2;
  var newBottom = (bottom + mouse_b) / 2;
  var newRight = (right + mouse_a) / 2;

  return {
    top: newTop,
    left: newLeft,
    bottom: newBottom,
    right: newRight
  };
}

function drawFromForm() {
  button = document.getElementById("redraw");
  button.disabled = true;

  hex = document.getElementById("insideColor").value;
  insideColor = hexToRgb(hex);

  hex = document.getElementById("outsideColor").value;
  outsideColor = hexToRgb(hex);

  drawMandelbrot(document.getElementById("mandelbrot"));

  button.disabled = false;
}

function colorPixel(imgData, pixel, r, g, b, a) {
  scaled = pixel * 4;
  imgData.data[scaled] = r;
  imgData.data[scaled + 1] = g;
  imgData.data[scaled + 2] = b;
  imgData.data[scaled + 3] = a;
}

// http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(color) {
  var r = color.r, g = color.g, b = color.b;
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

document.addEventListener("DOMContentLoaded", function() {
  canvas = document.getElementById("mandelbrot");
  drawMandelbrot(canvas);
  // make sure form values are correct. Hacky way of doing this that relies on this code running before
  // the jscolor code runs...
  document.getElementById("insideColor").value = rgbToHex(insideColor); //color.fromString(rgbToHex(insideColor));
  document.getElementById("outsideColor").value = rgbToHex(outsideColor); //color.fromString(rgbToHex(outsideColor));
});