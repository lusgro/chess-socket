import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';

const socket = io();
const game = new Chess();
const form = document.getElementById('form');
const username = document.getElementById('username');
const room = document.getElementById('room');
const state = document.getElementById('state');
let globalData, localData, canPlay = false, board;

form.addEventListener('submit', e => {
    e.preventDefault();
    console.log(room.value);
    socket.emit('join', { username: username.value, room: room.value });
    form.style.display = 'none';
});

socket.on('full', roomValue => roomValue === room.value && alert('La sala esta llena'));

socket.on('joined', data => {
    localData = data;
    const color = data.color === 'w' ? 'white' : 'black';
    board = ChessBoard('board', {
        orientation: color,
        draggable: true,
        position: 'start',
        onDragStart,
        onDrop,
        onMouseoutSquare,
        onMouseoverSquare,
        onSnapEnd
    });
    data.players === 2 && socket.emit('start', data);
});

socket.on('start', data => {
    globalData = data;
    state.innerText = `Juego en curso - Jugador Blancas: ${data.playersId[0].username} | Jugador Negras: ${data.playersId[1].username}`;
    canPlay = true;
});

socket.on('move', moveDetails => {
    game.move(moveDetails);
    board.position(game.fen());
});

const removeGreySquares = () => $('#board .square-55d63').css('background', '');

const greySquare = square => $('#board .square-' + square).css('background', $('#board .square-' + square).hasClass('black-3c85d') ? '#696969' : '#a9a9a9');

const onDragStart = (source, piece) => !(game.game_over() || !canPlay || (game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1) || (game.turn() === 'w' && localData.color === 'b') || (game.turn() === 'b' && localData.color === 'w'));

const onDrop = (source, target) => {
    removeGreySquares();
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (game.game_over()) {
        state.innerHTML = 'Juego finalizado';
        socket.emit('gameOver', globalData.room)
    }
    if (move === null) return 'snapback';
    socket.emit('moved', { move, board: game.fen(), room: globalData.room });
};

const onMouseoverSquare = (square, piece) => {
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) return;
    greySquare(square);
    moves.forEach(({ to }) => greySquare(to));
};

const onMouseoutSquare = () => removeGreySquares();

const onSnapEnd = () => board.position(game.fen());