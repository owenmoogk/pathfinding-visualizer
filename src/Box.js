
export default function Box(props){
    return(
        <div id={'row'+props.row+"col"+props.col} className='box' row={props.row} col={props.col} style={{
            // backgroundColor: 'grey',
            border: '1px solid black',
            height: (props.boxSize-2).toString() + 'px',
            width: (props.boxSize-2).toString() + 'px'
        }}></div>
    )
}