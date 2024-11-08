// Declare the variable graphicsObjects and assign it an empty array, to store the graphic objects
let graphicsObjects = [];  

// Declare the variable colourPalette to store the colour elements in an array
let colourPalette; 

// Declare the variable shadowRings and assign it an empty array, to store data   
let shadowRings = [];

// Declare the variable waveEffect 
let waveEffect;

// Declare the variable gridLayer
let gridLayer;

function setup() {

//Create a canvas that has the same size as the browser window, using the variables windowWidth and windowHeight
  createCanvas(windowWidth, windowHeight);
  noLoop();
  
//Initialise Graphic Elements, such as the colours and rings
  initialiseGraphics();
  pixelDensity(1);

  // Initialise the ripple effect
  poolColour = color(0, 164, 223)
  waveEffect = new WaveEffect(80, poolColour, 3, 200);

  // Create the grid and distortion effect layer
  gridLayer = createGraphics(width, height);
  
  //Draw the distorted horizonal lines and vertical lines at the bottom of the pool 
  drawGridAndDistortion(gridLayer); 
}

function initialiseGraphics() {
  
//Initialize the array assigned to graphicsObjects
  graphicsObjects = [];
  
//Initialize the array assigned to shadowRings
  shadowRings = [];

// Assign the variable colourPalette an array with colors inspired by the selected artwork
  colourPalette = [
    color(245, 185, 193), 
    color(237, 170, 63),  
    color(166, 233, 156),
    color(238, 116, 178),
    color(65, 124, 180),  
    color(149, 205, 232)
  ];

  //Set the minimum distance between each ring
  const minDistance = 250;

  // Create up to 10 non-ovelapping rings
  for (let i = 0; i < 10; i++) {
    let posX, posY;
    let isOverlapping;
    let attempts = 0;
    
  //Each ring is randomly positioned so that it does not overlap with another ring, and the maximum number of attempts is set to 100.
    const maxAttempts = 100; 
  
    //Execute the loop
    do {
      
      //Random x coordinate of the centre, random y coordinate of the centre
      posX = random(100, width - 50);
      posY = random(100, height - 50);
      isOverlapping = false;

      //Loop through the values in the shadowRings array, to check whether the new shadow ring and the existing shadow ring overlap
      for (let ring of shadowRings) {
        let distance = dist(posX, posY, ring.x, ring.y);
        
        //Ensure the distance between the new ring and the existing ring is greater than a set minimum distance. 
        if (distance < minDistance) { 
          isOverlapping = true;
          
          //If not, the random centre coordinates of the ring are invalid, then skip the subsequent meaningless comparisons, to improve performance 
          break; 
        }
      }

      attempts++;
    
    //If there is overlap and there is still avaliable attempts, execute the loop
    } while (isOverlapping && attempts < maxAttempts);

    ///If the number of random attempts reaches the maximum number, and does not get a random ring which does not overlap with other rings, then stop drawing the current ring. "The continue statement breaks one iteration (in the loop)", and this quotation of this technique is from https://www.w3schools.com/js/js_break.asp

    if (attempts >= maxAttempts) continue;

    //Draw the shadow under the swimming ring
    graphicsObjects.push(new GradientRing(posX, posY, 40, 120, 80, color(6, 38, 96, 20), color(6, 38, 96, 20), color(6, 38, 96, 20)));
    
    //Draw the swimming ring Above the shadow
    shadowRings.push({ x: posX, y: posY, radius: 80 });
  }

  //Our circle is an original idea. After several iterations, we finally chose a polka dot circle to form the swimming ring.
  
  // Add corresponding main gradient ring and decorative small ring for each swimming ring
  for (let ring of shadowRings) {
    let posX = ring.x - 80;
    let posY = ring.y - 80;

    let shadowColour = random(colourPalette);
    let midColour = random(colourPalette);
    let highlightColour = random(colourPalette);

    //Draw the main gradient ring of the swimming ring
    graphicsObjects.push(new GradientRing(posX, posY, 40, 120, 80, shadowColour, midColour, highlightColour));
    
    //Draw the concentric circles inside the swimming ring
    let circleColour = random(colourPalette);
    graphicsObjects.push(new ConcentricCircles(posX, posY, 5, 40, 70, circleColour));

    let baseRadius = 80;
    let baseOpacity = 180;
    let radiusIncrement = 10;
    let opacityDecrement = 20;
    
    //Painted decorative ring
    for (let j = 0; j < 4; j++) {
      graphicsObjects.push(new DecorativeCircleRing(posX, posY, baseRadius + j * radiusIncrement, 36 + j * 6, color(255, 255, 255, baseOpacity - j * opacityDecrement)));
    }
  }
}

function draw() {
  // Display the grid layer with distortion
  image(gridLayer, 0, 0);
  
  // Display the ripple effect
  waveEffect.display();
  
  // Display each graphic object in the array
  graphicsObjects.forEach(obj => obj.display());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Regenerate the grid layer
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer);

  // Regenerate the ripple effect to fit the new canvas size
  waveEffect = new WaveEffect(80, color(0, 164, 223), 3, 200);

  // Adjust the position of the swimming ring (graphic object)
  graphicsObjects.forEach(obj => {
    if (obj instanceof GradientRing || obj instanceof ConcentricCircles || obj instanceof DecorativeCircleRing) {
      obj.x = map(obj.x, 0, width, 0, windowWidth);
      obj.y = map(obj.y, 0, height, 0, windowHeight);
    }
  });

  redraw(); // Redraw the canvas contents
}

// Gradient ring type
//Contains the coordinates of the center of the circle, inner and outer radii, number of circles, and gradient colors (shadow, middle, highlight)
class GradientRing {
  constructor(x, y, innerRadius, outerRadius, numRings, shadowColour, midColour, highlightColour) {
    this.x = x;
    this.y = y;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.numRings = numRings;
    this.colours = [shadowColour, midColour, highlightColour];
  }

  //Calculate gradient colors
  calculatecolor(t) {
    if (t < 0.5) {
      return lerpColor(this.colours[0], this.colours[1], t * 2);
    } else {
      return lerpColor(this.colours[1], this.colours[2], (t - 0.5) * 2);
    }
  }

  // Show gradient ring
  display() {
    let step = (this.outerRadius - this.innerRadius) / this.numRings;
    for (let r = this.innerRadius; r <= this.outerRadius; r += step) {
      let t = map(r, this.innerRadius, this.outerRadius, 0, 1);
      //Set border color
      stroke(this.calculatecolor(t));
      strokeWeight(5);
      noFill();
      ellipse(this.x, this.y, r * 2, r * 2);
    }
  }
}

// Concentric circles
class ConcentricCircles {
  constructor(x, y, numCircles, minRadius, maxRadius, strokeColour) {
    this.x = x;
    this.y = y;
    this.numCircles = numCircles;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.strokeColour = strokeColour;
  }

  // Display concentric circles
  display() {
    noFill();
    stroke(this.strokeColour);
    strokeWeight(2);
    for (let i = 0; i < this.numCircles; i++) {
      //Calculate the radius of the current circle
      let radius = map(i, 0, this.numCircles - 1, this.minRadius, this.maxRadius);
      ellipse(this.x, this.y, radius * 2, radius * 2);
    }
  }
}

// Decorative small rings
class DecorativeCircleRing {
  constructor(x, y, radius, numCircles, fillColour) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.numCircles = numCircles;
    this.fillColour = fillColour;
    //The angle interval of each small circle
    this.angleStep = TWO_PI / this.numCircles;
  }

  // Display the decorative ring
  display() {
    fill(this.fillColour);
    noStroke();
    for (let i = 0; i < this.numCircles; i++) {
      let angle = i * this.angleStep;
      let x = this.x + this.radius * cos(angle);
      let y = this.y + this.radius * sin(angle);
      ellipse(x, y, 6, 6);
    }
  }
}

// Functions for drawing meshes and distortion effects
function drawGridAndDistortion(layer) {
  layer.background(173, 216, 230);
  layer.stroke(100, 150, 200);
  layer.strokeWeight(2);
  let gridSize = 40;
  
  for (let x = 0; x < width; x += gridSize) {
    layer.beginShape();
    for (let y = 0; y <= height; y += gridSize) {
      // Use the noise function to generate the offset of the x-axis to create a distortion effect
      let offsetX = noise(x * 0.1, y * 0.1) * 10 - 5;
      layer.vertex(x + offsetX, y);
    }
    layer.endShape();
  }

  for (let y = 0; y < height; y += gridSize) {
    layer.beginShape();
    for (let x = 0; x <= width; x += gridSize) {
      // Use the noise function to generate the offset of the y-axis to create a distortion effect
      let offsetY = noise(x * 0.1, y * 0.1) * 10 - 5;
      layer.vertex(x, y + offsetY);
    }
    layer.endShape();
  }
}


// Original ripple effect implementation using Worley Noise from Kazuki Umeda
// Source: https://www.youtube.com/watch?app=desktop&v=kUexPZMIwuA
// GitHub: https://github.com/Creativeguru97/YouTube_tutorial/blob/master/Play_with_noise/waterSurface/sketch.js
// Modified for additional features and integration into project

// Point class representing each feature point
class Point {
  constructor(x, y) {
    // Store the position as a vector
    this.position = createVector(x, y);
  }
}

// WaveEffect class responsible for generating and displaying ripples
class WaveEffect {
  constructor(numPoints, bgColour, step, transparency) {
    this.points = [];
    // Spacing between calculated points in the ripple effect
    this.step = step;
    // Transparency of the ripple layer
    this.transparency = transparency;
    // Background colour of the pool effect
    this.bgColour = bgColour;
    // Generate random feature points within the canvas
    for (let i = 0; i < numPoints; i++) {
      let x = random(width);
      let y = random(height);
      this.points.push(new Point(x, y));
    }

    // Create a graphics layer for the wave effect
    this.waveLayer = createGraphics(width, height);
    // Set pixel density to 1 for consistency
    this.waveLayer.pixelDensity(1);
    this.generateWaveLayer();
  }

  
  // Function to generate the ripple effect on the wave layer
  generateWaveLayer() {
    // Clear the layer to remove any previous drawings
    this.waveLayer.clear();
    this.waveLayer.loadPixels();

    // Iterate over the canvas in steps to create the wave pattern
    for (let x = 0; x < width; x += this.step) {
      for (let y = 0; y < height; y += this.step) {
        
        // Find the minimum distance from the current position to any feature point
        let minDist = Infinity; 
        for (let point of this.points) {
          let d = (x - point.position.x) ** 2 + (y - point.position.y) ** 2;
          if (d < minDist) minDist = d;
        }

        // Calculate noise value based on the distance to the nearest feature point
        let noiseVal = Math.sqrt(minDist);
        
        // Calculate colour values for each channel based on the distance and pool background colour
        let colR = this.wavecolour(noiseVal, red(this.bgColour), 14, 2.5);
        let colG = this.wavecolour(noiseVal, green(this.bgColour), 21, 2.7);
        let colB = this.wavecolour(noiseVal, blue(this.bgColour), 30, 2.7);

        // Apply the calculated colour to each pixel within the current step
        for (let dx = 0; dx < this.step; dx++) {
          for (let dy = 0; dy < this.step; dy++) {
            let px = x + dx;
            let py = y + dy;
            // Ensure stay within canvas boundaries
            if (px < width && py < height) {
              
              // Calculate pixel array index
              let index = (px + py * width) * 4; 
              this.waveLayer.pixels[index + 0] = colR; // Red channel
              this.waveLayer.pixels[index + 1] = colG; // Green channel
              this.waveLayer.pixels[index + 2] = colB; // Blue channel
              this.waveLayer.pixels[index + 3] = this.transparency; // Alpha channel
            }
          }
        }
      }
    }

    // Apply all changes to the pixels array
    this.waveLayer.updatePixels();
  }

  // Function to calculate colour based on distance and colour channel properties from Kazuki Umeda
  wavecolour(distance, base, a, e) {
    return constrain(base + Math.pow(distance / a, e), 0, 255); // Constrain result to valid colour range
  }

  // Function to display the generated ripple effect layer on the canvas
  display() {
    image(this.waveLayer, 0, 0);
  }
}