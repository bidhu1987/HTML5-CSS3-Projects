/**
  * Tetris
  * Author: Bomb Squad
  **/ 
var SQ      = 25;   // square side in pixels
var HCOUNT  = 10;   // horizontal width in squares
var VCOUNT  = 18;   // vertical width in squares
var WIDTH   = SQ * HCOUNT;
var HEIGHT  = SQ * VCOUNT;
var SPEED     = 1000; // game speed in the loop.
var DROPSPEED = 50;  // game speed when dropping objects.
var ORIGSPEED = 1000; // original game speed
var BGCOLOR = '#fff';
var tempCheckShape = null;//checks the current shape
var number_of_lines_removed = 0;//total number of lines are removed
var last_lines_removed_onlevel = 0;//total number of line where level has been changed
var level=0;//start level 
var nextObject=null;//next upcoming object
var canvas = document.getElementById('game');//canvas on the game
canvas.width = WIDTH;//canvas width
canvas.height = HEIGHT;//canvas height
      
var ctx = canvas.getContext('2d');//context object
    
// Object definitions
// Cube, Left L, Rright L, S shape, Z shape, T shape, Pipe (I)
// '0' is the normal orientation
// '1' is the object rotated 90 degrees clockwise
// '2' is the object rotated 180 degrees clockwise
// '3' is the object rotated 270 degrees clockwise
  
var objects = [
{    // Cube
    name:'Cube',
    fill: '#afa',
    0: [[0,0], [1,1], [0,1], [1,0]], 
    1: [[0,0], [1,1], [0,1], [1,0]],
    2: [[0,0], [1,1], [0,1], [1,0]], 
    3: [[0,0], [1,1], [0,1], [1,0]]
}, { // Normal L
    name:'Normal L',
    fill: '#faa',
    0: [[0,0],[1,0],[1,1],[1,2]], 
    1: [[0,1],[1,1],[2,1],[2,0]],
    2: [[0,0],[0,1],[0,2],[1,2]], 
    3: [[0,0],[1,0],[2,0],[0,1]]
}, { // Reverse L
    name:'Reverse L',
    fill: '#aaf',
    0: [[0,0],[1,0],[0,1],[0,2]], 
    1: [[0,0],[1,0],[2,0],[2,1]],
    2: [[1,0],[1,1],[1,2],[0,2]], 
    3: [[0,0],[0,1],[1,1],[2,1]]
}, { // S - shaped
    name:'S - shaped',
    fill: '#ffa',
    0: [[0,1],[1,1],[1,0],[2,0]], 
    1: [[0,0],[0,1],[1,1],[1,2]],
    2: [[0,1],[1,1],[1,0],[2,0]], 
    3: [[0,0],[0,1],[1,1],[1,2]]
}, { // Z - shaped
    name:'Z - shaped',
    fill: '#aff',
    0: [[0,0],[1,0],[1,1],[2,1]], 
    1: [[1,0],[1,1],[0,1],[0,2]],
    2: [[0,0],[1,0],[1,1],[2,1]], 
    3: [[1,0],[1,1],[0,1],[0,2]]
}, { // T - shaped
    name:'T - shaped',
    fill: '#faf',
    0: [[0,0],[1,0],[2,0],[1,1]], 
    1: [[0,-1],[0,0],[0,1],[1,0]],
    2: [[0,0],[1,-1],[2,0],[1,0]], 
    3: [[2,-1],[1,0],[2,0],[2,1]]
}, { // Pipe
    name:'Pipe',
    fill: '#aaa',
    0: [[0,0], [0,1], [0,2], [0,3]], 
    1: [[-1,1],[0,1],[1,1],[2,1]],
    2: [[0,0], [0,1], [0,2], [0,3]], 
    3: [[-1,1],[0,1],[1,1],[2,1]]
}
];

// current object
var object = null;
// object's orientation
var or = 2;
// last position of the object
var objectPos = [];
// horizontal position (offset) of the object
var hpos  = 4;
// vertical position (offset) of the object
var vpos  = 0;
// whether this is the first tick of a new object
var newOb = true;
// last tick's time
var t = new Date();
// If true the last object should be glued
var glue = false; 
// The Map, Grid, Matrix .. whatever
// Note: The map has 3 types of fields (squares). Empty fields have 
// value 1, fields that are occupied by the current moving object have value 2,
// and fields that are occupied by settled objects have a string value of the
// color in which they should be displayed (object's 'fill' property)
var Map = [];
  
function resetGame(){
    for( var i = 0; i < HCOUNT; i++ ){
        Map[i] = [];
        for( var j = 0; j < VCOUNT; j++ )
            Map[i][j] = 1;
    }
    glue = false, newOb = true, vpos = or = 0, hpos  = 4;
}
resetGame();
  
// The main game logic loop
//it calculate the objects points to draw that will be used in to the draw map
function tick() {
     
    // Clears the map cells where the object used to be in the previous tick
    var color = 1;
    var removeLines = false;//chceck to remove the lines 
    if( glue )
    {
        removeLines = true;
        glue  = false;
        newOb = true;
        color = object.fill;
        vpos  = 0;
        hpos  = 4;
        or    = 0;
    }
    //assings the color of the object
    for( var i=0; i < objectPos.length; i++ )
        Map[ objectPos[i][0] ][ objectPos[i][1] ] = color;
    objectPos = [];
    //calls the function to remove the line
    removeLines && removeFullLines();
    //check if new object is true then call the new object on to the map else use the previous one
    if( newOb ) {
        // 
        // next random object to appear
        if(nextObject==null)
        {
            object = objects[ Math.floor( Math.random() * objects.length ) ];
        }
        else
        {
            object = nextObject;
        }
        //draw the upcoming object of the on the hint panel
        nextObject = objects[ Math.floor( Math.random() * objects.length ) ];
        var hint = document.getElementById("hint");
        var ctx = hint.getContext("2d");
        ctx.clearRect( 0, 0, WIDTH, HEIGHT );
        ctx.fillStyle = nextObject.fill;
        for(var n = 0; n<nextObject[0].length;n++)
        {
                 
            for(var m=0;m<nextObject[0][n].length-1;m++)
            {
                ctx.fillRect(nextObject[0][n][m]*SQ,nextObject[0][n][m+1]*SQ,SQ,SQ);
            }
                 
        }    
    }
    
    var x, y, olength = object[or].length;

    // Place the object on the map
    // The object won't be out of horizontal bounds
    for( i=0; i < olength; i++ ) {
        x = hpos + object[or][i][0];
        y = vpos + object[or][i][1];
      
        if( Map[ x ][ y ] ) {
            Map[ x ][ y ] = 2;
            objectPos.push( [ x, y ] );
        }
    }
    
    // Check the time difference from the last tick
    // This dictates the game speed
    var t1 = new Date();
    if( t1 - t > SPEED ){ 
        // if it's time for a new tick
        var columns = {}
        for( i=0; i < olength; i++ ) {
            x = hpos + object[or][i][0];
            y = vpos + object[or][i][1];

            if( y<0 )
                continue;

            !isNaN(columns[x]) || (columns[x] = y);
            columns[x] = Math.max( columns[x], y );
        }
      
        for( i in columns )
            if( columns[i] == VCOUNT - 1 || Map[i][columns[i] + 1] != 1 ){
                glue = true;
                if( newOb ) {
                    ORIGSPEED =1000;
                    document.getElementById("level").innerHTML=0;
                    document.getElementById("score").innerHTML=0;
                    alert("Game Over");
                    resetGame();
                }
                SPEED = ORIGSPEED;
                return;
            }

        t = t1;
        vpos += 1;
    }
    
    newOb = false;
    
}
  
// Scans the map for filled lines and removes them.
function removeFullLines(){
    var line, j, i, k;
    for( i = VCOUNT-1; i > 0; i-- ){
        line = true;
        for( j=0; j < HCOUNT; j++ )
            if( typeof Map[j][i] != 'string' )
                line = false;
      
        if( line ) {
            for( k = i; k > 0; k-- )
                for( j = 0; j < HCOUNT; j++ )
                    Map[j][k] = Map[j][k-1];
            i++;
            number_of_lines_removed++;
            document.getElementById("score").innerHTML = number_of_lines_removed;
            changeLevel();
        }
    }
    
}
  
// Checks if the object can be moved to the side
function canMove( side ){
    var maxFunc = side == 1 ? Math.max : Math.min;
    var rows = {}, x, y;
    for( var i=0, olength=object[or].length; i < olength; i++ ) {
        y = vpos + object[or][i][1];
        x = hpos + object[or][i][0] + side; // temporarily move the object sideways
        !isNaN(rows[y]) || ( rows[y] = x );  // get the leftmost/rightmost square in each row
        rows[y] = maxFunc( rows[y], x );
    }
    // Check if the leftmost/rightmost square is in an illegal position
    for( i in rows )
        if( rows[i] < 0 || rows[i] > HCOUNT-1 || Map[ rows[i] ][ i ] != 1 )
            return false;
    return true;
}
  
// Checks if the element can be rotated.
function canRotate() {
    var newOr = (or + 1) % 4;
    var to = object[ newOr ], x, y;
    for( var i=0, olength=to.length; i < olength; i++ ){
        x = hpos + to[i][0];
        y = vpos + to[i][1];
      
        // If we want to rotate an object at the edge, try 
        // moving that object to the side to see if it can rotate.
        if( !Map[x] ) {
            var mod = x < 0 ? 1 : -1;
            hpos += mod;
            if( canRotate() ) return true;
            else hpos -= mod;
        }
      
        if( !Map[x][y] || typeof Map[x][y] === 'string' )
            return false;
    }
        
    return true;
}
  
// draws a line from point (fromx, fromy) to point (tox, toy)
function line( fromx, fromy, tox, toy ){
    ctx.beginPath();
    ctx.moveTo( fromx, fromy );
    ctx.lineTo( tox, toy );
    ctx.stroke();
}
  
// The grid line styles
ctx.strokeStyle = '#999';
ctx.lineWidth = .5;
//this function will called after a time interwal that move the object towards the bottem each time  
function drawMap() {
      
    // clear map and draw grid

    ctx.clearRect( 0, 0, WIDTH, HEIGHT );

    var currentSquare, w, h, i;
    // this loop draws the current map state
    for( w = 0; w < HCOUNT; w++ )
    {
        ctx.save();
        ctx.translate( w * SQ, 0 ); // Move the canvas horizontally
        for( h = 0; h < VCOUNT; h++ )
        {
            currentSquare = Map[w][h];
            ctx.save();
            ctx.translate( 0, h * SQ ); // Move the canvas vertically
            if( currentSquare === 2) 
            {
                ctx.fillStyle = object.fill;
                ctx.fillRect( 0, 0, SQ, SQ );
        
            }
            else if( typeof currentSquare === 'string' ) 
            {
                ctx.fillStyle = currentSquare;
                ctx.fillRect( 0, 0, SQ, SQ );
       
            }
            ctx.restore();
        }
        ctx.restore();
    }
    // draws the grid
    for( i = 1; i < WIDTH; i++ )
        line( i*SQ, 0, i*SQ, HEIGHT );
    for( i = 1; i < HEIGHT; i++ )
        line( 0, i*SQ, WIDTH, i*SQ );

}
   
var running = false, drawLoop, tickLoop,showShaploop;
document.onkeydown = function(e) {
    var key = e.which;
    

    if( running && key === 38 && canRotate() ) // a - rotate
        or = ++or % 4; 
    
    else if( key === 40 ) { // down - drop the object by increasing game speed
        SPEED = DROPSPEED;
    }
    
    else if( key === 83 ) { // s - stop (pause)
        if( running ){
            clearInterval( drawLoop );
            clearInterval( tickLoop );
            clearInterval( showShaploop );
         
        }
        else{
           
            drawLoop = setInterval(drawMap, 50);
            tickLoop = setInterval(tick, 50);
            //alert("in ti the loop");

            showShaploop = setInterval("", 50);
        }
        running = !running;
    }
    
    else if( running && key === 37 && canMove(-1) ) // left - move left
        hpos--;

    else if( running && key === 39 && canMove(1) ) // right - move right
        hpos++;
}
//function will cahnge the levels of the map when ever user has glued the 5 lines more then the previous level
function changeLevel()
{
    if(number_of_lines_removed > last_lines_removed_onlevel+5 )
    {
        last_lines_removed_onlevel=number_of_lines_removed
        level++;
        ORIGSPEED-=100;
        document.getElementById("level").innerHTML = level;
    }
}
document.onkeyup = function(e) { // cancel drop
    if( e.which === 40 )
        SPEED = ORIGSPEED;
}