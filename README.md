#Polygons from Line Segments

This is a demonstration/test of a technique for taking a set of line segments and finding all of the polygons that the intersections generate. The drawing is done using p5.js.The summary of the algorithm is:

#The algorithm

- Find all intersections between line segments
- From the set of intersections, identify a nearest neighbor in each direction
- Generate a graph where each node is an intersection-point with a connection to that intersection-point's nearest neighbors
- Use a depth-first search to find the shortest paths from each node back to itself without backtracking. These paths should make up the minimal cycles in the graph which correspond to the polygons made by the line segments.

#Problems/Limitations

- We are treating each intersection-point as unique. If your system has more than two lines intersecting on the same point, part of this process might not work. If it doesn't, it shouldn't be too hard to allow for overlapping intersection points in the geometry layer but still treat them as separate nodes in the graph layer. I think this should be fine but I haven't thought hard about it.
- Our technique misses some polygons. This is explained in slightly-more-detail in a comment in graph.js (in the findMinimumCycles() function), along with some attempts to fix the problem and an untested idea.
