import { useState } from 'react'
import Box from './Box.js'
import './styles.css'


export default function App() {

  var boxSize = 20
  var lastClickedCoords = null

  // right clicking does not pull up context menu
  window.addEventListener('contextmenu', e => e.preventDefault())

  // when the mouse moves, check if any buttons are pressed, if so react
  window.addEventListener('mousemove', (e) => {
    var col = Math.floor(e.clientX / boxSize)
    var row = Math.floor(e.clientY / boxSize)
    var box = document.getElementById('row' + row + 'col' + col)

    // paint the boxes when clicked, including the ones inbetween cuz it doesnt fire enough
    if (window.event.buttons != 0) {

      if (!lastClickedCoords){
        var currentRow = row
        var currentCol = col
      }
      else{
        var currentRow = lastClickedCoords[0]
        var currentCol = lastClickedCoords[1]
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

        if (window.event.buttons == 1){
          document.getElementById('row' + currentRow + 'col' + currentCol).classList.add('barrier')
        }
        else if (window.event.buttons == 2){
          document.getElementById('row' + currentRow + 'col' + currentCol).classList.remove('barrier')
        }
      } while (currentRow != row || currentCol != col);
      lastClickedCoords = [row, col]
    }
    else {
      lastClickedCoords = null
    }
  })

  var boxSize = boxSize

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