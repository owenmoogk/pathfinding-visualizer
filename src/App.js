import Box from './Box.js'
import './styles.css'


export default function App() {

  var boxSize = 20
  var lastClickedCoords = null

  // click override is basically just saying it was a click event and not mouse movement, so it doesnt pass a button, we have to manually set it
  function paint(e, clickOverride=false) {

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
          if (!(currBox.classList.contains('start') || currBox.classList.contains('end'))){
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
    </div>
  );
}