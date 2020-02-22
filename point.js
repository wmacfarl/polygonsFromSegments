class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  
     equals(point) {
      return (this.x === point.x && this.y === point.y);
    }
    
    static equals(point1, point2){
      return (point1.x === point2.x && point1.y === point2.y);
    }
  }