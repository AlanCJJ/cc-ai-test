const { getInput } = require('./misc/cmd');
const { printBoard, moveChessPiece } = require('./chesslogic/chessboard');
const testRun = async () => {
  let input = '';
  let output = '';
  while (input !== 'exit') {
    printBoard();
    if (output) {
      console.log(output);
      output = '';
    }
    input = await getInput('Next Move? Type curXcurYnewXnewY');
    if (input !== 'exit') {
      const split = input.split('');
      output += `${split}`;
      if (split.length !== 4) {
        output += `\nInvalid Move!`
      } else if (!moveChessPiece([Number.parseInt(split[0]), Number.parseInt(split[1])], [Number.parseInt(split[2]), Number.parseInt(split[3])])) {
        output += `\nInvalid Move!`
      }
    }
  }
  console.log('Bye!');
};
testRun();
