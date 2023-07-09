import Box from './Box.js'
import './styles.css'
import Queue from './Queue'
import PriorityQueue from './PriorityQueue.js'
import { useState } from 'react'

export default function App() {

  const [startSet, setStartSet] = useState(false)
  const [endSet, setEndSet] =  useState(false)

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
      stopInterval()
      return
    }
    var goButton = document.getElementById('goButton')
    goButton.innerHTML = "Stop"
    goButton.style.color = 'Red'

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
    var goButton = document.getElementById('goButton')
    goButton.innerHTML = "Go"
    goButton.style.color = ''
  }

  function reconstructPath(start, currentNode, cameFrom) {
    while (currentNode !== start) {
      cameFrom[getCoords(currentNode)].classList.add('path')
      cameFrom[getCoords(currentNode)].classList.remove('closed')
      cameFrom[getCoords(currentNode)].classList.remove('open')
      currentNode = cameFrom[getCoords(currentNode)]
    }
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
        reconstructPath(start, currentNode, cameFrom)
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
          reconstructPath(start, neighbor, cameFrom)
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

      
      var currentNode;
      var found = false;
      while (!found) {
        if (openSet.isEmpty()) {
          stopInterval()
          return
        }
        currentNode = openSet.get()[2]
        found = openSetHash.delete(currentNode)
      }

      if (currentNode === end) {
        reconstructPath(start, currentNode, cameFrom)
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
        var currGScore = gScore[getCoords(neighbor)] || Infinity

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

  // dijkstras search algorithm
  function dijkstras(start, end) {

    var distances = {}
    var cameFrom = {}

    function getDistance(point1, point2) {
      var [row1, col1] = getCoords(point1)
      var [row2, col2] = getCoords(point2)
      return (Math.abs(row1 - row2) + Math.abs(col1 - col2))
    }

    var priority = new PriorityQueue()
    priority.put(0, 0, start)

    interval = setInterval(function () {

      if (priority.isEmpty()) {
        stopInterval()
        return
      }

      var [distance, _, currentNode] = priority.get()

      if (currentNode === end) {
        reconstructPath(start, currentNode, cameFrom)
        stopInterval()
        return
      }

      var neighbors = getNeighbors(currentNode)

      for (let i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i]
        if (!(neighbor.classList.contains('closed') || neighbor.classList.contains('barrier'))) {
          neighbor.classList.add('open')

          var oldCost = distances[getCoords(neighbor)] || Infinity
          var newCost = distance + 1

          if (newCost < oldCost) {
            priority.put(newCost, getDistance(neighbor, end), neighbor)
            distances[getCoords(neighbor)] = newCost
            cameFrom[getCoords(neighbor)] = currentNode
          }
        }
      }

      currentNode.classList.remove('open')
      currentNode.classList.add('closed')
    }, 10)
  }

  // greedy best first search algorithm
  function greedyBestFirstSearch(start, end) {

    function getLowestHeuristic(heuristics) {
      var lowestH = Infinity
      var coords = []
      for (const [key, value] of Object.entries(heuristics)) {
        if (value < lowestH) {
          lowestH = value
          coords = key
        }
      }
      if (lowestH === Infinity) {
        return (null)
      }
      coords = coords.split(',')
      for (var i = 0; i < 2; i++) {
        coords[i] = parseInt(coords[i])
      }
      return (getElement(coords))
    }

    function distance(point1, point2) {
      var [row1, col1] = getCoords(point1)
      var [row2, col2] = getCoords(point2)
      return (Math.abs(row1 - row2) + Math.abs(col1 - col2))
    }

    var heuristics = {}
    heuristics[getCoords(start)] = distance(start, end)

    var cameFrom = {}

    interval = setInterval(function () {

      var currentNode = getLowestHeuristic(heuristics)

      if (!currentNode) {
        stopInterval();
        return
      }

      var neighbors = getNeighbors(currentNode)
      for (let i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i]
        if (neighbor.classList.contains('barrier') || neighbor.classList.contains('closed')) {
          continue
        }

        heuristics[getCoords(neighbor)] = distance(neighbor, end)
        neighbor.classList.add('open')
        cameFrom[getCoords(neighbor)] = currentNode

        if (neighbor === end) {
          reconstructPath(start, neighbor, cameFrom)
          stopInterval()
          return
        }

      }

      heuristics[getCoords(currentNode)] = Infinity

      currentNode.classList.remove('open')
      currentNode.classList.add('closed')
    }, 10)

  }

  // astar search algorithm
  function snake(start, end) {

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
    var count = 0

    interval = setInterval(function () {

      count += 1

      var currentNode;
      var found = false;
      while (!found) {
        if (openSet.isEmpty()) {
          stopInterval()
          return
        }
        currentNode = openSet.get()[2]
        found = openSetHash.delete(currentNode)
      }

      var neighbors = getNeighbors(currentNode)
      for (let i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i]
        if (neighbor.classList.contains('barrier') || neighbor.classList.contains('closed')) {
          continue
        }

        cameFrom[getCoords(neighbor)] = currentNode
        
        if (neighbor === end) {
          reconstructPath(start, neighbor, cameFrom)
          stopInterval()
          return
        }

        openSet.put(-count, h(neighbor, end), neighbor)
        openSetHash.add(neighbor)

      }

      currentNode.classList.remove('open')
      currentNode.classList.add('closed')
    }, 10)

  }

  function algorithmChange(e) {
    var algo = e.target.value
    document.getElementById('infoAboutAlgo').innerHTML = writeUps[algo]
  }

  // no context menu, reload button pops up on resize
  window.addEventListener('contextmenu', e => e.preventDefault())
  window.addEventListener('resize', e => document.getElementById('resizeAlert').style.display = 'block')

  // RENDERING

  // default cell size
  var boxSize = 20

  var gridHeight = Math.floor((window.innerHeight - 90) / boxSize)
  var gridWidth = Math.floor((window.innerWidth) / boxSize)

  function getGrid() {
    var grid = []
    for (let row = 0; row < gridHeight; row++) {
      grid.push([])
      for (let col = 0; col < gridWidth; col++) {
        grid[row].push(<Box row={row} col={col} boxSize={boxSize} startSet={startSet} endSet={endSet} setStartSet={setStartSet} setEndSet={setEndSet}/>)
      }
    }
    return (grid)
  }

  var functionKeys = {
    'depthFirstSearch': depthFirstSearch,
    'breadthFirstSearch': breadthFirstSearch,
    'aStar': astar,
    'dijkstras': dijkstras,
    "greedy": greedyBestFirstSearch,
    "snake": snake
  }

  var writeUps = {
    'depthFirstSearch': "Depth First Search is <b>Not Weighted</b> and <b>Does Not Guarantee</b> the shortest path",
    'breadthFirstSearch': 'Breadth First Search is <b>Not Weighted</b> and <b>Guarantees</b> the shortest path',
    'aStar': 'AStar is <b>Weighted</b> and <b>Guarantees</b> the shortest path',
    'dijkstras': "Dijkstras is <b>Weighted</b> and <b>Guarantees</b> the shortest path",
    "greedy": "Greedy Best First Search is <b>Weighted</b> and <b>Does Not Guarantee</b> the shortest path",
    "snake": "Snake is <b>Weighted</b> and <b>Does Not Guarantee</b> the shortest path"
  }

  return (
    <div className="App" style={{ userSelect: 'none' }}>
      <div id='header'>
        <p onClick={() => startAlgorithm(functionKeys)} id='goButton'>Go</p>
        <select id="algorithm" onChange={(e) => algorithmChange(e)}>
          <option value='aStar'>AStar</option>
          <option value='greedy'>Greedy Best First Search</option>
          <option value='dijkstras'>Dijkstras</option>
          <option value='breadthFirstSearch'>Breadth First Search</option>
          <option value='depthFirstSearch'>Depth First Search</option>
          <option value='snake'>Snake</option>
        </select>
      </div>
      <div id='infoBar'>
        <p id='infoAboutAlgo'>AStar is <b>Weighted</b> and <b>Guarantees</b> the shortest path</p>
      </div>
      <div id='grid'>
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
      <p id='myName'><a href='https://owenmoogk.github.io' target='_blank' rel='noreferrer'>Owen Moogk</a></p>
      <p id='infoButton'><a href='https://owenmoogk.github.io/projects/pathfinding-visualizer' target='_blank' rel='noreferrer'>About This Project</a></p>
    </div>
  );
}