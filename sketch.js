let graphicsObjects = []; // 存储所有图形对象
let colorPalette; // 定义颜色组变量
let shadowRings = []; // 存储所有阴影环的位置和半径信息
let waveEffect;
let gridLayer;

let sound, fft, amplitude, r = 130, dr = 70;
let lowEnergy = 0;
let rr = 0;

let drops = [] // 存储雨滴对象

const frmLen = 10;

let initPoints = []; // 初始化波纹效果的点
let points = []; // 存储波纹效果中的所有点
let wave = []; // 存储波纹效果的图像数据

let shakeFreq = 0, shakeFlag = false; // 控制屏幕震动的频率和标志
function preload(){ 
	sound = loadSound("assets/Spring.mp3"); // 预加载音频文件
} 

function setup() {
  createCanvas(windowWidth, windowHeight); // 设置画布为窗口大小
  
  fft = new p5.FFT(); // 创建音频频谱分析对象
  fft.setInput(sound); // 设置音频输入源
  sound.play(); // 播放音频
  amplitude = new p5.Amplitude(); // 创建音量分析对象
  amplitude.setInput(sound); // 设置音频输入源
  
  initializeGraphics(); // 初始化图形对象
  pixelDensity(1); // 设置像素密度为 1

  // 初始化波纹效果
  poolColor = color(0, 164, 223) // 设置波纹池的颜色
  waveEffect = new WaveEffect(80, poolColor, 3, 200); // 创建波纹效果对象
  // waveInit()

  // 创建网格和扭曲效果图层
  gridLayer = createGraphics(width, height); // 创建网格图层
  drawGridAndDistortion(gridLayer); // 绘制扭曲的网格
  
  
   p = createVector(random(width), 200) // 初始化雨滴的起始位置
}

function initializeGraphics() {
  graphicsObjects = []; // 重置图形对象数组
  shadowRings = []; // 重置阴影环位置存储

  colorPalette = [
    color(245, 185, 193), // 粉色
    color(237, 170, 63),   // 橙色
    color(166, 233, 156), // 亮绿色
    color(238, 116, 178), // 热粉色
    color(65, 124, 180),   // 钢蓝色
    color(149, 205, 232)   // 浅蓝色
  ];

  const minDistance = 250; // 设置每个环之间的最小距离

  // 创建多个互不相交的阴影环
  for (let i = 0; i < 10; i++) {
    let posX, posY;
    let isOverlapping;
    let attempts = 0;
    const maxAttempts = 100; // 设置最大尝试次数

    do {
      posX = random(100, width - 50); // 随机生成阴影环的位置
      posY = random(100, height - 50);
      isOverlapping = false;

      // 检查新阴影环是否与已有阴影环重叠
      for (let ring of shadowRings) {
        let distance = dist(posX, posY, ring.x, ring.y);
        if (distance < minDistance) { // 确保新环和已有环之间的距离大于设定的最小距离
          isOverlapping = true;
          break;
        }
      }

      attempts++;
    } while (isOverlapping && attempts < maxAttempts);

    if (attempts >= maxAttempts) continue;

    // 创建渐变阴影环并添加到图形对象中
    graphicsObjects.push(new GradientRing(posX, posY, 40, 120, 80, color(6, 38, 96, 20), color(6, 38, 96, 20), color(6, 38, 96, 20)));
    shadowRings.push({ x: posX, y: posY, radius: 80 });
  }

  // 为每个阴影环添加对应的主渐变环和装饰小圆环
  for (let ring of shadowRings) {
    let posX = ring.x - 80; // 主环偏移到阴影环的左上方
    let posY = ring.y - 80;

    // 随机选择渐变色
    let shadowColor = random(colorPalette);
    let midColor = random(colorPalette);
    let highlightColor = random(colorPalette);

    // 创建渐变圆环
    graphicsObjects.push(new GradientRing(posX, posY, 40, 120, 80, shadowColor, midColor, highlightColor));

    // 创建同心圆
    let circleColor = random(colorPalette);
    graphicsObjects.push(new ConcentricCircles(posX, posY, 5, 40, 70, circleColor));

    // 创建透明度递减的装饰小圆环
    let baseRadius = 80; 
    let baseOpacity = 180;
    let radiusIncrement = 10;
    let opacityDecrement = 20;

    for (let j = 0; j < 4; j++) {
      graphicsObjects.push(new DecorativeCircleRing(posX, posY, baseRadius + j * radiusIncrement, 36 + j * 6, color(255, 255, 255, baseOpacity - j * opacityDecrement)));
    }
  }
}

function draw() {
  background(240); // 绘制网格图层
  image(gridLayer, 0, 0); // 绘制网格图层
  waveEffect.display(); // 显示波纹效果
  let spectrum = fft.analyze(); // 分析音频频谱
  // 计算低音和高音能量
  lowEnergy = fft.getEnergy("bass"); //低
  let highEnergy = fft.getEnergy("treble"); //高
  
  let frame = int(map(lowEnergy, 300, 0, 0, 30)) // 根据低音能量映射帧数
  
  // loadPixels();
  // for(let i = 0; i < wave[frameIndex].length; i+=4){
  //   pixels[i+0] = wave[frameIndex][i+0];
  //   pixels[i+1] = wave[frameIndex][i+1];
  //   pixels[i+2] = wave[frameIndex][i+2];
  //   pixels[i+3] = wave[frameIndex][i+3];
  // }
  // updatePixels();
  // 如果按下回车键，触发屏幕闪电效果
  if (keyIsDown(ENTER)) {
    shakeFlag = true;
  }
  if(shakeFlag)
    shakeFreq++; // 增加震动频率
  
  // 控制震动效果
  if (shakeFreq > frame && shakeFlag) {
    shakeFreq = 0;
    fill(0,0,0)
    rect(0,0,width, height) // 绘制黑色屏幕覆盖，模拟震动效果
  }else{
    // 否则正常绘制图形
    for(let obj of graphicsObjects){
        rr += 0.001
        if(rr > PI * 2){
          rr = 0
        }
        obj.display(rr) // 绘制每个图形对象
    }


    // 添加雨滴效果
    for (let i = 0; i < 5; i++){
      drops.push(new Drop(random(width), 0, 0)) // 创建雨滴
    }

    for (let d of drops){
      d.show() // 显示雨滴
      d.update() // 更新雨滴位置
    }
  }
  
}

// 调整窗口大小时，重新绘制图形和网格
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // 调整画布大小

  initializeGraphics(); // 初始化图形对象
  pixelDensity(1); // 设置像素密度为 1

  // // 初始化波纹效果
  poolColor = color(0, 164, 223)
  waveEffect = new WaveEffect(80, poolColor, 3, 200);

  // 创建网格和扭曲效果图层
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer); // 绘制扭曲的网格

  // 调整游泳圈（图形对象）的位置
  graphicsObjects.forEach(obj => {
    if (obj instanceof GradientRing || obj instanceof ConcentricCircles || obj instanceof DecorativeCircleRing) {
      obj.x = map(obj.x, 0, width, 0, windowWidth); // 水平缩放
      obj.y = map(obj.y, 0, height, 0, windowHeight); // 垂直缩放
    }
  });

  
}

// 渐变圆环类
class GradientRing {
  constructor(x, y, innerRadius, outerRadius, numRings, shadowColor, midColor, highlightColor) {
    this.x = x;
    this.y = y;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.numRings = numRings;
    this.colors = [shadowColor, midColor, highlightColor]; // 渐变色
  }

  calculateColor(t) {
    if (t < 0.5) {
      return lerpColor(this.colors[0], this.colors[1], t * 2); // 计算渐变颜色
    } else {
      return lerpColor(this.colors[1], this.colors[2], (t - 0.5) * 2);
    }
  }

  display(rot) {
    let step = (this.outerRadius - this.innerRadius) / this.numRings; //计算每个圆环之间间距
    for (let r = this.innerRadius; r <= this.outerRadius; r += step) {
      let t = map(r, this.innerRadius, this.outerRadius, 0, 1);
      stroke(this.calculateColor(t)); // 设置环的颜色
      strokeWeight(5); // 设置线宽
      noFill(); // 不填充
      push()
      translate(this.x, this.y) // 移动到圆心位置
      rotate(rot); // 旋转
      ellipse(lowEnergy - 50, 0, r * 2, r * 2); // 绘制圆环
      pop()
      
    }
  }
}

// 同心圆类
class ConcentricCircles {
  constructor(x, y, numCircles, minRadius, maxRadius, strokeColor) {
    this.x = x;
    this.y = y;
    this.numCircles = numCircles;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.strokeColor = strokeColor; // 设置颜色
  }

  display(rot) {
    noFill();
    stroke(this.strokeColor); // 设置同心圆的边框颜色
    strokeWeight(2); // 设置边框宽度
    for (let i = 0; i < this.numCircles; i++) {
      let radius = map(i, 0, this.numCircles - 1, this.minRadius, this.maxRadius);
      push()
      translate(this.x, this.y) // 将图形移动到圆心位置
      rotate(rot); // 旋转
      ellipse(lowEnergy - 50, 0, radius * 2, radius * 2); // 绘制圆形
      pop()
      // ellipse(this.x, this.y, radius * 2, radius * 2);
    }
  }
}

// 装饰小圆环类
class DecorativeCircleRing {
  constructor(x, y, radius, numCircles, fillColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.numCircles = numCircles;
    this.fillColor = fillColor;
    this.angleStep = TWO_PI / this.numCircles; // 每个小圆的角度每一步
  }

  display(rot) {
    fill(this.fillColor);
    noStroke();
    for (let i = 0; i < this.numCircles; i++) {
      let angle = i * this.angleStep; // 计算每个小圆的角度
      let x = this.x + this.radius * cos(angle); // 计算每个小圆的 x 坐标
      let y = this.y + this.radius * sin(angle); // 计算每个小圆的 y 坐标
      
      push()
      translate(x, y) // 移动到小圆的位置
      rotate(rot);
      ellipse(lowEnergy - 50, 0, 6, 6); // 绘制小圆
      pop()
    }
  }
}

// 绘制网格和扭曲效果的函数
function drawGridAndDistortion(layer) {
  layer.background(173, 216, 230); // 设置网格图层的背景颜色
  layer.stroke(100, 150, 200); // 设置网格的线条颜色
  layer.strokeWeight(2); // 设置线条宽度
  let gridSize = 40; // 网格大小
  
  // 绘制横向扭曲网格
  for (let x = 0; x < width; x += gridSize) {
    layer.beginShape();
    for (let y = 0; y <= height; y += gridSize) {
      let offsetX = noise(x * 0.1, y * 0.1) * 10 - 5; // 使用噪声函数进行位移
      layer.vertex(x + offsetX, y); // 绘制网格线
    }
    layer.endShape();
  }

  // 绘制纵向扭曲网格
  for (let y = 0; y < height; y += gridSize) {
    layer.beginShape();
    for (let x = 0; x <= width; x += gridSize) {
      let offsetY = noise(x * 0.1, y * 0.1) * 10 - 5; // 使用噪声函数进行位移
      layer.vertex(x, y + offsetY); // 绘制网格线
    }
    layer.endShape();
  }
}

// 特征点类，表示每个静止的特征点
class Point {
  constructor(x, y) {
    this.position = createVector(x, y); // 存储点的位置
  }
}

// 波纹效果类，负责生成和显示波纹
class WaveEffect {
  constructor(numPoints, bgColor, step, transparency) {
    this.points = [];
    this.step = step;
    this.transparency = transparency;
    this.bgColor = bgColor;

    for (let i = 0; i < numPoints; i++) {
      let x = random(width); // 随机生成波纹点的初始位置
      let y = random(height);
      this.points.push(new Point(x, y)); // 将点添加到点数组中
    }

    this.waveLayer = createGraphics(width, height); // 创建波纹图层
    this.waveLayer.pixelDensity(1); // 设置像素密度为 1
    this.generateWaveLayer(); // 生成波纹图层
  }

  generateWaveLayer() {
    this.waveLayer.clear(); // 清空图层内容
    this.waveLayer.loadPixels(); // 加载像素数据

    // 遍历每个像素并计算波纹效果
    for (let x = 0; x < width; x += this.step) {
      for (let y = 0; y < height; y += this.step) {
        let minDist = Infinity; // 初始化最小距离
        for (let point of this.points) {
          let d = (x - point.position.x) ** 2 + (y - point.position.y) ** 2;
          if (d < minDist) minDist = d; // 更新最小距离
        }

        let noiseVal = Math.sqrt(minDist); // 计算噪声值
        // 使用波纹颜色函数生成 RGB 颜色
        let colR = this.waveColor(noiseVal, red(this.bgColor), 14, 2.5);
        let colG = this.waveColor(noiseVal, green(this.bgColor), 21, 2.7);
        let colB = this.waveColor(noiseVal, blue(this.bgColor), 30, 2.7);

        // 填充像素数据
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

    this.waveLayer.updatePixels(); // 更新图层像素数据
  }

  waveColor(distance, base, a, e) {
    return constrain(base + Math.pow(distance / a, e), 0, 255); // 计算波纹的颜色
  }

  display() {
    image(this.waveLayer, 0, 0); // 显示波纹图层
  }
}

//rain
class Drop{
  constructor(x, y){
    this.pos = createVector(x, y) // 初始化雨滴的位置
    this.vel = createVector(0, random(map(lowEnergy, 0, 300, 0, 30))) //设置速度垂直
    this.length = random(20, 40) // 设置雨滴的长度
    this.strength = random(255) // 设置雨滴的透明度
  }
  show(){
    stroke(255, this.strength)
    line(this.pos.x, this.pos.y, this.pos.x, this.pos.y-this.length)
  }
  
  update(){
    this.pos.add(this.vel) // 设置雨滴的颜色
    if (this.pos.y > height + 100){ // 如果雨滴落出屏幕，则删除
      drops.shift()
    }
  }
  
}

// waveColor 函数：用于根据输入的距离值和其他参数计算颜色值
function waveColor(x, a, b, e){
  if(x < 0) return b;
  else return Math.pow(x/a, e)+b;
}


// waveInit 函数：初始化波纹效果，生成波纹的初始数据
function waveInit(){
  angleMode(DEGREES);
  stroke(255);
  strokeWeight(12);

  randomSeed(70);
  // 初始化 36 个随机生成的起始点（初始位置）
  for(let i = 0; i < 36; i++){
    initPoints.push(createVector(random(width), random(height)));
  }

  // 生成每一帧的波纹点的运动轨迹
  // frmLen 是总帧数，表示生成的波纹运动的总步骤
  for(let f = 0; f < frmLen; f++){
    points.push([]);
    for(let i = 0; i < initPoints.length; i++){
      let pX = 50*sin(f*360/frmLen+6*initPoints[i].x)+initPoints[i].x;
      let pY = 50*cos(f*360/frmLen+6*initPoints[i].y)+initPoints[i].y;
      points[f].push(createVector(pX, pY));
    }
  }

  // 为每一帧生成波纹的颜色和强度数据
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

// 处理鼠标点击事件
function mouseClicked() {
  if (sound.isPlaying()) {
    sound.pause(); // 如果音乐正在播放，则暂停
    noLoop(); // 停止绘制
  } else {
    sound.play(); // 播放音乐
    loop(); // 启动绘制循环
  }
}