# pathfinding-visualizer
A python application built using pygame to visualize pathfinding algorithms.

**Algorithms**:
- Weighted
  - A: AStar
  - D: Dijkstras
  - G: Best First Search
- Unweighted
  - S: Greedy Best First (Snake)
  - B: Breadth First Search
  - P: Depth First Search

**Controls**:
- C: Clear board
- LeftClick: Place(start, end, barrier)
- RightClick: Remove
- Middle Click: Add weight(sometimes may be cleared if the algorithm doesn't support it, such as Breadth First Search)
- Space: Go
