export default function Box(props){

    function removeClasses(currentElement){
        if (currentElement.classList.contains("start")){
            currentElement.classList.remove("start")
            props.setStartSet(false)
            return
        }
        if (currentElement.classList.contains("end")){
            currentElement.classList.remove("end")
            props.setEndSet(false)
            return
        }
        currentElement.classList.remove('barrier')
    }

    function addClasses(currentElement){
        if (!props.startSet){
            currentElement.classList.add("start")
            props.setStartSet(true)
            return;
        }

        if (!props.endSet){
            currentElement.classList.add("end")
            props.setEndSet(true);
            return;
        }

        if (!currentElement.classList.contains("start") && !currentElement.classList.contains("end")){
            currentElement.classList.add("barrier")
        }
    }
    
    function mouseEnter(event){
        
        const currentElement = document.getElementById('row' + props.row + 'col' + props.col)

        if (event.buttons === 2){
            removeClasses(currentElement)   
            return;
        }

        if (event.buttons === 1){
            addClasses(currentElement)
            return;
        }
    }

    return(
        <div id={'row'+props.row+"col"+props.col} className='box' onMouseEnter={(e) => mouseEnter(e)} onMouseDown={(e) => mouseEnter(e)} row={props.row} col={props.col} style={{
            // backgroundColor: 'grey',
            border: '1px solid black',
            height: (props.boxSize-2).toString() + 'px',
            width: (props.boxSize-2).toString() + 'px'
        }}></div>
    )
}