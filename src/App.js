import Box from './Box.js'
import './styles.css'
import Queue from './Queue'
import PriorityQueue from './PriorityQueue.js'

export default function App() {

  // keep track of weather or not it is running
  var running;

  // timing for visualizations
  var interval = undefined;

  // getting grid coords from cell element
  function getCoords(element) {
    var row = element.getAttribute('row')
    var col = element.getAttribute('col')
    row = parseInt(row)
    col = parseInt(col)
    return ([row, col])
  }

  // getting cell element from grid coords
  function getElement(coords) {
    var [row, col] = coords
    return (document.getElementById('row' + row + 'col' + col))
  }

  // clears the used squares before running, checks start and end, passed the function to call.
  function startAlgorithm(functionKeys) {
    if (running) {
      return
    }

    running = true
    var algorithmFunction = functionKeys[document.getElementById('algorithm').value]

    function blankElements(elements, name) {
      Array.from(elements).forEach(element => element.classList.remove(name))
    }
    try {
      var start = document.getElementsByClassName('start')[0]
      var end = document.getElementsByClassName('end')[0]
      start.classList = 'start'
      end.classList = 'end'
    }
    catch {
      return
    }
    blankElements(document.getElementsByClassName('closed'), 'closed')
    blankElements(document.getElementsByClassName('path'), 'path')
    blankElements(document.getElementsByClassName('open'), 'open')
    document.getElementById('goButton').style.color = 'grey'
    algorithmFunction(start, end)
  }

  // get the given neighbors of a cell.. this includes barriers and closed nodes so have to filter in the function
  function getNeighbors(element) {
    var [row, col] = getCoords(element)
    var elements = []
    elements.push(getElement([row + 1, col]))
    elements.push(getElement([row - 1, col]))
    elements.push(getElement([row, col + 1]))
    elements.push(getElement([row, col - 1]))
    elements = elements.filter((a) => a)

    return (elements)
  }

  // stop the interval from running when the algorithm is done
  function stopInterval() {
    clearInterval(interval)
    running = false
    document.getElementById('goButton').style.color = ''
  }

  // depth first search algorithm
  function depthFirstSearch(start, end) {

    var lifo = require('stack-lifo')
    var stack = new lifo()
    stack.push(start)

    var cameFrom = {}
    var closed = new Set()

    interval = setInterval(function () {

      var currentNode = stack.pop()

      while (closed.has(currentNode)) {
        currentNode = stack.pop()
        if (stack.isEmpty()) {
          stopInterval();
          return
        }
      }

      closed.add(currentNode)
      currentNode.classList.add('closed')

      var neighbors = getNeighbors(currentNode)
      for (let i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i]
        if (neighbor.classList.contains('closed') || neighbor.classList.contains('barrier')) {
          continue
        }
        cameFrom[getCoords(neighbor)] = currentNode
        stack.push(neighbor)
      }
      if (stack.isEmpty()) stopInterval();
      if (currentNode === end) {
        while (currentNode !== start) {
          cameFrom[getCoords(currentNode)].classList.add('path')
          cameFrom[getCoords(currentNode)].classList.remove('closed')
          currentNode = cameFrom[getCoords(currentNode)]
        }
        stopInterval()
        return
      }
    }, 10)
  }

  // breadth first search algorithm
  function breadthFirstSearch(start, end) {

    var nextQueue = new Queue()
    nextQueue.add(start)
    var nextQueueHash = new Set()

    var cameFrom = {}

    interval = setInterval(function () {

      if (nextQueue.isEmpty()) {
        stopInterval()
        return
      }

      var currentNode = nextQueue.dequeue()

      var neighbors = getNeighbors(currentNode)

      for (let i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i]
        if (neighbor.classList.contains('closed') || neighbor.classList.contains('barrier') || nextQueueHash.has(neighbor)) {
          continue
        }
        nextQueue.add(neighbor)
        nextQueueHash.add(neighbor)
        neighbor.classList.add('open')
        cameFrom[getCoords(neighbor)] = currentNode

        if (neighbor === end) {
          while (neighbor !== start) {
            cameFrom[getCoords(neighbor)].classList.add('path')
            cameFrom[getCoords(neighbor)].classList.remove('closed')
            cameFrom[getCoords(neighbor)].classList.remove('open')
            neighbor = cameFrom[getCoords(neighbor)]
          }
          stopInterval()
          return
        }
      }

      currentNode.classList.remove('open')
      currentNode.classList.add('closed')
    }, 10)
  }

  // astar search algorithm
  function astar(start, end) {

    // heuristic function
    function h(point1, point2) {
      var [row1, col1] = getCoords(point1)
      var [row2, col2] = getCoords(point2)
      return (Math.abs(row1 - row2) + Math.abs(col1 - col2))
    }

    var openSet = new PriorityQueue()
    openSet.put(0, 0, start)
    var openSetHash = new Set()
    openSetHash.add(start)

    var cameFrom = {}

    var gScore = {}
    var fScore = {}

    gScore[getCoords(start)] = 0
    fScore[getCoords(start)] = h(start, end)

    interval = setInterval(function () {

      if (openSet.isEmpty()) {
        stopInterval()
        return
      }
      
      var currentNode;
      var found = false;
      while (!found){
        currentNode = openSet.get()[2]
        found = openSetHash.delete(currentNode)
      }

      if (currentNode === end) {
        while (currentNode !== start) {
          cameFrom[getCoords(currentNode)].classList.add('path')
          cameFrom[getCoords(currentNode)].classList.remove('closed')
          cameFrom[getCoords(currentNode)].classList.remove('open')
          currentNode = cameFrom[getCoords(currentNode)]
        }
        stopInterval()
        return
      }

      var neighbors = getNeighbors(currentNode)
      for (let i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i]
        if (neighbor.classList.contains('barrier')) {
          continue
        }

        var tempGScore = gScore[getCoords(currentNode)] + 1
        var currGScore = gScore[getCoords(neighbor)]
        if (!currGScore) {
          currGScore = Infinity
        }

        if (tempGScore < currGScore) {
          cameFrom[getCoords(neighbor)] = currentNode

          gScore[getCoords(neighbor)] = tempGScore
          fScore[getCoords(neighbor)] = tempGScore + h(neighbor, end)

          openSet.put(fScore[getCoords(neighbor)], h(neighbor, end), neighbor)
          openSetHash.add(neighbor)
          neighbor.classList.add('open')
        }

      }

      currentNode.classList.remove('open')
      currentNode.classList.add('closed')
    }, 10)

  }

  // paint function takes a event and paints color onto the screen
  // click override is just saying it was a click event and not mouse movement, so it doesnt pass a button, we have to manually set it
  function paint(e, clickOverride = false) {

    if ((window.event.buttons !== 0 || clickOverride) && !running) {
      // big math to figure out which cell the mouse is over
      var col = Math.floor((e.clientX - ((window.innerWidth - document.getElementById('grid').offsetWidth) / 2)) / document.getElementsByClassName('row')[0].childNodes[0].offsetWidth)
      var row = Math.floor((e.clientY - 60) / boxSize)

      var element = document.getElementById('row' + row + 'col' + col)
      if (!element) {
        return
      }

      // check to see if start and end exist, and if not and left clicking place them
      if (document.getElementsByClassName('start').length === 0 && (window.event.buttons === 1 || clickOverride)) {
        document.getElementById('row' + row + 'col' + col).classList.add('start')
        return
      }
      if (document.getElementsByClassName('end').length === 0 && (window.event.buttons === 1 || clickOverride)) {
        var endNode = document.getElementById('row' + row + 'col' + col)
        if (endNode.classList.contains('start')) {
          return
        }
        endNode.classList.add('end')
        return
      }

      // paint the boxes when clicked, including the ones inbetween cuz it doesnt fire enough
      if (!lastClickedCoords) {
        var currentRow = row
        var currentCol = col
      }
      else {
        currentRow = lastClickedCoords[0]
        currentCol = lastClickedCoords[1]
      }

      do {
        if (row > currentRow) {
          currentRow += 1
        }
        else if (row < currentRow) {
          currentRow -= 1
        }
        if (col > currentCol) {
          currentCol += 1
        }
        else if (col < currentCol) {
          currentCol -= 1
        }

        if (window.event.buttons === 1) {
          var currBox = document.getElementById('row' + currentRow + 'col' + currentCol)
          if (!(currBox.classList.contains('start') || currBox.classList.contains('end'))) {
            currBox.classList.add('barrier')
          }
        }
        else if (window.event.buttons === 2) {
          document.getElementById('row' + currentRow + 'col' + currentCol).className = ''
        }
      } while (currentRow !== row || currentCol !== col);
      lastClickedCoords = [row, col]
    }
    else {
      lastClickedCoords = null
    }
  }

  // no context menu, reload button pops up on resize
  window.addEventListener('contextmenu', e => e.preventDefault())
  window.addEventListener('resize', e => document.getElementById('resizeAlert').style.display = 'block')

  // RENDERING

  // default cell size
  var boxSize = 20
  // used to trace the mouse, as the events don't trigger fast enough for me :/
  var lastClickedCoords = null

  var gridHeight = Math.floor((window.innerHeight - 60) / boxSize)
  var gridWidth = Math.floor((window.innerWidth) / boxSize)

  function getGrid() {
    var grid = []
    for (let row = 0; row < gridHeight; row++) {
      grid.push([])
      for (let col = 0; col < gridWidth; col++) {
        grid[row].push(<Box row={row} col={col} boxSize={boxSize} />)
      }
    }
    return (grid)
  }

  var functionKeys = {
    'depthFirstSearch': depthFirstSearch,
    'breadthFirstSearch': breadthFirstSearch,
    'aStar': astar
  }

  return (
    <div className="App" style={{ userSelect: 'none' }}>
      <div id='header'>
        <p onClick={() => startAlgorithm(functionKeys)} id='goButton'>Go</p>
        <select id="algorithm">
          <option value='aStar'>AStar</option>
          <option value='breadthFirstSearch'>Breadth First Search</option>
          <option value='depthFirstSearch'>Depth First Search</option>
        </select>
      </div>
      <div id='grid' onMouseMove={e => paint(e)} onMouseDown={e => paint(e, true)}>
        {getGrid().map((row, key) => {
          return (
            <div className='row' id={key}>
              {row.map((element) => {
                return (element)
              })}
            </div>
          )
        })}
      </div>
      <span id='resizeAlert' onClick={() => window.location.reload()}>Looks like you resized your window. <br /> Click here to reset the grid</span>
    </div>
  );
}