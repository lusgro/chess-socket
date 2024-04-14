import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + "/"));

const games = Array(100).fill({ players: 0, playersId: [{id: 0, username:""}, {id: 0, username:""}] });
const availableIds = Array(200).fill().map((_, i) => i + 1);

io.on('connection', socket => {
  let id;

  socket.on('join', ({ username, room }) => {
    if (availableIds.length === 0 || games[room].players === 2) {
      socket.emit('full', room);
      return;
    }
    
    id = availableIds.pop();
    games[room].players++;
    games[room].playersId[games[room].players - 1] = {id, username};

    const color = games[room].players === 1 ? "w" : "b";
    socket.join(room);
    socket.emit('joined', { ...games[room], color, id, room });
  });

  socket.on('moved', details => io.to(details.room).emit('move', details.move));
  socket.on('start', data => io.to(data.room).emit('start', data));
  socket.on('gameOver', room => io.to(room).emit('gameOver'));

  socket.on('disconnect', () => {
    const room = games.findIndex(game => game.playersId.some(player => player.id === id));
    if (room !== -1) {
        games[room].players = 0;
        availableIds.push(...games[room].playersId.map(player => player.id));
        games[room].playersId = [{id: 0, username:""}, {id: 0, username:""}];
    }
  });
});

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
server.listen(port, () => console.log(`Servidor ejecutandose en http://localhost:${port}`));