import PriorityQueue from 'js-priority-queue'
import Box from './Box.js'
import './styles.css'
import Queue from './Queue'

export default function App() {

  function getCoords(element) {
    var row = element.getAttribute('row')
    var col = element.getAttribute('col')
    row = parseInt(row)
    col = parseInt(col)
    return ([row, col])
  }

  function getElement(coords) {
    var [row, col] = coords
    return (document.getElementById('row' + row + 'col' + col))
  }

  function startAlgorithm(algorithm) {

    function blankElements(elements, name) {
      Array.from(elements).forEach(element => {
        if (!(element.classList.contains('start') || element.classList.contains('end'))) {
          element.classList.remove(name)
        }
      })
    }
    document.getElementsByClassName('start')[0].classList = 'start'
    document.getElementsByClassName('end')[0].classList = 'end'
    blankElements(document.getElementsByClassName('closed'), 'closed')
    blankElements(document.getElementsByClassName('path'), 'path')
    blankElements(document.getElementsByClassName('open'), 'open')
    algorithm()
  }

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

  function depthFirstSearch() {

    var start = document.getElementsByClassName('start')[0]
    var end = document.getElementsByClassName('end')[0]

    var lifo = require('stack-lifo')
    var stack = new lifo()
    stack.push(start)

    var cameFrom = {}
    var closed = new Set()

    var intr = setInterval(function () {

      var currentNode = stack.pop()

      while (closed.has(currentNode)) {
        currentNode = stack.pop()
        if (stack.isEmpty()) {
          clearInterval(intr);
          return
        }
      }

      closed.add(currentNode)
      currentNode.classList.add('closed')

      var neighbors = getNeighbors(currentNode)
      console.log(neighbors)
      for (let i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i]
        if (neighbor.classList.contains('closed') || neighbor.classList.contains('barrier')) {
          continue
        }
        cameFrom[getCoords(neighbor)] = currentNode
        stack.push(neighbor)
      }
      if (stack.isEmpty()) clearInterval(intr);
      if (currentNode === end) {
        while (currentNode !== start) {
          cameFrom[getCoords(currentNode)].classList.add('path')
          cameFrom[getCoords(currentNode)].classList.remove('closed')
          currentNode = cameFrom[getCoords(currentNode)]
        }
        clearInterval(intr)
        return
      }
    }, 10)

  }

  // var queue = new PriorityQueue()
  // queue.queue('owen')
  // console.log(queue.length)
  // console.log(queue.peek())
  // console.log(queue.dequeue())
  // console.log(queue.peek())

  // var q = new Queue()
  // for (let i = 1; i <= 7; i++) {
  //   q.add(i);
  // }
  // // dequeue all elements
  // while (!q.isEmpty()) {
  //   console.log(q.dequeue());
  // }

  var boxSize = 20
  var lastClickedCoords = null

  // click override is basically just saying it was a click event and not mouse movement, so it doesnt pass a button, we have to manually set it
  function paint(e, clickOverride = false) {

    var col = Math.floor(e.clientX / boxSize)
    var row = Math.floor(e.clientY / boxSize)

    if (window.event.buttons !== 0 || clickOverride) {

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
          if (!currBox) {
            return
          }
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

  // right clicking does not pull up context menu
  window.addEventListener('contextmenu', e => e.preventDefault())

  // when the mouse moves, check if any buttons are pressed, if so react
  window.addEventListener('mousemove', (e) => paint(e))
  window.addEventListener('mousedown', (e) => paint(e, true))

  var width = window.innerWidth / boxSize
  var height = window.innerHeight / boxSize

  var grid = []
  for (let row = 0; row < height; row++) {
    grid.push([])
    for (let col = 0; col < width; col++) {
      grid[row].push(<Box row={row} col={col} boxSize={boxSize} />)
    }
  }

  return (
    <div className="App" style={{ userSelect: 'none' }}>
      <div id='grid'>
        {grid.map((row, key) => {
          return (
            <div className='row' id={key}>
              {row.map((element) => {
                return (element)
              })}
            </div>
          )
        })}
      </div>

      <button style={{ position: 'absolute', bottom: "10px", right: '10px' }} onClick={() => startAlgorithm(depthFirstSearch)}>
        go go power rangers
      </button>
    </div>
  );
}