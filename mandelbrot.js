
// Reference:
// http://www.wikihow.com/Plot-the-Mandelbrot-Set-By-Hand
// http://en.wikipedia.org/wiki/Mandelbrot_set

var MANDEL_ITERS = 50; // how many iterations in the mandelbrot sequence

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
  var z = new Complex(0, 0);

  for(var i = 0; i < MANDEL_ITERS; i++) {
    z = z.multiply(z).add(c);
    if(Math.pow(z.a, 2) + Math.pow(z.b, 2) > 4) {
      return i;
    }
  }

  return -1;
}

function drawMandelbrot(canvas) {
  drawMandelbrotFromCoords(canvas, new Complex(-4, 2), new Complex(4, -2));
}

function drawMandelbrotFromCoords(canvas, topLeftCoord, bottomRightCoord) {
  var height = canvas.height;
  var width = canvas.width;
  var ctx = canvas.getContext("2d");
  var canvasData = ctx.getImageData(0, 0, width, height);

  var length_a = bottomRightCoord.a - topLeftCoord.a;
  var length_b = topLeftCoord.b - bottomRightCoord.b;
  var diff_a = length_a / width;
  var diff_b = length_b / height;

  // start iterating from the top left at (-2, 2)
  var currPoint = new Complex(topLeftCoord.a, topLeftCoord.b);
  //var a = -2, b = 2;

  // iterate through all pixels
  for(var i = 0; i < height * width; i++) {

    // move to the next point
    if(i % width == 0) {
      currPoint.a = topLeftCoord.a;
      currPoint.b -= diff_b;
    } else {
      currPoint.a += diff_a;
    }

    iters = mandelbrot(currPoint);

    if(iters == -1) {
      colourPixel(canvasData, i, 100, 200, 100, 200);
    } else {
      weight = iters / MANDEL_ITERS
      colourPixel(canvasData, i, 200 * weight, 200 * weight, 200 * weight, 100);
    }

  }

  ctx.putImageData(canvasData, 0, 0);

  // add click listener and redraw on click
  canvas.addEventListener("click", function(event) {
    // remove the current listener before calling draw
    var oldCanv = document.getElementById("mandelbrot");
    var newCanv = oldCanv.cloneNode(true);
    oldCanv.parentNode.replaceChild(newCanv, oldCanv);

    newBounds = newBoundsFromClick(event, topLeftCoord, bottomRightCoord, width, height, length_a, length_b);

    drawMandelbrotFromCoords(newCanv, newBounds.topLeft, newBounds.bottomRight);
  } , false);
}

function newBoundsFromClick(event, topLeftCoord, bottomRightCoord, width, height, length_a, length_b) {
  // convert mouse click to a point on the complex plane
  var mouse_a = topLeftCoord.a + (event.pageX / width) * length_a;
  var mouse_b = topLeftCoord.b - (event.pageY / height) * length_b;

  // "centre" is kind of a misnomer
  var newCentre = new Complex(mouse_a, mouse_b);

  var newTop = (topLeftCoord.b + newCentre.b) / 2;
  var newLeft = (topLeftCoord.a + newCentre.a) / 2;
  var newBottom = (newCentre.b + bottomRightCoord.b) / 2;
  var newRight = (newCentre.a + bottomRightCoord.a) / 2;

  return {
    "topLeft": new Complex(newLeft, newTop),
    "bottomRight": new Complex(newRight, newBottom)
  };
}

function colourPixel(canvasData, pixel, r, g, b, a) {
  scaled = pixel * 4;
  canvasData.data[scaled] = r;
  canvasData.data[scaled + 1] = g;
  canvasData.data[scaled + 2] = b;
  canvasData.data[scaled + 3] = a;
}

document.addEventListener("DOMContentLoaded", function() {
  drawMandelbrot(document.getElementById("mandelbrot"));
});