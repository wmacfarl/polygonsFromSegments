class LineSegment {
    constructor(point1, point2) {
      this.point1 = point1;
      this.point2 = point2;
    }

    static equals(line1, line2){
        return (
            (Point.equals(line1.point1, line2.point1) && Point.equals(line1.point2, line2.point2)) ||
            (Point.equals(line1.point1, line2.point2) && Point.equals(line1.point2, line2.point1)));
    }
  }