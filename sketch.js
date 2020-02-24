var currentWorkingSegment = {};
var allSegments = [];
var intersectionsToDraw = new Set();
var myGraph = {};
var myPolygons = [];

function setup() {
  var canvas = createCanvas(600, 600)
  canvas.parent('canvas-holder');
}

function drawCurrentWorkingSegment(){
    if (currentWorkingSegment.point1 && !currentWorkingSegment.point2) {
        stroke(0);
        line(currentWorkingSegment.point1.x, currentWorkingSegment.point1.y, mouseX, mouseY);
      }    
}

function drawPolygons(){
    myPolygons.forEach(polygon => { drawPolygon(polygon)});
}

function drawPolygon(polygon){
    for (let i = 0; i < polygon.length; i++){     
        if (!polygon[i].x || !polygon[i].y){
            return;
        }       
    }

    stroke(0,255,0);
    strokeWeight(3);
    fill(polygon.color);
    beginShape();
    for (let i = 0; i < polygon.length; i++){            
        vertex(polygon[i].x, polygon[i].y);
    }
    endShape();
}


function draw() {
  background(210);
  drawPolygons();
  allSegments.forEach(segment => drawSegment(segment));
  drawCurrentWorkingSegment();  
}

function drawSegment(segment) {
  stroke(0);
  strokeWeight(1);
  line(segment.point1.x, segment.point1.y, segment.point2.x, segment.point2.y);
}

function addSegment(segment) {
  allSegments.push(segment);
}

function mousePressed() {
  if (currentWorkingSegment.point1 === undefined) {
    currentWorkingSegment.point1 = {
      x: mouseX,
      y: mouseY
    };
  } else {
    currentWorkingSegment.point2 = {
      x: mouseX,
      y: mouseY
    };

    addSegment(new LineSegment(currentWorkingSegment.point1, currentWorkingSegment.point2));;
    currentWorkingSegment = {};
    myPolygons = PolygonFinder.polygonsFromSegments(allSegments);
    myPolygons.forEach(polygon => {
        polygon.color = color(random(255),random(255),random(255));
    });
  }
}
