class Graph {
    constructor() {
      this.nodes = [];
      this.connections = [];
      this.adjacencyList = [];
    }   
    
    doDepthFirstSearch(){
      const nodes = Object.keys(this.adjacencyList);
      const visited ={};
      nodes.forEach(node => this.stepDepthFirstSearch(node, visited));
    }
    
    stepDepthFirstSearch(node, visited){
      if (!visited[node]){
        visited[node] = true;
        console.log(node, visited);
        const neighbors = this.adjacencyList[node];
        neighbors.forEach(neighbor => this.stepDepthFirstSearch(neighbor, visited));
      }
    }
      
    checkForDuplicateNodesAndConnections(){
      for (let i = 0; i < this.nodes.length; i++){
        for (let j = i +1; j < this.nodes.length; j++){
          if (this.nodes[i].equals(this.nodes[j])){
            console.log("DUPLICATE NODES, " + i + " and " + j);
          }
        }
      }
      for (let i = 0; i < this.connections.length; i++){
        for (let j = i +1; j < this.connections.length; j++){
          if (this.connections[i].equals(this.connections[j])){
            console.log("DUPLICATE CONNECTIONS, " + i + " and " + j);
          }
        }
      }
    }
    
    updateAdjacencyList(){
      let adjacencyList = [];
      for (let i = 0; i < this.nodes.length; i++){
        adjacencyList[i] = [];
        let node = this.nodes[i];
        node.id = i;
        let connectedNodes = this.getConnectedNodes(node);
        connectedNodes.forEach(node => {adjacencyList[i].push(this.nodes.indexOf(node))});
        
  //      console.log(i + ": " + adjacencyList[i]);
      }
      
      this.adjacencyList = adjacencyList;
    }
    
    getConnectedNodes(node){
      let myConnections = this.connections.filter(connection => (connection.node1 === node || connection.node2 === node));
      let connectedNodes = new Set();
      myConnections.forEach( connection => {connectedNodes.add(connection.node1).add(connection.node2);});
      connectedNodes.delete(node);
      return connectedNodes;
      
    }
    
    getConnectionsFromNode(node){
      return this.connections.filter(connection => (connection.node1 === node || connection.node2 ===   node));
    }
    
    getNeighboringNodes(node){
      let nodeConnections = this.getConnectionsFromNode(node);
      let neighboringNodes = [];
      nodeConnections.forEach (nodeConnection => {
        if (nodeConnection.node1 !== node){
          neighboringNodes.push(nodeConnection.node1);
        } else if (nodeConnection.node2 !== node) {
          neighboringNodes.push(nodeConnection.node2);
        }
      });
      return neighboringNodes;
    }
  
    isConnected(node1, node2) {
      return this.connections.some((connection) => {
        return ((connection.node1 === node1 && connection.node2 === node2) ||
          (connection.node2 === node1 && connection.node1 === node2))
      });
    }
  
  
    addConnection(node1, node2) {
      if (!node1 || !node2) {
        return false;
      }
      
      if (node1.equals(node2)){
        return false;
      }
  
      let node1Matches = this.nodes.filter(node => (Point.equals(node.point, node1.point)));
      let node2Matches = this.nodes.filter(node => (Point.equals(node.point, node2.point)));
      
      if (node1Matches.length > 1) {
        console.log("Too many maches for node 1.  length = " + node1Matches.length);
        return false;
      }
  
      if (node2Matches.length > 1) {
        console.log("Too many maches for node 1.  length = " + node2Matches.length);
        return false;
      }
      
      if (node1Matches.length === 0) {
        console.log("No matches for node 1, doing nothing");
        return;
      }
  
      if (node2Matches.length === 0) {
        console.log("No matches for node 2, doing nothing");
        return;
      }
  
      let newConnection = new Graph.Connection(node1Matches[0], node2Matches[0]);
  
      let duplicateConnections = this.connections.filter(connection =>  (connection.equals(newConnection)));
  
      if (duplicateConnections.length > 1) {
        console.log("TODO:  HANDLE THIS.  THIS SHOULD NOT BE HAPPENING");
      } else if (duplicateConnections.length === 1) {
        return;
      } else {
        this.connections.push(newConnection);
        this.updateAdjacencyList();
      }
    }
  
    addNode(newNode) {
      let duplicateNodes = this.nodes.filter(node => (Point.equals(newNode.point, node.point)));
  
      if (duplicateNodes.length > 1) {
        console.log("TODO:  HANDLE THIS.  THIS SHOULD NOT BE HAPPENING");
      }
  
      if (duplicateNodes.length === 0) {
        this.nodes.push(newNode);
      }
    }
  }
  
  Graph.Node = class {
    constructor(point, connections) {
      this.point = point;
    }  
    
    equals(node){
      return (Point.equals(node.point, this.point));
    }
  }
  
  Graph.Connection = class {
    constructor(node1, node2) {
      this.node1 = node1;
      this.node2 = node2;
    }
  
    equals(connection) {
      return ((this.node1.equals(connection.node1) && this.node2.equals(connection.node2)) ||
        (this.node2.equals(connection.node1) && this.node1.equals(connection.node2)));
    }
  }