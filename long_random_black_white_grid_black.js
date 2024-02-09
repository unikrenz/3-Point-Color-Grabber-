let canvasHeight = 1770;
let canvasWidth = 1100;
let borderSize = 2;
let gridLineWidth = 2; 
let desiredCellSize = 21;

let numCols;
let numRows;
let actualCellSize;

let rgbData = [];
let randomData = [];
let snapshotInterval;

const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened');
});

socket.addEventListener('message', (event) => {
    let newRgbData = JSON.parse(event.data);
    console.log(newRgbData);

    if (newRgbData && newRgbData.r !== undefined && newRgbData.g !== undefined && newRgbData.b !== undefined) {
        randomData.push(newRgbData);
        drawRandomSquare();
    }
});

function shuffleArray(array) {
    let shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

function fillCanvasWhite() {
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.onload = function() {
    initializeGrid();
    fillCanvasWhite();
    drawGrid();
}

function initializeGrid() {
    numCols = Math.floor(canvasWidth / desiredCellSize);
    actualCellSize = Math.floor(canvasWidth / numCols);
    borderSize = (canvasWidth - (actualCellSize * numCols)) / (numCols - 1);
    numRows = Math.floor((canvasHeight - borderSize) / (actualCellSize + borderSize));

    let actualGridHeight = numRows * (actualCellSize + borderSize);

    let canvas = document.getElementById('gridCanvas');
    canvas.width = canvasWidth;
    canvas.height = actualGridHeight;
}
// First, draw all the squares
for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      drawColoredSquare(col, row, rgbData[row][col]);
    }
  }
  
  // Then, draw the grid on top
  drawGrid();
  
function drawGrid() {
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');
  
    ctx.strokeStyle = 'white';
    ctx.lineWidth = gridLineWidth; // Set the line width for the grid
    // Draw horizontal grid lines
    for (let i = 0; i <= numRows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * (actualCellSize + borderSize));
      ctx.lineTo(canvas.width, i * (actualCellSize + borderSize));
      ctx.stroke();
    }
  
    // Draw vertical grid lines
    for (let i = 0; i <= numCols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * (actualCellSize + borderSize), 0);
      ctx.lineTo(i * (actualCellSize + borderSize), canvas.height);
      ctx.stroke();
    }
  }

let filledSquares = [];

function drawRandomSquare() {
    const allPositions = [];
    for (let i = 0; i < numCols * numRows; i++) {
        allPositions.push(i);
    }

    const shuffledPositions = shuffleArray(allPositions);

    let position;
    do {
        position = shuffledPositions.pop();
    } while (filledSquares.includes(position) && shuffledPositions.length > 0);

    if (position !== undefined) {
        let col = position % numCols;
        let row = Math.floor(position / numCols);
        if (row < numRows  && col < numCols) {
            drawColoredSquare(col, row, randomData[randomData.length - 1]);
            filledSquares.push(position);
        }
    }

    if (randomData.length >= numCols * numRows) {
        socket.send('stopRandomData');
    }
}

function drawColoredSquare(col, row, rgb) {
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');

    let position = row * numCols + col;
    if (!filledSquares.includes(position)) {
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(
            col * (actualCellSize + borderSize),
            row * (actualCellSize + borderSize),
            actualCellSize,
            actualCellSize
        );

        // Redraw the grid line for this square
        ctx.strokeStyle = 'black';
        ctx.strokeRect(
            col * (actualCellSize + borderSize),
            row * (actualCellSize + borderSize),
            actualCellSize,
            actualCellSize
        );
    }
}

snapshotInterval = setInterval(() => {
    const timestamp = Date.now();
    const canvas = document.getElementById('gridCanvas');
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');

    link.download = `black_white_grid_black_${timestamp}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // If the grid is full, take one last screenshot, then clear the canvas and reset the filledSquares and randomData arrays
    if (filledSquares.length >= numCols * numRows) {
        // Take one last screenshot
        const lastTimestamp = Date.now();
        const lastDataUrl = canvas.toDataURL('image/png');
        const lastLink = document.createElement('a');

        lastLink.download = `black_white_grid_black_${lastTimestamp}.png`;
        lastLink.href = lastDataUrl;
        document.body.appendChild(lastLink);
        lastLink.click();
        document.body.removeChild(lastLink);

        // Clear the canvas and reset the arrays
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        filledSquares = [];
        randomData = [];
        
        initializeGrid();
        fillCanvasWhite()
        drawGrid();
    }
}, 60 * 3000);
