/*The audio part is produced by me according to the tutorial and the linked tutorial. 
No content from the tutorial is used. The rest comes from the tutorial of coding train.*/
//P5.js Tutorial 14. Audio Visualization Interaction Case Study
// https://www.bilibili.com/video/BV1tu411g7KN/?share_source=copy_web&vd_source=fe2dd70155d2f59a9b54faf6e0b5f003
//https://youtu.be/Pn1g1wjxl_0?si=9QlBKQwosmoBvxFS

//This is the second iteration. The swimming ring only moves up and down with the audio. A play button is added.

let graphicsObjects = []; // Array to store all graphics objects
let colorPalette; // Define color palette variable
let shadowRings = []; // Array to store shadow ring positions and radius information
let waveEffect;
let gridLayer;

let sound, fft, amplitude, r = 130, dr = 70; // Variables for sound, FFT, amplitude, and circle radii
let lowEnergy = 0; // Variable to store low-energy value from FFT
let rr = 0; // Variable for rotation or radius control

let drops = [] // Array for raindrop effect objects

const frmLen = 10; // Frame length for animation

let initPoints = []; // Array to store initial points for wave effect
let points = []; // Array of points for wave animation
let wave = []; // Array for wave data

let shakeFreq = 0, shakeFlag = false; // Variables for screen shake effect
function preload(){ 
	sound = loadSound("assets/Spring.mp3");
} 

function setup() {
  createCanvas(windowWidth, windowHeight); // Set canvas size to window size
  
  fft = new p5.FFT(); 
  fft.setInput(sound);
  sound.play();
  amplitude = new p5.Amplitude();
  amplitude.setInput(sound);
  
  initializeGraphics(); // Initialize graphics objects
  pixelDensity(1);

  // Initialize wave effect
  poolColor = color(0, 164, 223)
  waveEffect = new WaveEffect(80, poolColor, 3, 200);
  // waveInit()

  // Create grid and distortion effect layer
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer); // Draw distorted grid
  
  
   p = createVector(random(width), 200) // rain
  
  
  // Create a button and place it beneath the canvas.
  let button = createButton('play/pause');
  button.position(width / 2, height - 20);

  // Call repaint() when the button is pressed.
  button.mousePressed(musicPlay);
}

function initializeGraphics() {
  graphicsObjects = []; // Reset graphics objects array
  shadowRings = []; // Reset shadow ring position storage

  colorPalette = [
    color(245, 185, 193), // 粉色Pink
    color(237, 170, 63),   // 橙色Orange
    color(166, 233, 156), // Light green
    color(238, 116, 178), // Hot pink
    color(65, 124, 180),   // Steel blue
    color(149, 205, 232)   // Light blue
  ];

  const minDistance = 250; // Set the minimum distance between each ring

  // Create multiple non-overlapping shadow rings
  for (let i = 0; i < 10; i++) {
    let posX, posY;
    let isOverlapping;
    let attempts = 0;
    const maxAttempts = 100; // Set maximum attempt count

    do {
      posX = random(100, width - 50);
      posY = random(100, height - 50);
      isOverlapping = false;

      // Check if the new shadow ring overlaps with existing ones
      for (let ring of shadowRings) {
        let distance = dist(posX, posY, ring.x, ring.y);
        if (distance < minDistance) { // Ensure the new ring is at least 'minDistance' from existing rings
          isOverlapping = true;
          break;
        }
      }

      attempts++;
    } while (isOverlapping && attempts < maxAttempts);

    if (attempts >= maxAttempts) continue;

    graphicsObjects.push(new GradientRing(posX, posY, 40, 120, 80, color(6, 38, 96, 20), color(6, 38, 96, 20), color(6, 38, 96, 20)));
    shadowRings.push({ x: posX, y: posY, radius: 80 });
  }

  // Add the corresponding main gradient ring and decorative smaller circle rings for each shadow ring
  for (let ring of shadowRings) {
    let posX = ring.x - 80;
    let posY = ring.y - 80;

    let shadowColor = random(colorPalette);
    let midColor = random(colorPalette);
    let highlightColor = random(colorPalette);

    graphicsObjects.push(new GradientRing(posX, posY, 40, 120, 80, shadowColor, midColor, highlightColor));

    let circleColor = random(colorPalette);
    graphicsObjects.push(new ConcentricCircles(posX, posY, 5, 40, 70, circleColor));

    let baseRadius = 80;
    let baseOpacity = 180;
    let radiusIncrement = 10;
    let opacityDecrement = 20;
    
    graphicsObjects.push(new DecorativeCircleRing(posX, posY, baseRadius, 36, color(255, 255, 255)));
    // for (let j = 0; j < 4; j++) {
    //   graphicsObjects.push(new DecorativeCircleRing(posX, posY, baseRadius + j * radiusIncrement, 36 + j * 6, color(255, 255, 255, baseOpacity - j * opacityDecrement)));
    // }
    graphicsObjects.forEach(obj => {
      obj.initX = obj.x
      obj.initY = obj.y
    });
    
  }
}

function draw() {
  background(240);
  image(gridLayer, 0, 0);
  waveEffect.display();
  let spectrum = fft.analyze(); // Analyze the audio spectrum
  // Calculate the energy in bass and treble
  lowEnergy = fft.getEnergy("bass");
  let highEnergy = fft.getEnergy("treble");
  
  let frame = int(map(lowEnergy, 0, 300, 0, 30))
  
  // loadPixels();
  // for(let i = 0; i < wave[frameIndex].length; i+=4){
  //   pixels[i+0] = wave[frameIndex][i+0];
  //   pixels[i+1] = wave[frameIndex][i+1];
  //   pixels[i+2] = wave[frameIndex][i+2];
  //   pixels[i+3] = wave[frameIndex][i+3];
  // }
  // updatePixels();
  if (keyIsDown(ENTER)) {
    shakeFlag = true;
  }
  if(shakeFlag)
    shakeFreq++;
  
  if (shakeFreq > frame && shakeFlag) {
    shakeFreq = 0;
    fill(0,0,0)
    rect(0,0,width, height)
  }else{
    
    for(let obj of graphicsObjects){
        rr += 0.01
        if(rr > PI * 2){
          rr = 0
        }
        
        obj.y = obj.initY + cos(frame * 12) *  20
        obj.display(rr)
    }


    for (let i = 0; i < 5; i++){
      drops.push(new Drop(random(width), 0, 0))
    }

    for (let d of drops){
      d.show()
      d.update()
    }
  }
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  initializeGraphics(); // Initialize graphics objects
  pixelDensity(1);

  // Initialize wave effect
  poolColor = color(0, 164, 223)
  waveEffect = new WaveEffect(80, poolColor, 3, 200);

  // Create grid and distortion effect layer
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer); // Draw distorted grid

  // Adjust the position of the floaties (graphics objects)
  graphicsObjects.forEach(obj => {
    if (obj instanceof GradientRing || obj instanceof ConcentricCircles || obj instanceof DecorativeCircleRing) {
      obj.x = map(obj.x, 0, width, 0, windowWidth);
      obj.y = map(obj.y, 0, height, 0, windowHeight);
      obj.initY = obj.y
    }
  });

  
}

// Gradient ring class
class GradientRing {
  constructor(x, y, innerRadius, outerRadius, numRings, shadowColor, midColor, highlightColor) {
    this.x = x;
    this.y = y;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.numRings = numRings;
    this.colors = [shadowColor, midColor, highlightColor];
  }

  calculateColor(t) {
    if (t < 0.5) {
      return lerpColor(this.colors[0], this.colors[1], t * 2);
    } else {
      return lerpColor(this.colors[1], this.colors[2], (t - 0.5) * 2);
    }
  }

  display(rot) {
    let step = (this.outerRadius - this.innerRadius) / this.numRings;
    for (let r = this.innerRadius; r <= this.outerRadius; r += step) {
      let t = map(r, this.innerRadius, this.outerRadius, 0, 1);
      stroke(this.calculateColor(t));
      strokeWeight(5);
      noFill();
      push()
      translate(this.x, this.y)
      
      ellipse(0, 0, r * 2, r * 2);
      rotate(rot);
      pop()
      
    }
  }
}

// Concentric circles class
class ConcentricCircles {
  constructor(x, y, numCircles, minRadius, maxRadius, strokeColor) {
    this.x = x;
    this.y = y;
    this.numCircles = numCircles;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.strokeColor = strokeColor;
  }

  display(rot) {
    noFill();
    stroke(this.strokeColor);
    strokeWeight(2);
    for (let i = 0; i < this.numCircles; i++) {
      let radius = map(i, 0, this.numCircles - 1, this.minRadius, this.maxRadius);
      push()
      translate(this.x, this.y)
      rotate(rot); // Rotate each circle by `rot` angle
      ellipse(0, 0, radius * 2, radius * 2); // Draw circle with calculated radius
      pop()
    }
  }
}

// Decorative Circle Ring class
class DecorativeCircleRing {
  constructor(x, y, radius, numCircles, fillColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.numCircles = numCircles;
    this.fillColor = fillColor;
    this.angleStep = TWO_PI / this.numCircles; // Angle between each circle
  }

  display(rot) {
    push()
      translate(this.x, this.y)
    
    for (let j = 0; j < 4; j++) { // Layered rings with different offsets
      // graphicsObjects.push(new DecorativeCircleRing(posX, posY, baseRadius + j * radiusIncrement, 36 + j * 6, color(255, 255, 255, baseOpacity - j * opacityDecrement)));
      
      fill(this.fillColor);
      noStroke();
      
      rotate(rot - j * 0.2); // Adjust rotation slightly for each layer
      for (let i = 0; i < this.numCircles; i++) {
        let angle = i * this.angleStep;
        let x = (this.radius + j * 10) * cos(angle); // Adjust position by radius and layer
        let y = (this.radius + j * 10) * sin(angle);
        ellipse(x, y, 6, 6) // Draw each small circle
      }
    }
    pop()
  }
}

// 绘制网格和扭曲效果的函数 // Function to draw a grid with distortion effects
function drawGridAndDistortion(layer) {
  layer.background(173, 216, 230); // Light blue background
  layer.stroke(100, 150, 200); // Grid line color
  layer.strokeWeight(2);
  let gridSize = 40;
  
  for (let x = 0; x < width; x += gridSize) {
    layer.beginShape();
    for (let y = 0; y <= height; y += gridSize) {
      let offsetX = noise(x * 0.1, y * 0.1) * 10 - 5; // Distortion for X position
      layer.vertex(x + offsetX, y);
    }
    layer.endShape();
  }

  for (let y = 0; y < height; y += gridSize) {
    layer.beginShape();
    for (let x = 0; x <= width; x += gridSize) {
      let offsetY = noise(x * 0.1, y * 0.1) * 10 - 5; // Distortion for Y position
      layer.vertex(x, y + offsetY);
    }
    layer.endShape();
  }
}

// Point class to represent stationary feature points
class Point {
  constructor(x, y) {
    this.position = createVector(x, y); // Position vector of the point
  }
}

// Class to create and display a wave effect using points
class WaveEffect {
  constructor(numPoints, bgColor, step, transparency) {
    this.points = []; // Array to store feature points
    this.step = step; // Step size for drawing
    this.transparency = transparency; // Transparency of the wave effect
    this.bgColor = bgColor; // Base color for the wave effect

    for (let i = 0; i < numPoints; i++) {
      let x = random(width);
      let y = random(height);
      this.points.push(new Point(x, y));
    }

    this.waveLayer = createGraphics(width, height); // Graphics layer for the wave effect
    this.waveLayer.pixelDensity(1);
    this.generateWaveLayer();
  }

  generateWaveLayer() {
    this.waveLayer.clear();
    this.waveLayer.loadPixels();

    for (let x = 0; x < width; x += this.step) {
      for (let y = 0; y < height; y += this.step) {
        let minDist = Infinity;
        for (let point of this.points) {
          let d = (x - point.position.x) ** 2 + (y - point.position.y) ** 2;
          if (d < minDist) minDist = d; // Get closest distance to a point
        }

        let noiseVal = Math.sqrt(minDist);
        let colR = this.waveColor(noiseVal, red(this.bgColor), 14, 2.5);
        let colG = this.waveColor(noiseVal, green(this.bgColor), 21, 2.7);
        let colB = this.waveColor(noiseVal, blue(this.bgColor), 30, 2.7);

        for (let dx = 0; dx < this.step; dx++) {
          for (let dy = 0; dy < this.step; dy++) {
            let px = x + dx;
            let py = y + dy;
            if (px < width && py < height) {
              let index = (px + py * width) * 4;
              this.waveLayer.pixels[index + 0] = colR;
              this.waveLayer.pixels[index + 1] = colG;
              this.waveLayer.pixels[index + 2] = colB;
              this.waveLayer.pixels[index + 3] = this.transparency;
            }
          }
        }
      }
    }

    this.waveLayer.updatePixels();
  }

  waveColor(distance, base, a, e) {
    return constrain(base + Math.pow(distance / a, e), 0, 255);
  }

  display() {
    image(this.waveLayer, 0, 0); // Display the wave layer on screen
  }
}

// Class for raindrop effect
//rain
class Drop{
  constructor(x, y){
    this.pos = createVector(x, y) // Position of the drop
    this.vel = createVector(0, random(map(lowEnergy, 0, 300, 0, 30))) // Falling speed
    this.length = random(20, 40) // Length of the raindrop
    this.strength = random(255) // Strength of the drop (for stroke)
  }
  show(){
    stroke(255, this.strength)
    line(this.pos.x, this.pos.y, this.pos.x, this.pos.y-this.length) // Draw the drop
  }
  
  update(){
    this.pos.add(this.vel) // Update position based on velocity
    if (this.pos.y > height + 100){
      drops.shift() // Remove drop if it goes off screen
    }
  }
  
}

function waveColor(x, a, b, e){
  if(x < 0) return b;
  else return Math.pow(x/a, e)+b;
}


// Function to initialize wave points and calculate wave effect
function waveInit(){
  angleMode(DEGREES);
  stroke(255);
  strokeWeight(12);

  randomSeed(70);
  for(let i = 0; i < 36; i++){
    initPoints.push(createVector(random(width), random(height))); // Random initial points
  }

  for(let f = 0; f < frmLen; f++){
    points.push([]);
    for(let i = 0; i < initPoints.length; i++){
      let pX = 50*sin(f*360/frmLen+6*initPoints[i].x)+initPoints[i].x;
      let pY = 50*cos(f*360/frmLen+6*initPoints[i].y)+initPoints[i].y;
      points[f].push(createVector(pX, pY)); // Calculate wave points for each frame
    }
  }

  for(let f = 0; f < frmLen; f++){
    wave.push([]);
    for(let x = 0; x < width; x++){
      for(let y = 0; y < height; y++){
        let distances = [];
        for(let i = 0; i < points[f].length; i++){
          let d = (x-points[f][i].x)**2+(y-points[f][i].y)**2;
          distances[i] = d;
        }
        let sorted = sort(distances);
        let noise = Math.sqrt(sorted[0]);
        let index = (x + y * width)*4;

        // Daytime color effect
        //Daytime
        wave[f][index+0] = waveColor(noise, 14.5, 44, 2.5);
        wave[f][index+1] = waveColor(noise, 21, 169, 2.5);
        wave[f][index+2] = waveColor(noise, 40, 225, 3.0);

        //Nighttime
        // wave[f][index+0] = waveColor(noise, 40, 32, 2.2);
        // wave[f][index+1] = waveColor(noise, 30, 55, 3.34);
        // wave[f][index+2] = waveColor(noise, 30, 68, 3.55);

        
        wave[f][index+3] = 255;
      }
    }
  }
}

// Function to toggle music playback
function musicPlay() {
  if (sound.isPlaying()) {
    sound.pause();
    noLoop();
  } else {
    sound.play();
    loop();
  }
}