const { printBoard, moveChessPiece } = require('./chesslogic/chessboard');
const moves = [
  {
    move: '7131'
  },
  {
    move: '2724'
  },
  {
    move: '7757'
  },
  {
    move: '0726'
  },
  {
    move: '3134'
  },
  {
    move: '3242'
  },
  {
    move: '2425'
  },
  {
    move: '5754'
  }
];
const testRun = async () => {
  let input = '';
  let output = '';
  for (let i = 0; i < moves.length; i++) {
    printBoard();
    if (output) {
      console.log(output);
      output = '';
    }
    input = moves[i].move;
    const split = input.split('');
    output += `${split}`;
    if (split.length !== 4) {
      output += `\nInvalid Move!`;
    } else if (!moveChessPiece([Number.parseInt(split[0]), Number.parseInt(split[1])], [Number.parseInt(split[2]), Number.parseInt(split[3])])) {
      output += `\nInvalid Move!`;
    }
  }
  printBoard();
};
testRun();
