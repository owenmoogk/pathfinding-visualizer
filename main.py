import pygame, random
from queue import PriorityQueue

# config var
WIDTH = 800

# display
screen = pygame.display.set_mode((WIDTH, WIDTH))
pygame.display.set_caption('Pathfinding Algorithms')

#colors
BLACK = (0,0,0)
GREEN = (0,255,0)
RED = (255,0,0)
WHITE = (255,255,255)
PURPLE = (153,50,204)
ORANGE = (255,165,0)
TEAL = (0,255,255)
GREY = (100,100,100)

# fonts
pygame.font.init()
font = pygame.font.SysFont("comicsans", 50)

# settings
gridSize = 16
gridDimensions = WIDTH // gridSize

class Spot:
    def __init__(self, row, col):
        self.row = row
        self.col = col
        self.x = row * gridSize
        self.y = col * gridSize
        self.color = WHITE
        self.neighbors = []
    
    def getPosition(self):
        return(self.row, self.col)

    def isClosed(self):
        return(self.color == RED)

    def isOpen(self):
        return(self.color == GREEN)

    def isBarrier(self):
        return(self.color == BLACK)

    def isStart(self):
        return(self.color == ORANGE)
    
    def isEnd(self):
        return(self.color == TEAL)

    def isPath(self):
        return(self.color == PURPLE)

    def reset(self):
        self.color = WHITE

    def makeClosed(self):
        self.color = RED

    def makeOpen(self):
        self.color = GREEN

    def makeBarrier(self):
        self.color = BLACK

    def makeStart(self):
        self.color = ORANGE

    def makeEnd(self):
        self.color = TEAL

    def makePath(self):
        self.color = PURPLE

    def draw(self):
        pygame.draw.rect(screen, self.color, (self.x, self.y, gridSize, gridSize))

    def updateNeighbors(self, grid):
        self.neighbors = []

        # going down
        if self.row < gridDimensions - 1 and not grid[self.row+1][self.col].isBarrier():
            self.neighbors.append(grid[self.row + 1][self.col])
        # going up
        if self.row > 0 and not grid[self.row-1][self.col].isBarrier():
            self.neighbors.append(grid[self.row-1][self.col])
        # going right
        if self.col < gridDimensions - 1 and not grid[self.row][self.col+1].isBarrier():
            self.neighbors.append(grid[self.row][self.col+1])
        # going left
        if self.col > 0 and not grid[self.row][self.col-1].isBarrier():
            self.neighbors.append(grid[self.row][self.col-1])

    def __lt__(self, other):
        return(False)

def reconstructPath(cameFrom, current, draw, start, end):
    # goes thru the found path and draws it all
    while current in cameFrom:
        current.makePath()
        if current == start:
            current.makeStart()
        elif current == end:
            current.makeEnd()
        current = cameFrom[current]
        start.makeStart()
        draw()

def dijkstras(draw, grid, start, end):

    closedNodes = []
    nextQueue = [(start)]
    tempQueue = []
    cameFrom = {}

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()

        if len(nextQueue) == 0:
            return False

        for currNode in nextQueue:
            for neighbor in currNode.neighbors:
                if neighbor in closedNodes or neighbor in nextQueue or neighbor in tempQueue:
                    continue
                tempQueue.append(neighbor)
                neighbor.makeOpen()
                cameFrom[neighbor] = currNode
                if neighbor == end:
                    reconstructPath(cameFrom, end, draw, start, end)
                    return True
            if currNode != start:
                currNode.makeClosed()
            closedNodes.append(currNode)
            draw()
        nextQueue = tempQueue
        tempQueue = []

def bestFirstSearch(draw, grid, start, end):

    def getLowestHeuristic(hGrid):
        lowestH = float("inf")
        coords = []
        for rowIndex, row in enumerate(hGrid):
            for itemIndex, item in enumerate(row):
                if item < lowestH:
                    lowestH = item
                    coords = [[rowIndex, itemIndex]]
                elif item == lowestH:
                    coords.append([rowIndex, itemIndex])
            
        # only returns the first one, the others might be used earlier
        return(coords[0])

    def distance(spot1, spot2):
        x1 = spot1.x
        y1 = spot1.y
        x2 = spot2.x
        y2 = spot2.y
        return(abs(x1 - x2) + abs(y1 - y2))

    heuristicGrid = [[float("inf") for i in range(gridDimensions)] for j in range(gridDimensions)]
    heuristicGrid[start.row][start.col] = distance(start, end)
    cameFrom = {}

    # main algorithm loop
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()

        # getting the lowest heuristic from my grid that is open
        lowestCoords = getLowestHeuristic(heuristicGrid)

        # getting the current spot object from the grid
        currSpot = grid[lowestCoords[0]][lowestCoords[1]]

        # loops thru the neighbors of the current spot
        for neighbor in currSpot.neighbors:
            if neighbor.isClosed():
                continue
            heuristicGrid[neighbor.row][neighbor.col] = distance(neighbor, end)
            neighbor.makeOpen()
            cameFrom[neighbor] = currSpot
            if neighbor == end:
                reconstructPath(cameFrom, end, draw, start, end)
                return True
        heuristicGrid[lowestCoords[0]][lowestCoords[1]] = float("inf")
        currSpot.makeClosed()

        draw()

    return False

def astar(draw, grid, start, end):

    # Heuristic Function
    # NOTE: Must be smaller than or equal to the actual value, otherwise we will not find the shortest path.
    def h(p1, p2):
        x1, y1 = p1
        x2, y2 = p2
        return(abs(x1 - x2) + abs(y1 - y2))

    # priority queue just gets the minimum element from the list
    openSet = PriorityQueue()
    openSet.put((0, 0, start))
    
    # used to backtrack at the end
    cameFrom = {}

    # gScore is the cost so far to reach the node
    gScore = {spot: float("inf") for row in grid for spot in row}
    gScore[start] = 0
    
    # fScore is the estimated cost to reach the final node
    fScore = {spot: float("inf") for row in grid for spot in row}
    fScore[start] = h(start.getPosition(), end.getPosition())

    # is a hash of all the nodes in the openset
    openSetHash = {start}

    # main algorithm loop
    while not openSet.empty():

        # pygame quit
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()

        # the tiebreaker for the pq is how close it is to the end node. the closer the higher priority.
        # but, when we look at a node that is already open but we have found a better path to it, it is already in the pq.
        # since we cannot update the pq, we have to add a new element with the updated information.
        # this can become an issue as there are now multiple elements in the pq referencing the same node.
        # to combat this, when we remove the 'best' one, we will also remove it from the open set hash.
        # the opensethash variable will keep track of the open nodes, and once we have closed it it will be removed.
        # if we get the 'best' node from the pq, but it is not in the opensethash, we have already looked it with a better configuration
        # so, we just skip.
        # PS -- i will admit this is 10% me being stupid, but 90% the PQ module being limited. I could use the heapq module, but...

        # getting current node, removing from openset
        current = openSet.get()[2]
        try:
            openSetHash.remove(current)
        except:
            continue
        
        # if completed
        if current == end:
            reconstructPath(cameFrom, end, draw, start, end)
            return True

        # loop through the current nodes neighbors
        for neighbor in current.neighbors:

            # length it took to reach this node
            tempGScore = gScore[current] + 1

            # if this is the fastest way to reach this node:
            if tempGScore < gScore[neighbor]:

                # update the backtracking
                cameFrom[neighbor] = current

                # update the scores
                gScore[neighbor] = tempGScore
                fScore[neighbor] = tempGScore + h(neighbor.getPosition(), end.getPosition())

                # update the priority queues
                openSet.put((fScore[neighbor], h(neighbor.getPosition(), end.getPosition()), neighbor))
                openSetHash.add(neighbor)  # note that if it is already here it WILL NOT duplicate *uwu*
                neighbor.makeOpen()

        # finally close off this node
        if current != start:
            current.makeClosed()

        draw()

    return False

def makeGrid():
    grid = []
    for i in range(gridDimensions):
        grid.append([])
        for j in range(gridDimensions):
            grid[i].append(Spot(i, j))
    return(grid)

def drawGrid(screen, grid):
    for i in range(gridDimensions):
        pygame.draw.line(screen, GREY, (0, i * gridSize), (WIDTH, i * gridSize))
    for j in range(gridDimensions):
        pygame.draw.line(screen, GREY, (j * gridSize, 0), (j * gridSize, WIDTH))

def draw(screen, grid):
    screen.fill(WHITE)
    for row in grid:
        for spot in row:
            spot.draw()
    drawGrid(screen, grid)
    pygame.display.update()

def getClickedPosition(position):
    y, x = position
    row = y // gridSize
    col = x // gridSize
    return(row, col)

def main(screen):
    grid = makeGrid()
    start = None
    end = None

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()

            # left mouse
            if pygame.mouse.get_pressed()[0]:
                clickPosition = pygame.mouse.get_pos()
                row, col = getClickedPosition(clickPosition)
                spot = grid[row][col]
                if not start and end != spot:
                    start = spot
                    start.makeStart()
                elif not end and start != spot:
                    end = spot
                    end.makeEnd()
                elif spot != end and spot != start:
                    spot.makeBarrier()


            # right mouse
            elif pygame.mouse.get_pressed()[2]:
                clickPosition = pygame.mouse.get_pos()
                row, col = getClickedPosition(clickPosition)
                spot = grid[row][col]
                spot.reset()
                if spot == start:
                    start = None
                elif spot == end:
                    end = None

            if event.type == pygame.KEYDOWN:

                # clear the screen
                if event.key == pygame.K_c:
                    start = None
                    end = None
                    grid = makeGrid()

                # if it is a command to run an algorithm
                elif start and end:
                    # getting neighbors of elements
                    if event.key == pygame.K_a or event.key == pygame.K_d or event.key == pygame.K_g or event.key == pygame.K_b:
                        for row in grid:
                            for spot in row:
                                spot.updateNeighbors(grid)
                                if spot.isOpen():
                                    spot.reset()
                                elif spot.isClosed():
                                    spot.reset()
                                elif spot.isPath():
                                    spot.reset()

                    if event.key == pygame.K_a:
                        astar(lambda: draw(screen, grid), grid, start, end)
                    elif event.key == pygame.K_d:
                        dijkstras(lambda: draw(screen, grid), grid, start, end)
                    elif event.key == pygame.K_g:
                        greedyBestFirstSearch(lambda: draw(screen, grid), grid, start, end)


        draw(screen, grid)

if __name__ == "__main__":
    main(screen)