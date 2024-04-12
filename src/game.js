const game = new Chess();
let board;

const removeGreySquares = () => $('#board .square-55d63').css('background', '');

const greySquare = (square) => {
    const squareEl = $('#board .square-' + square);
    const background = squareEl.hasClass('black-3c85d') ? '#696969' : '#a9a9a9';
    squareEl.css('background', background);
};

const isMoveNotAllowed = (piece) => game.game_over() || (game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1);

const onDragStart = (source, piece) => !isMoveNotAllowed(piece);

const onDrop = (source, target) => {
    removeGreySquares();
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';
};

const onMouseoverSquare = (square, piece) => {
    const moves = game.moves({ square: square, verbose: true });
    if (moves.length === 0) return;
    greySquare(square);
    moves.forEach(move => greySquare(move.to));
};

const onMouseoutSquare = () => removeGreySquares();

const onSnapEnd = () => board.position(game.fen());

const cfg = {
    draggable: true,
    position: 'start',
    onDragStart,
    onDrop,
    onMouseoutSquare,
    onMouseoverSquare,
    onSnapEnd
};

board = ChessBoard('board', cfg);