import { useState } from 'react'
import Box from './Box.js'
import './styles.css'


export default function App() {

  var boxSize = 20

  window.addEventListener('contextmenu', e => e.preventDefault())

  window.addEventListener('mousemove', (e) => {
    if (window.event.buttons != 0) {
      var col = Math.floor(e.clientX / boxSize)
      var row = Math.floor(e.clientY / boxSize)
      var box = document.getElementById('row' + row + 'col' + col)

      if (window.event.buttons == 1){
        box.style.backgroundColor = 'purple'
      }
      if (window.event.buttons == 2){
        box.style.backgroundColor = 'pink'
      }
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
    <div className="App" style={{userSelect: 'none'}}>
      <div id='grid'>
        {grid.map((row) => {
          return (
            <div className='row' id={row}>
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