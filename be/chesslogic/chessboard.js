const RANKS = 10;
const FILES = 9;
const CHESSPIECE_TYPES = {
  PAWN: 'PAWN',
  ELEPHANT: 'ELEPHANT',
  KING: 'KING',
  GUARD: 'GUARD',
  CHARIOT: 'CHARIOT',
  CANNON: 'CANNON',
  HORSE: 'HORSE'
};
const CHESSPIECES_GRAPHICS = {
  [CHESSPIECE_TYPES.PAWN]: { R: '兵', G: '卒' },
  [CHESSPIECE_TYPES.ELEPHANT]: { R: '相', G: '象' },
  [CHESSPIECE_TYPES.KING]: { R: '帅', G: '将' },
  [CHESSPIECE_TYPES.GUARD]: { R: '仕', G: '士' },
  [CHESSPIECE_TYPES.CHARIOT]: { R: '车', G: '俥' },
  [CHESSPIECE_TYPES.CANNON]: { R: '炮', G: '砲' },
  [CHESSPIECE_TYPES.HORSE]: { R: '马', G: '馬' }
};

let chessPieces = [];
const sides = { RED: 'R', GREEN: 'G' };
let turn = sides.RED;

const isMoveValid = (chessPieces, type, side, currentCoordinates, newCoordinates, ignoreTurn = false, ignoreCheck = false) => {
  currentCoordinates = [currentCoordinates[0], currentCoordinates[1]];
  newCoordinates = [newCoordinates[0], newCoordinates[1]];
  if (!ignoreTurn && side !== turn) {
    return false;
  }

  if (newCoordinates[0] === currentCoordinates[0] && newCoordinates[1] === currentCoordinates[1]) {
    return false;
  } else if (newCoordinates[0] < 0 || newCoordinates[1] < 0 || newCoordinates[0] >= RANKS || newCoordinates[1] >= FILES) {
    return false;
  }
  const forward = side === sides.GREEN ? 1 : -1;

  const checkPieceAtNewLocation = getChessPieceAtLocation(chessPieces, newCoordinates[0], newCoordinates[1]);
  if (checkPieceAtNewLocation && checkPieceAtNewLocation.side === side) {
    return false;
  }

  switch (type) {
    case CHESSPIECE_TYPES.PAWN:
      if (newCoordinates[0] - currentCoordinates[0] === forward && newCoordinates[1] - currentCoordinates[1] === 0) {
        legalMove = true;
      } else if (
        ((forward === -1 && currentCoordinates[0] <= 4) || (forward === 1 && currentCoordinates[0] >= 5)) &&
        newCoordinates[0] === currentCoordinates[0] &&
        [1, -1].includes(currentCoordinates[1] - newCoordinates[1])
      ) {
        legalMove = true;
      } else {
        return false;
      }
      break;
    case CHESSPIECE_TYPES.KING:
      if (
        (newCoordinates[0] - currentCoordinates[0] === 0 && Math.abs(newCoordinates[1] - currentCoordinates[1]) === 1) ||
        (newCoordinates[1] - currentCoordinates[1] === 0 && Math.abs(newCoordinates[0] - currentCoordinates[0]) === 1)
      ) {
        if (newCoordinates[1] > 5 || newCoordinates[1] < 3) {
          return false;
        }
        if (side === sides.GREEN) {
          if (newCoordinates[0] >= 0 && newCoordinates[0] <= 2) {
            legalMove = true;
          } else {
            return false;
          }
        } else {
          if (newCoordinates[0] >= 7 && newCoordinates[0] <= 9) {
            legalMove = true;
          } else {
            return false;
          }
        }
      } else {
        // Check for flying General
        const target = getChessPieceAtLocation(chessPieces, newCoordinates[0], newCoordinates[1]);
        const targetEnemyKing = target && target.type === CHESSPIECE_TYPES.KING && target.side !== side;
        if (targetEnemyKing && currentCoordinates[1] === newCoordinates[1]) {
          let direction = Math.sign(newCoordinates[0] - currentCoordinates[0]);
          let rankCoordinate = (currentCoordinates[0] += direction);
          while (rankCoordinate != newCoordinates[0]) {
            if (getChessPieceAtLocation(chessPieces, rankCoordinate, currentCoordinates[1])) {
              return false;
            }
            rankCoordinate += direction;
          }
          legalMove = true;
        } else {
          return false;
        }
      }
      break;
    case CHESSPIECE_TYPES.CHARIOT:
      if (newCoordinates[0] - currentCoordinates[0] !== 0 && newCoordinates[1] - currentCoordinates[1] !== 0) {
        return false;
      } else if (newCoordinates[0] - currentCoordinates[0] === 0) {
        let direction = Math.sign(newCoordinates[1] - currentCoordinates[1]);
        let checkClear = currentCoordinates[1] + direction;
        while (checkClear !== newCoordinates[1]) {
          checkClear += direction;
          if (getChessPieceAtLocation(chessPieces, currentCoordinates[0], checkClear)) {
            return false;
          }
        }
        legalMove = true;
      } else {
        let direction = Math.sign(newCoordinates[0] - currentCoordinates[0]);
        let checkClear = currentCoordinates[0] + direction;
        while (checkClear !== newCoordinates[0]) {
          const checkBlocker = getChessPieceAtLocation(chessPieces, checkClear, currentCoordinates[1]);
          if (checkBlocker) {
            return false;
          }
          checkClear += direction;
        }
        legalMove = true;
      }
      break;
    case CHESSPIECE_TYPES.CANNON:
      let jumpedOver = false;
      if (newCoordinates[0] - currentCoordinates[0] !== 0 && newCoordinates[1] - currentCoordinates[1] !== 0) {
        return false;
      } else if (newCoordinates[0] - currentCoordinates[0] === 0) {
        let direction = Math.sign(newCoordinates[1] - currentCoordinates[1]);
        let checkClear = currentCoordinates[1] + direction;
        while (checkClear !== newCoordinates[1]) {
          checkClear += direction;
          if (getChessPieceAtLocation(chessPieces, currentCoordinates[0], checkClear)) {
            if (jumpedOver) {
              return false;
            } else {
              jumpedOver = true;
            }
          }
        }
      } else {
        let direction = Math.sign(newCoordinates[0] - currentCoordinates[0]);
        let checkClear = currentCoordinates[0] + direction;
        while (checkClear !== newCoordinates[0]) {
          if (getChessPieceAtLocation(chessPieces, checkClear, currentCoordinates[1])) {
            if (jumpedOver) {
              return false;
            } else {
              jumpedOver = true;
            }
          }
          checkClear += direction;
        }
      }
      const checkCollision = getChessPieceAtLocation(chessPieces, newCoordinates[0], newCoordinates[1]);
      if (jumpedOver) {
        if (!checkCollision || checkCollision.side === side) {
          return false;
        } else {
          legalMove = true;
        }
      } else if (checkCollision) {
        return false;
      } else {
        legalMove = true;
      }
      break;
    case CHESSPIECE_TYPES.HORSE:
      const moveMatrix = [newCoordinates[0] - currentCoordinates[0], newCoordinates[1] - currentCoordinates[1]];
      if ((Math.abs(moveMatrix[0]) === 2 && Math.abs(moveMatrix[1]) === 1) || (Math.abs(moveMatrix[0]) === 1 && Math.abs(moveMatrix[1]) === 2)) {
        if (Math.abs(moveMatrix[0]) === 2) {
          if (getChessPieceAtLocation(chessPieces, currentCoordinates[0] + Math.sign(moveMatrix[0]), currentCoordinates[1])) {
            return false;
          } else {
            legalMove = true;
          }
        } else {
          if (getChessPieceAtLocation(chessPieces, currentCoordinates[0], currentCoordinates[1] + Math.sign(moveMatrix[1]))) {
            return false;
          } else {
            legalMove = true;
          }
        }
      } else {
        return false;
      }
      break;
    case CHESSPIECE_TYPES.GUARD:
      if (Math.abs(newCoordinates[0] - currentCoordinates[0]) === 1 && Math.abs(newCoordinates[1] - currentCoordinates[1]) === 1) {
        if (newCoordinates[1] > 5 || newCoordinates[1] < 3) {
          return false;
        }
        if (side === sides.GREEN) {
          if (newCoordinates[0] >= 0 && newCoordinates[0] <= 2) {
            legalMove = true;
          } else {
            return false;
          }
        } else {
          if (newCoordinates[0] >= 7 && newCoordinates[0] <= 9) {
            legalMove = true;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
      break;
    case CHESSPIECE_TYPES.ELEPHANT:
      if (Math.abs(newCoordinates[0] - currentCoordinates[0]) === 2 && Math.abs(newCoordinates[1] - currentCoordinates[1]) === 2) {
        if (
          getChessPieceAtLocation(
            chessPieces,
            currentCoordinates[0] + Math.sign(newCoordinates[0] - currentCoordinates[0]),
            currentCoordinates[1] + Math.sign(newCoordinates[1] - currentCoordinates[1])
          )
        ) {
          return false;
        }
        if (side === sides.GREEN) {
          if (newCoordinates[0] >= 0 && newCoordinates[0] <= 4) {
            legalMove = true;
          } else {
            return false;
          }
        } else {
          if (newCoordinates[0] >= 5 && newCoordinates[0] <= 9) {
            legalMove = true;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
      break;
    default:
      return false;
  }
  if (!ignoreCheck) {
    if (
      checkIfChecks(
        [{ type, side, position: newCoordinates }].concat(
          chessPieces.filter(
            chessPiece =>
              chessPiece !== checkPieceAtNewLocation &&
              !(currentCoordinates[0] == chessPiece.position[0] && currentCoordinates[1] == chessPiece.position[1])
          )
        ),
        side
      )
    ) {
      return false;
    }
  }

  return legalMove;
};

const checkIfChecks = (chessPieces, side) => {
  const opponentPieces = chessPieces.filter(chessPiece => chessPiece.side !== side);
  const yourKing = chessPieces.find(chessPiece => chessPiece.side === side && chessPiece.type === CHESSPIECE_TYPES.KING);
  // const opponentAvailableMoves = getAllLegalMoves(chessPieces, opponentPieces, true);

  if (!yourKing) {
    // Dafak
    throw new Error('Something wrong la no King wtf?');
  }
  // console.log({ opponentAvailableMoves });
  // const check = !!opponentAvailableMoves.find(move => move[0] === yourKing.position[0] && move[1] === yourKing.position[1]);
  if (
    moveExist(chessPieces, opponentPieces, true, (piece, position) => position[0] === yourKing.position[0] && position[1] === yourKing.position[1])
  ) {
    return true;
  }
  return false;
};

const moveExist = (chessPieces, pieces, ignoreCheck, matchFunction = () => true) => {
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    for (let rank = 0; rank < RANKS; rank++) {
      for (let file = 0; file < FILES; file++) {
        if (isMoveValid(chessPieces, piece.type, piece.side, [piece.position[0], piece.position[1]], [rank, file], true, ignoreCheck)) {
          if (matchFunction(piece, [rank, file])) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

const getAllLegalMoves = (chessPieces, pieces, ignoreCheck) => {
  return pieces
    .map(piece => {
      let moves = [];
      for (let rank = 0; rank < RANKS; rank++) {
        for (let file = 0; file < FILES; file++) {
          if (isMoveValid(chessPieces, piece.type, piece.side, [piece.position[0], piece.position[1]], [rank, file], true, ignoreCheck)) {
            moves.push([rank, file]);
          }
        }
      }
      return moves;
    })
    .reduce((a, b) => a.concat(b), []);
};

const moveChessPiece = (currentCoord, newCoord) => {
  if (checkConditions.isMated) {
    return false;
  }
  const chessPiece = getChessPieceAtLocation(chessPieces, currentCoord[0], currentCoord[1]);
  if (chessPiece) {
    console.log(`Moving ${chessPiece.type} to ${newCoord[0] + ':' + newCoord[1]}`);
    if (isMoveValid(chessPieces, chessPiece.type, chessPiece.side, currentCoord, newCoord)) {
      const capturedPiece = getChessPieceAtLocation(chessPieces, newCoord[0], newCoord[1]);
      if (capturedPiece) {
        capturedPiece.position = [-1, -1];
      }
      chessPiece.position = newCoord;
      turn = turn === sides.RED ? sides.GREEN : sides.RED;
      return true;
    } else {
      return false;
    }
  } else {
    console.log(`No Piece on ${currentCoord[0] + ':' + currentCoord[1]}`);
    return false;
  }
};

const initializeChessPiece = () => {
  turn = sides.RED;
  chessPieces = [
    {
      type: CHESSPIECE_TYPES.PAWN,
      side: sides.RED,
      position: [6, 0]
    },
    {
      type: CHESSPIECE_TYPES.PAWN,
      side: sides.RED,
      position: [6, 2]
    },
    {
      type: CHESSPIECE_TYPES.PAWN,
      side: sides.RED,
      position: [6, 4]
    },
    {
      type: CHESSPIECE_TYPES.PAWN,
      side: sides.RED,
      position: [6, 6]
    },
    {
      type: CHESSPIECE_TYPES.PAWN,
      side: sides.RED,
      position: [6, 8]
    },
    {
      type: CHESSPIECE_TYPES.CANNON,
      side: sides.RED,
      position: [7, 1]
    },
    {
      type: CHESSPIECE_TYPES.CANNON,
      side: sides.RED,
      position: [7, 7]
    },

    {
      type: CHESSPIECE_TYPES.CHARIOT,
      side: sides.RED,
      position: [9, 0]
    },
    {
      type: CHESSPIECE_TYPES.CHARIOT,
      side: sides.RED,
      position: [9, 8]
    },
    {
      type: CHESSPIECE_TYPES.HORSE,
      side: sides.RED,
      position: [9, 1]
    },
    {
      type: CHESSPIECE_TYPES.HORSE,
      side: sides.RED,
      position: [9, 7]
    },
    {
      type: CHESSPIECE_TYPES.ELEPHANT,
      side: sides.RED,
      position: [9, 2]
    },
    {
      type: CHESSPIECE_TYPES.ELEPHANT,
      side: sides.RED,
      position: [9, 6]
    },
    {
      type: CHESSPIECE_TYPES.GUARD,
      side: sides.RED,
      position: [9, 3]
    },
    {
      type: CHESSPIECE_TYPES.GUARD,
      side: sides.RED,
      position: [9, 5]
    },
    {
      type: CHESSPIECE_TYPES.KING,
      side: sides.RED,
      position: [9, 4]
    },
    {
      type: CHESSPIECE_TYPES.PAWN,
      side: sides.GREEN,
      position: [3, 0]
    },
    {
      type: CHESSPIECE_TYPES.PAWN,
      side: sides.GREEN,
      position: [3, 2]
    },
    {
      type: CHESSPIECE_TYPES.PAWN,
      side: sides.GREEN,
      position: [3, 4]
    },
    {
      type: CHESSPIECE_TYPES.PAWN,
      side: sides.GREEN,
      position: [3, 6]
    },
    {
      type: CHESSPIECE_TYPES.PAWN,
      side: sides.GREEN,
      position: [3, 8]
    },
    {
      type: CHESSPIECE_TYPES.CANNON,
      side: sides.GREEN,
      position: [2, 1]
    },
    {
      type: CHESSPIECE_TYPES.CANNON,
      side: sides.GREEN,
      position: [2, 7]
    },

    {
      type: CHESSPIECE_TYPES.CHARIOT,
      side: sides.GREEN,
      position: [0, 0]
    },
    {
      type: CHESSPIECE_TYPES.CHARIOT,
      side: sides.GREEN,
      position: [0, 8]
    },
    {
      type: CHESSPIECE_TYPES.HORSE,
      side: sides.GREEN,
      position: [0, 1]
    },
    {
      type: CHESSPIECE_TYPES.HORSE,
      side: sides.GREEN,
      position: [0, 7]
    },
    {
      type: CHESSPIECE_TYPES.ELEPHANT,
      side: sides.GREEN,
      position: [0, 2]
    },
    {
      type: CHESSPIECE_TYPES.ELEPHANT,
      side: sides.GREEN,
      position: [0, 6]
    },
    {
      type: CHESSPIECE_TYPES.GUARD,
      side: sides.GREEN,
      position: [0, 3]
    },
    {
      type: CHESSPIECE_TYPES.GUARD,
      side: sides.GREEN,
      position: [0, 5]
    },
    {
      type: CHESSPIECE_TYPES.KING,
      side: sides.GREEN,
      position: [0, 4]
    }
  ];
};
initializeChessPiece();

const getChessPieceAtLocation = (chessPieces, rank, file) => {
  return chessPieces.find(chessPiece => chessPiece.position[0] === rank && chessPiece.position[1] === file);
};

const printBoard = () => {
  console.log('    0  1  2  3  4  5  6  7  8 ');
  console.log(' ||===========================||');
  for (let i = 0; i < RANKS; i++) {
    let rankStrings = new Array(2).fill('');
    rankStrings[0] = `${i}||`;
    rankStrings[1] = ` ||`;
    for (let j = 0; j < FILES; j++) {
      const chessPiece = getChessPieceAtLocation(chessPieces, i, j);
      if (chessPiece) {
        rankStrings[0] += `${chessPiece.side}${CHESSPIECES_GRAPHICS[chessPiece.type][chessPiece.side]}`;
      } else if (j === 4 && [1, 8].includes(i)) {
        rankStrings[0] += '-x-';
      } else {
        rankStrings[0] += '-+-';
      }
      if ([0, 1, 7, 8].includes(i) && [3, 4, 5].includes(j)) {
        rankStrings[1] += ' | ';
      } else if (i === 4) {
        // rankStrings[1] = '  |           RIVER           ';
        rankStrings[1] = ' ||     楚   河    漢   界    ';
      } else if (i !== 9) {
        rankStrings[1] += ' : ';
      } else {
        rankStrings[1] += '===';
      }
    }
    rankStrings.forEach(rankString => {
      console.log(`${rankString}||`);
    });
  }
  const gameState = checkConditions();
  if (gameState.isMated) {
    console.log(`${turn} is CHECKED AND MATED!!`);
    console.log(`${turn === sides.GREEN ? sides.RED : sides.GREEN} wins!`);
  } else if (gameState.isChecked) {
    console.log(`${turn} is being checked!`);
  } else if (gameState.isDead) {
    console.log(`WTF ${turn}'s KING is dead?! TF did you do to my code >:(`);
  } else {
    console.log(`It's ${turn}'s turn!`);
  }
};

const checkConditions = () => {
  const isChecked = checkIfChecks(chessPieces, turn);
  const isMated = !moveExist(chessPieces, chessPieces.filter(chessPiece => chessPiece.side === turn));
  const isDead = !chessPieces.find(
    chessPiece => chessPiece.side === turn && chessPiece.type === CHESSPIECE_TYPES.KING && chessPiece.position[0] >= 0 && chessPiece.position[1] >= 0
  );
  return {
    turn,
    chessPieces,
    isChecked,
    isMated,
    isDead
  };
};

const getChessPieces = () => {
  return chessPieces;
};

module.exports = {
  printBoard,
  moveChessPiece,
  getChessPieces,
  initializeChessPiece,
  checkConditions
};
