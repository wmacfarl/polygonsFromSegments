var currentWorkingSegment = {};
var allSegments = [];
var intersectionsToDraw = new Set();
var myGraph = {};
var myPolygons = [];

function setup() {
  var canvas = createCanvas(600, 600)
  canvas.parent('canvas-holder');
  myGraph = buildGraph(allSegments);
}

function drawIntersection(intersection){
    if (intersection.point.x){
        ellipse(intersection.point.x, intersection.point.y, 5, 5);
    }
}

function drawCurrentWorkingSegment(){
    if (currentWorkingSegment.point1 && !currentWorkingSegment.point2) {
        stroke(0);
        line(currentWorkingSegment.point1.x, currentWorkingSegment.point1.y, mouseX, mouseY);
      }    
}

function drawNodeLabels(){
    if (myGraph.nodes){
        for (let i = 0; i < myGraph.nodes.length; i++){
          text(i, myGraph.nodes[i].point.x, myGraph.nodes[i].point.y);
        }
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

    myGraph = buildGraph(allSegments, intersectionsToDraw);
    let allCycles = myGraph.findMinimumCycles();
    myPolygons = polygonsFromCycles(allCycles);
  }
}

function polygonsFromCycles(cycles){
  let polygons = [];
  cycles.forEach(cycle => {
    let points = cycle.map(node => 
        {
        return myGraph.nodes[node].point});
    points.color=color(random(255),random(255),random(255));
    polygons.push(points);
  });
  return polygons;
}

function findAllIntersectionsInSegments(segmentSet){
    let intersections = [];
    for (let i = 0; i < segmentSet.length; i++){
        for (let j = i+1; j < segmentSet.length; j++){
            intersection = Intersection.findIntersection(segmentSet[i], segmentSet[j]);
            if (intersection !== null){
                let alreadyInSet = false;
                for (let k = 0; k < intersections.length; k++){
                    if (Intersection.equals(intersections[k], intersection)){
                        alreadyInSet = true;
                    }
                }
                if (!alreadyInSet){
                    intersections.push(intersection);
                }
            }
        }
    }
    return intersections;
}

function buildGraph(segments) {
    let graph = new Graph(); 

    //First we find all of the intersections between all of the segments
    let intersections = findAllIntersectionsInSegments(segments);

    //Then we filter for the segments that have more than one intersection
    let connectedSegments = [];
    let connectedIntersections = [];
    segments.forEach(segment => {
        let intersectionsOnSegment = intersections.filter(
            intersection => intersection.line1 === segment || intersection.line2 === segment);

        if (intersectionsOnSegment.length > 1){
            intersectionsOnSegment.forEach(intersection => {
                if (!connectedIntersections.includes(intersection)){
                    connectedIntersections.push(intersection);
                }
            });
            connectedSegments.push(segment);
        }
    });

  connectedSegments.forEach(segment => {
    let intersectionsOnSegment = connectedIntersections.filter(intersection => intersection.line1 === segment || intersection.line2 === segment);

    //For each intersection on a line, find the nearest neighbor in each direction.  
    //TODO:  Investigate if this works/when it fails/if there is a better way.
    let nearestNeighborTrios = intersectionsOnSegment.map((intersection, index, intersections) => {
      let nearestNeighborPair = [null, null];
      let minimumDistancePair = [Infinity, Infinity];
      let possibleNeighbors = intersections.filter(possibleNeighborIntersection => (intersection != possibleNeighborIntersection));

      possibleNeighbors.forEach(possibleNeighbor => {
          let comparisonProperty = '';
          let distanceBetween = dist(intersection.point.x, intersection.point.y,
            possibleNeighbor.point.x, possibleNeighbor.point.y);

          if (possibleNeighbor.point.x !== intersection.point.x) {
            comparisonProperty = 'x';
          } else if (possibleNeighbor.point.y !== intersection.point.y) {
            comparisonProperty = 'y';
          } else {
            return null;
          }

          if (possibleNeighbor.point[comparisonProperty] < intersection.point[comparisonProperty]) {
            if (nearestNeighborPair[0] == null || distanceBetween < minimumDistancePair[0]) {
              nearestNeighborPair[0] = possibleNeighbor;
              minimumDistancePair[0]  = distanceBetween;
            }
          } else if (possibleNeighbor.point[comparisonProperty] > intersection.point[comparisonProperty]){
             if (nearestNeighborPair[1] == null || distanceBetween < minimumDistancePair[1]) {
                nearestNeighborPair[1] = possibleNeighbor;
            minimumDistancePair[1] = distanceBetween;
          }
        }

      });

      if (nearestNeighborPair[0] === null) {
        nearestNeighborPair[0] = intersection;
      }
      if (nearestNeighborPair[1] === null) {
        nearestNeighborPair[1] = intersection;
      }
   
      return [intersection, nearestNeighborPair[0], nearestNeighborPair[1]];
    });
    

    nearestNeighborTrios.forEach(trio => {
      nodes = [];
      trio.forEach(intersection => {
        let newNode = new Graph.Node(intersection.point);
        nodes.push(newNode);
        graph.addNode(newNode);
      });

      nodes.forEach(node => {
        graph.addNode(node);
      });

      graph.addConnection(nodes[0], nodes[1]);
      graph.addConnection(nodes[0], nodes[2]);
    });
    
  });
  graph.checkForDuplicateNodes();
  graph.checkForDuplicateConnections();
  return graph;
}