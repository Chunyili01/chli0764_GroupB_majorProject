/*The audio part is produced by me according to the tutorial and the linked tutorial. 
No content from the tutorial is used. The rest comes from the tutorial of coding train.*/
//P5.js Tutorial 14. Audio Visualization Interaction Case Study
// https://www.bilibili.com/video/BV1tu411g7KN/?share_source=copy_web&vd_source=fe2dd70155d2f59a9b54faf6e0b5f003
//https://youtu.be/Pn1g1wjxl_0?si=9QlBKQwosmoBvxFS

//This is the second iteration. The swimming ring only moves up and down with the audio. A play button is added.
let graphicsObjects = []; // Array to store all graphics objects
let colorPalette; // Variable for color palette
let shadowRings = []; // Array to store shadow ring positions and radius information
let waveEffect; // Variable for wave effect instance
let gridLayer; // Layer to draw the grid

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
	sound = loadSound("assets/Spring.mp3"); // Load sound file before setup
} 

function setup() {
  createCanvas(windowWidth, windowHeight); // Set canvas size to window size
  
  fft = new p5.FFT(); // Create FFT (Fast Fourier Transform) object
  fft.setInput(sound); // Set FFT input to the loaded sound
  sound.play(); // Start playing the sound
  amplitude = new p5.Amplitude(); // Create amplitude analysis object
  amplitude.setInput(sound); // Set amplitude input to the loaded sound
  
  initializeGraphics(); // Initialize graphics objects (like circles and wave effects)
  pixelDensity(1); // Set pixel density for the display

  // Initialize wave effect with specified color and parameters
  poolColor = color(0, 164, 223)
  waveEffect = new WaveEffect(80, poolColor, 3, 200);
  // waveInit()

  // Create grid and distortion effect layer
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer); // Draw the distorted grid
  
  
   p = createVector(random(width), 200) // rain
  
  
  // Create a button and place it beneath the canvas.
  let button = createButton('play/pause');
  button.position(width / 2, height - 20);

  // Call repaint() when the button is pressed.
  button.mousePressed(musicPlay);
}

function initializeGraphics() {
  graphicsObjects = []; // Reset graphics objects array
  shadowRings = []; // Reset shadow rings position storage

  colorPalette = [
    color(245, 185, 193), // 粉色Pink
    color(237, 170, 63),   // 橙色Orange
    color(166, 233, 156), // 亮绿色Bright Green
    color(238, 116, 178), // 热粉色Hot Pink
    color(65, 124, 180),   // 钢蓝色Steel Blue
    color(149, 205, 232)   // 浅蓝色Light Blue
  ];

  const minDistance = 250; // Set minimum distance between each ring

  // Create multiple non-overlapping shadow rings
  for (let i = 0; i < 10; i++) {
    let posX, posY;
    let isOverlapping;
    let attempts = 0;
    const maxAttempts = 100; // Set maximum number of attempts

    do {
      posX = random(100, width - 50);
      posY = random(100, height - 50);
      isOverlapping = false;

      // Check if new shadow ring overlaps with existing rings
      for (let ring of shadowRings) {
        let distance = dist(posX, posY, ring.x, ring.y);
        if (distance < minDistance) { // Ensure distance between new ring and existing rings is greater than minimum
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

  // Add main gradient rings and decorative small circles for each shadow ring
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
  let spectrum = fft.analyze(); // Analyze audio spectrum
  // 计算低音和高音能量
  lowEnergy = fft.getEnergy("bass"); // Calculate bass energy
  let highEnergy = fft.getEnergy("treble"); // Calculate treble energy
  
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
        rr += PI * 2 / 10
        if(rr > PI * 2){
          rr = 0
        }
        
        obj.x = obj.initX + sin(frame * 12) *  20
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
  resizeCanvas(windowWidth, windowHeight); // Adjust canvas size to new window size

  initializeGraphics(); // Reinitialize graphics objects
  pixelDensity(1);

  // 初始化波纹效果Initialize the wave effect with color, density, and transparency settings
  poolColor = color(0, 164, 223)
  waveEffect = new WaveEffect(80, poolColor, 3, 200);

  // Create the grid and distortion effect layer
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer); // Draws the distorted grid

  // Adjust position of graphical objects (e.g., rings) to fit the screen dimensions
  graphicsObjects.forEach(obj => {
    if (obj instanceof GradientRing || obj instanceof ConcentricCircles || obj instanceof DecorativeCircleRing) {
      obj.x = map(obj.x, 0, width, 0, windowWidth);
      obj.y = map(obj.y, 0, height, 0, windowHeight);
      obj.initX = obj.x
      obj.initY = obj.y
    }
  });

  
}

// 渐变圆环类GradientRing class for creating a ring with gradient colors
class GradientRing {
  constructor(x, y, innerRadius, outerRadius, numRings, shadowColor, midColor, highlightColor) {
    this.x = x;
    this.y = y;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.numRings = numRings;
    this.colors = [shadowColor, midColor, highlightColor];
  }

  // Calculate gradient color based on position within the ring
  calculateColor(t) {
    if (t < 0.5) {
      return lerpColor(this.colors[0], this.colors[1], t * 2);
    } else {
      return lerpColor(this.colors[1], this.colors[2], (t - 0.5) * 2);
    }
  }

  // Display the gradient ring with rotation
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

// 同心圆类ConcentricCircles class for creating concentric rings
class ConcentricCircles {
  constructor(x, y, numCircles, minRadius, maxRadius, strokeColor) {
    this.x = x;
    this.y = y;
    this.numCircles = numCircles;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.strokeColor = strokeColor;
  }

  // Display concentric circles with rotation
  display(rot) {
    noFill();
    stroke(this.strokeColor);
    strokeWeight(2);
    for (let i = 0; i < this.numCircles; i++) {
      let radius = map(i, 0, this.numCircles - 1, this.minRadius, this.maxRadius);
      push()
      translate(this.x, this.y)
      rotate(rot);
      ellipse(0, 0, radius * 2, radius * 2);
      pop()
    }
  }
}

// 装饰小圆环类DecorativeCircleRing class to create a ring of small circles
class DecorativeCircleRing {
  constructor(x, y, radius, numCircles, fillColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.numCircles = numCircles;
    this.fillColor = fillColor;
    this.angleStep = TWO_PI / this.numCircles;
  }

  // Display the decorative circle ring with rotation
  display(rot) {
    push()
      translate(this.x, this.y)
    
      // Loop through different layers of circles
    for (let j = 0; j < 4; j++) {
      // graphicsObjects.push(new DecorativeCircleRing(posX, posY, baseRadius + j * radiusIncrement, 36 + j * 6, color(255, 255, 255, baseOpacity - j * opacityDecrement)));
      
      fill(this.fillColor);
      noStroke();
      
      // Rotate each layer slightly to add depth
      rotate(rot - j * 0.2);
      for (let i = 0; i < this.numCircles; i++) {
        let angle = i * this.angleStep;
        let x = (this.radius + j * 10) * cos(angle);
        let y = (this.radius + j * 10) * sin(angle);
        ellipse(x, y, 6, 6)
      }
    }
    pop()
  }
}

// Function to draw a distorted grid on a layer
function drawGridAndDistortion(layer) {
  layer.background(173, 216, 230);
  layer.stroke(100, 150, 200);
  layer.strokeWeight(2);
  let gridSize = 40;
  
  // Draw vertical lines with distortion
  for (let x = 0; x < width; x += gridSize) {
    layer.beginShape();
    for (let y = 0; y <= height; y += gridSize) {
      let offsetX = noise(x * 0.1, y * 0.1) * 10 - 5;
      layer.vertex(x + offsetX, y);
    }
    layer.endShape();
  }

  // Draw horizontal lines with distortion
  for (let y = 0; y < height; y += gridSize) {
    layer.beginShape();
    for (let x = 0; x <= width; x += gridSize) {
      let offsetY = noise(x * 0.1, y * 0.1) * 10 - 5;
      layer.vertex(x, y + offsetY);
    }
    layer.endShape();
  }
}

// Point class represents a static feature point in the wave effect
class Point {
  constructor(x, y) {
    this.position = createVector(x, y);
  }
}

// WaveEffect class to generate and display wave effects
class WaveEffect {
  constructor(numPoints, bgColor, step, transparency) {
    this.points = [];
    this.step = step;
    this.transparency = transparency;
    this.bgColor = bgColor;

    // Create points for wave distortion
    for (let i = 0; i < numPoints; i++) {
      let x = random(width);
      let y = random(height);
      this.points.push(new Point(x, y));
    }

    // Create a graphics layer for the wave effect
    this.waveLayer = createGraphics(width, height);
    this.waveLayer.pixelDensity(1);
    this.generateWaveLayer();
  }

  // Generate the wave effect based on points
  generateWaveLayer() {
    this.waveLayer.clear();
    this.waveLayer.loadPixels();

    for (let x = 0; x < width; x += this.step) {
      for (let y = 0; y < height; y += this.step) {
        let minDist = Infinity;
        for (let point of this.points) {
          let d = (x - point.position.x) ** 2 + (y - point.position.y) ** 2;
          if (d < minDist) minDist = d;
        }

        let noiseVal = Math.sqrt(minDist);
        let colR = this.waveColor(noiseVal, red(this.bgColor), 14, 2.5);
        let colG = this.waveColor(noiseVal, green(this.bgColor), 21, 2.7);
        let colB = this.waveColor(noiseVal, blue(this.bgColor), 30, 2.7);

        // Apply the colors and transparency
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

  // Calculate wave color intensity based on distance
  waveColor(distance, base, a, e) {
    return constrain(base + Math.pow(distance / a, e), 0, 255);
  }

  // Display the wave effect
  display() {
    image(this.waveLayer, 0, 0);
  }
}

//rain
// Drop class representing individual rain drops
class Drop{
  constructor(x, y){
    this.pos = createVector(x, y)
    this.vel = createVector(0, random(map(lowEnergy, 0, 300, 0, 30)))
    this.length = random(20, 40)
    this.strength = random(255)
  }
  // Display the drop as a line
  show(){
    stroke(255, this.strength)
    line(this.pos.x, this.pos.y, this.pos.x, this.pos.y-this.length)
  }
  
  // Update drop position
  update(){
    this.pos.add(this.vel)
    if (this.pos.y > height + 100){
      drops.shift()
    }
  }
  
}

// Calculate wave color intensity based on x distance
function waveColor(x, a, b, e){
  if(x < 0) return b; // Return base color if x is negative
  else return Math.pow(x/a, e)+b; // Calculate intensity with distance and given parameters
}

// Function to initialize wave effect settings and pre-calculate wave frames
function waveInit(){
  angleMode(DEGREES); // Set angle mode to degrees for trigonometric calculations
  stroke(255);
  strokeWeight(12);

  randomSeed(70); // Set seed for random number generation to ensure consistency
  for(let i = 0; i < 36; i++){
    // Initialize 36 random points on the canvas
    initPoints.push(createVector(random(width), random(height)));
  }

  // Generate frames for the wave effect
  for(let f = 0; f < frmLen; f++){
    points.push([]);
    for(let i = 0; i < initPoints.length; i++){
      // Calculate new position for each point in each frame using sine and cosine
      let pX = 50*sin(f*360/frmLen+6*initPoints[i].x)+initPoints[i].x;
      let pY = 50*cos(f*360/frmLen+6*initPoints[i].y)+initPoints[i].y;
      points[f].push(createVector(pX, pY)); // Add transformed point to frame
    }
  }

  // Generate color data for each pixel in each frame
  for(let f = 0; f < frmLen; f++){
    wave.push([]); // Initialize frame array
    for(let x = 0; x < width; x++){
      for(let y = 0; y < height; y++){
        let distances = []; // Array to store distances to points in current frame
        for(let i = 0; i < points[f].length; i++){
          // Calculate squared distance from current pixel (x, y) to each point
          let d = (x-points[f][i].x)**2+(y-points[f][i].y)**2;
          distances[i] = d;
        }
        let sorted = sort(distances); // Sort distances to get nearest point
        let noise = Math.sqrt(sorted[0]); // Use nearest distance for color calculation
        let index = (x + y * width)*4; // Calculate pixel index in wave array

        //Daytime
        wave[f][index+0] = waveColor(noise, 14.5, 44, 2.5); // Red channel
        wave[f][index+1] = waveColor(noise, 21, 169, 2.5); // Green channel
        wave[f][index+2] = waveColor(noise, 40, 225, 3.0); // Blue channel

        //Nighttime
        // wave[f][index+0] = waveColor(noise, 40, 32, 2.2);
        // wave[f][index+1] = waveColor(noise, 30, 55, 3.34);
        // wave[f][index+2] = waveColor(noise, 30, 68, 3.55);

        
        wave[f][index+3] = 255; // Set alpha channel to full opacity
      }
    }
  }
}

// Function to toggle music playback
function musicPlay() {
  if (sound.isPlaying()) {
    sound.pause(); // Pause music if it's playing
    noLoop(); // Stop looping animation
  } else {
    sound.play(); // Play music if it's paused
    loop(); // Resume looping animation
  }
}