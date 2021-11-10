import { useState } from 'react'
import Box from './Box.js'
import './styles.css'


export default function App() {

  var boxSize = 20
  var lastClickedBox = null

  // right clicking does not pull up context menu
  window.addEventListener('contextmenu', e => e.preventDefault())

  // when the mouse moves, check if any buttons are pressed, if so react
  window.addEventListener('mousemove', (e) => {
    var col = Math.floor(e.clientX / boxSize)
    var row = Math.floor(e.clientY / boxSize)
    var box = document.getElementById('row' + row + 'col' + col)
    
    // paint the boxes inbetween
    // if (lastClickedBox != null){
    //   var currentRow = parseInt(lastClickedBox.getAttribute('row'))
    //   var currentCol = parseInt(lastClickedBox.getAttribute('col'))
    //   while (currentRow != row && currentCol != col){
    //     if (row > currentRow){
    //       currentRow += 1
    //     }
    //     else if (row < currentRow){
    //       currentRow -= 1
    //     }
    //     if (col > currentCol){
    //       currentCol += 1
    //     }
    //     else if (col < currentRow){
    //       currentCol -= 1
    //     }
    //     console.log(currentRow, currentCol)
    //     document.getElementById('row'+currentRow+'col'+currentCol).classList.add('barrier')
    //   }
    // }

    if (window.event.buttons == 1) {
      box.classList.add('barrier')
      lastClickedBox = box
    }
    else if (window.event.buttons == 2) {
      box.classList.remove('barrier')
      lastClickedBox = box
    }
    else{
      lastClickedBox = null
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