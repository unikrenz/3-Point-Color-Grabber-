const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();
const httpPort = 3000;
const wsPort = 8080;
const wsPort2 = 8081;
const wsPort3 = 8082;
const wsPort4 = 8083;
const wsPort5 = 8084;
const wsPort6 = 8085;


// Create an HTTP server using Express
const httpServer = app.listen(httpPort, () => {
    console.log(`HTTP Server is running on port ${httpPort}`);
});

// Create a WebSocket server on port 8080
const wsServer = new WebSocket.Server({ port: wsPort }, () => {
    console.log(`WebSocket Server is running on port ${wsPort}`);
});
const wsServer2 = new WebSocket.Server({ port: wsPort2 }, () => {
    console.log(`WebSocket Server is running on port ${wsPort}`);
});
const wsServer3= new WebSocket.Server({ port: wsPort3 }, () => {
    console.log(`WebSocket Server is running on port ${wsPort}`);
});
const wsServer4 = new WebSocket.Server({ port: wsPort4 }, () => {
    console.log(`WebSocket Server is running on port ${wsPort}`);
});
const wsServer5= new WebSocket.Server({ port: wsPort5 }, () => {
    console.log(`WebSocket Server is running on port ${wsPort}`);
});
const wsServer6= new WebSocket.Server({ port: wsPort6 }, () => {
    console.log(`WebSocket Server is running on port ${wsPort}`);
});

// Handle WebSocket connections
wsServer.on('connection', (socket) => {
    console.log('WebSocket connection established');

    // Handle incoming WebSocket messages if needed
    socket.on('message', (message) => {
        console.log('Received WebSocket message:', message);
    });

    // Handle WebSocket connection close if needed
    socket.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} - ${reason}`);
    });
});
wsServer2.on('connection', (socket) => {
    console.log('WebSocket connection established');

    // Handle incoming WebSocket messages if needed
    socket.on('message', (message) => {
        console.log('Received WebSocket message:', message);
    });

    // Handle WebSocket connection close if needed
    socket.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} - ${reason}`);
    });
});
wsServer3.on('connection', (socket) => {
    console.log('WebSocket connection established');

    // Handle incoming WebSocket messages if needed
    socket.on('message', (message) => {
        console.log('Received WebSocket message:', message);
    });

    // Handle WebSocket connection close if needed
    socket.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} - ${reason}`);
    });
});

wsServer4.on('connection', (socket) => {
    console.log('WebSocket connection established');

    // Handle incoming WebSocket messages if needed
    socket.on('message', (message) => {
        console.log('Received WebSocket message:', message);
    });

    // Handle WebSocket connection close if needed
    socket.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} - ${reason}`);
    });
});

wsServer5.on('connection', (socket) => {
    console.log('WebSocket connection established');

    // Handle incoming WebSocket messages if needed
    socket.on('message', (message) => {
        console.log('Received WebSocket message:', message);
    });

    // Handle WebSocket connection close if needed
    socket.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} - ${reason}`);
    });
});

wsServer6.on('connection', (socket) => {
    console.log('WebSocket connection established');

    // Handle incoming WebSocket messages if needed
    socket.on('message', (message) => {
        console.log('Received WebSocket message:', message);
    });

    // Handle WebSocket connection close if needed
    socket.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} - ${reason}`);
    });
});
// Middleware to parse JSON in the incoming HTTP requests
app.use(bodyParser.json());

// Handle incoming HTTP POST requests
app.post('/data', (req, res) => {
    const receivedData = req.body;
    console.log('Received data:', receivedData);

    // Broadcast the received data to all connected WebSocket clients on all ports
    [wsServer, wsServer2, wsServer3, wsServer4, wsServer5, wsServer6].forEach((server) => {
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(receivedData));
            }
        });
    });

    res.send('Data received successfully');
});
