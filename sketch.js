var currentWorkingSegment = {};
var allSegments = new Set();
var intersections = new Set();
var myGraph = {};
var myPolygons = [];












function wiggleSegments(){
  allSegments.forEach (segment => {
    segment.point1.x+=random(-.01, .01);
    segment.point1.y+=random(-.01, .01);
    segment.point2.x+=random(-.01, .01);
    segment.point2.y+=random(-.01, .01);});
}

function setup() {
  createCanvas(400, 400);

  addSegment(new LineSegment(new Point(45, 50),new Point(355, 50)));
  addSegment(new LineSegment(new Point(45, 350),new Point(355, 350)));
  addSegment(new LineSegment(new Point(50, 45),new Point(50, 355)));
  addSegment(new LineSegment(new Point(350, 45),new Point(350, 355)));
  //wiggleSegments();
  myGraph = buildGraph(allSegments, intersections);
}

function draw() {
  background(220);
  allSegments.forEach(segment => drawSegment(segment));

  stroke(0, 255, 0);
  intersections.forEach(intersection => ellipse(intersection.point.x, intersection.point.y, 5, 5));

  if (currentWorkingSegment.point1 && !currentWorkingSegment.point2) {
    stroke(0);
    line(currentWorkingSegment.point1.x, currentWorkingSegment.point1.y, mouseX, mouseY);
  }
  
  if (myGraph.nodes){
    for (let i = 0; i < myGraph.nodes.length; i++){
      text(i, myGraph.nodes[i].point.x, myGraph.nodes[i].point.y);
      
    }
  }
  
  myPolygons.forEach(polygon => {
    for (let i = 1; i < polygon.length; i++){
      stroke(random(255), random(255), random(255));
      console.log(polygon[i-1].x);
      line(polygon[i-1].x, polygon[i-1].y, polygon[i].x, polygon[i].y);
    }
  });
  

  
}

function findPath(graph, nodeIndex1, nodeIndex2) {
  if (nodeIndex1 != nodeIndex2) {
    
    let path = [];
    let previousNode = graph.nodes[nodeIndex1];
    let currentNode = graph.nodes[nodeIndex1];
    let targetNode  = graph.nodes[nodeIndex2];
    let count = 0;
    
    stroke(255, 0, 0);
    if (graph.isConnected(graph.nodes[nodeIndex1], graph.nodes[nodeIndex2])) {
      stroke(0, 0, 255);
    }
    line(graph.nodes[nodeIndex1].point.x, graph.nodes[nodeIndex1].point.y,
      graph.nodes[nodeIndex2].point.x, graph.nodes[nodeIndex2].point.y);
  
    let distancesToNodes = {};
  
    graph.nodes.forEach(node => {
    if (node !== startNode) {
      times[node] = Infinity
    }  
  });
    
    
    
    while (graph.isConnected(currentNode, targetNode) === false && count < 100){
      count++;
//      console.log(count);
      let nextNode = graph.getNeighboringNodes(currentNode)[0];
   
      if (currentNode === nextNode){
        console.log("BAD");
      }

      previousNode = currentNode;
      currentNode = nextNode;
      strokeWeight(3);
      stroke(0,255,0);
      line(previousNode.point.x, previousNode.point.y, currentNode.point.x, currentNode.point.y);
    }
  }
    
}

function drawSegment(segment) {
  stroke(0);
  strokeWeight(1);
  line(segment.point1.x, segment.point1.y, segment.point2.x, segment.point2.y);
}

function addSegment(segment) {
  allSegments.add(segment);
  findNewIntersections(segment, allSegments);
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
    addSegment(currentWorkingSegment);
    currentWorkingSegment = {};
    myGraph = buildGraph(allSegments, intersections);
    let allCycles = findAllCycles(myGraph.adjacencyList);
    myPolygons = polygonsFromCycles(allCycles);
  }
}

function polygonsFromCycles(cycles){
  let polygons = [];
  cycles.forEach(cycle => {
    let points = cycle.map(node => {return myGraph.nodes[node].point});
    polygons.push(points);
  });
  return polygons;
}

function findNewIntersections(newSegment, existingSegmentSet) {
  existingSegmentSet.forEach(oldSegment => {
    let intersectionPoint = findIntersection(newSegment, oldSegment);
    if (intersectionPoint) {
      let intersection = new Intersection(newSegment, oldSegment, intersectionPoint);
      intersections.add(intersection);
    }
  });
}

function keyPressed() {
  console.log("here");  
}

function findIntersection(line1, line2) {
  let denominator, a, b, numerator1, numerator2;
  let result = {};

  //https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection

  denominator = ((line2.point2.y - line2.point1.y) * (line1.point2.x - line1.point1.x)) - ((line2.point2.x - line2.point1.x) * (line1.point2.y - line1.point1.y));

  if (denominator == 0) {
    return null;
  }

  a = line1.point1.y - line2.point1.y;
  b = line1.point1.x - line2.point1.x;

  numerator1 = ((line2.point2.x - line2.point1.x) * a) - ((line2.point2.y - line2.point1.y) * b);
  numerator2 = ((line1.point2.x - line1.point1.x) * a) - ((line1.point2.y - line1.point1.y) * b);

  a = numerator1 / denominator;
  b = numerator2 / denominator;

  // if we cast these lines infinitely in both directions, they intersect here:
  result.x = line1.point1.x + (a * (line1.point2.x - line1.point1.x));
  result.y = line1.point1.y + (a * (line1.point2.y - line1.point1.y));

  // if line1 is a segment and line2 is infinite, they intersect if:
  if (a > 0 && a < 1 && b > 0 && b < 1) {
    return result;
  } else {
    return null;
  }
}

function buildGraph(segmentSet, intersectionSet) {
  let graph = new Graph();

  //Before we build the graph, throw away any lines that only have 1 intersection
  segmentSet.forEach(segment => {
    let intersectionsOnSegment = Array.from(intersectionSet).filter(intersection => intersection.line1 === segment || intersection.line2 === segment);
    if (intersectionsOnSegment.length <= 1){
      segmentSet.delete(segment);
      intersectionSet.forEach(intersection => {
        if (intersection.line1 === segment || intersection.line2 === segment){
          intersectionSet.delete(intersection);
        }
      });
    }
  });
  
  //For each line, find all intersections on that line
  segmentSet.forEach(segment => {
    let intersectionsOnSegment = Array.from(intersectionSet).filter(intersection => intersection.line1 === segment || intersection.line2 === segment);

    if (intersectionsOnSegment.length > 1){
    //For each intersection on a line, find the nearest neighbor
    let nearestNeighborTrios = intersectionsOnSegment.map((intersection, index, allIntersections) => {
      let nearestNeighbor1 = null;
      let nearestNeighbor2 = null;
      let minimumDistance1 = null;
      let minimumDistance2 = null;
      let possibleNeighbors = allIntersections;

      possibleNeighbors.forEach(possibleNeighbor => {
        if (possibleNeighbor !== intersection) {
          
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
            if (nearestNeighbor1 == null || distanceBetween < minimumDistance1) {
              nearestNeighbor1 = possibleNeighbor;
              minimumDistance1 = distanceBetween;
            }
          } else if (possibleNeighbor.point[comparisonProperty] > intersection.point[comparisonProperty]){
             if (nearestNeighbor2 == null || distanceBetween < minimumDistance2) {
            nearestNeighbor2 = possibleNeighbor;
            minimumDistance2 = distanceBetween;
          }
          }
        }

      });

      if (nearestNeighbor1 === null) {
        nearestNeighbor1 = intersection;
      }
      if (nearestNeighbor2 === null) {
        nearestNeighbor2 = intersection;
      }
      
      let slope1 = slopeBetween(intersection.point, nearestNeighbor1.point);
      let slope2 = slopeBetween(intersection.point, nearestNeighbor2.point);
   
      return [intersection, nearestNeighbor1, nearestNeighbor2];
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
    }
  });
  graph.checkForDuplicateNodesAndConnections();
  return graph;
}

function slopeBetween(point1, point2){
  let rise = point1.y - point2.y;
  let run = point1.x - point2.x;
  if (run === 0){
      return Infinity;
  }
  return (rise/run);
}

function findCycles(adjacencyList, source) {  
  var neighbors = adjacencyList[source];
  paths = [];
  for (let i = 0; i < neighbors.length; i++){
    path = [source];
    let startingNeighbor = neighbors[i];
    let tmpAdjacencyList = {...adjacencyList};
    tmpAdjacencyList[startingNeighbor] = tmpAdjacencyList[startingNeighbor].filter(node => (node !== source));
    path = path.concat(shortestPath(tmpAdjacencyList, startingNeighbor, source));
    paths.push(path);
  }
  return paths;
}

function findAllCycles(adjacencyList){
  let cycles = [];
  for (let i = 0; i < adjacencyList.length; i++){
    paths = findCycles(adjacencyList, i);
    cycles = cycles.concat(paths);
  }
  
  cycles = removeDuplicateCycles(cycles);
  return cycles;
}

function containsSameElements(array1, array2){
  if (array1.length !== array2.length){
    return false;
  }else {
    for (let i = 0; i < array1.length; i++){
      if (array2.includes(array1[i]) === false){
        return false;
      }
    }
  }
  return true;
}

function removeDuplicateCycles(cycleList){
  cyclesToRemove = [];
  let uniqueCycles = [];
  console.log("cycleList: ");
  console.log(cycleList);
  for (let i = 0; i < cycleList.length; i++){
    if (uniqueCycles.filter(cycle => containsSameElements(cycle, cycleList[i])).length === 0){
          uniqueCycles.push(cycleList[i]);
    }
  }
  console.log("uniqueCycles:");
  return uniqueCycles;
}

function shortestPath(adjacencyList, source, target) {
  if (source == target) {   // Delete these four lines if
    print(source);          // you want to look for a cycle
    return;                 // when the source is equal to
  }                         // the target.
  var queue = [ source ],
      visited = { source: true },
      predecessor = {},
      tail = 0;
  while (tail < queue.length) {
    var u = queue[tail++],  // Pop a vertex off the queue.
        neighbors = adjacencyList[u];
    for (var i = 0; i < neighbors.length; ++i) {
      var v = neighbors[i];
      if (visited[v]) {
        continue;
      }
      visited[v] = true;
      if (v === target) {   // Check if the path is complete.
        var path = [ v ];   // If so, backtrack through the path.
        while (u !== source) {
          path.push(u);
          u = predecessor[u];          
        }
        path.push(u);
        path.reverse();
      //  console.log(path);
        return path;
      }
      predecessor[v] = u;
      queue.push(v);
    }
  }
  print('there is no path from ' + source + ' to ' + target);
}