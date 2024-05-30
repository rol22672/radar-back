const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

let locations = [];

io.on('connection', (socket) => {
  console.log('New client connected');

  // Enviar ubicaciones existentes al nuevo cliente
  socket.emit('updateLocations', locations);

  // Recibir ubicación del cliente
  socket.on('location', (location) => {
    const userLocation = {
      id: socket.id,
      lat: location.lat,
      lng: location.lng,
    };

    // Actualizar la ubicación del usuario
    locations = locations.filter((loc) => loc.id !== socket.id);
    locations.push(userLocation);

    // Enviar ubicaciones actualizadas a todos los clientes
    io.emit('updateLocations', locations);
  });

  // Eliminar la ubicación del usuario cuando se desconecta
  socket.on('disconnect', () => {
    locations = locations.filter((loc) => loc.id !== socket.id);
    io.emit('updateLocations', locations);
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
