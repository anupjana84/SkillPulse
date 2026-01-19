import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView
} from 'react-native';

const BOARD_SIZE = 10;
const PieceColor = { WHITE: 'white', BLACK: 'black' };
const PieceType = {
  PAWN: 'pawn',
  ROOK: 'rook',
  KNIGHT: 'knight',
  BISHOP: 'bishop',
  QUEEN: 'queen',
  KING: 'king',
  MISSILE: 'missile'
};

const pieceSymbols = {
  white: { pawn: '♙', rook: '♖', knight: '♘', bishop: '♗', queen: '♕', king: '♔', missile: '🚀' },
  black: { pawn: '♟', rook: '♜', knight: '♞', bishop: '♝', queen: '♛', king: '♚', missile: '🚀' }
};

class Position {
  row: number;
  col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  equals(other: Position) {
    return other && this.row === other.row && this.col === other.col;
  }

  get algebraic() {
    if (this.row < 0 || this.row >= 10 || this.col < 0 || this.col >= 10) {
      return 'Invalid';
    }
    const colChar = String.fromCharCode('a'.charCodeAt(0) + this.col);
    const rowNum = 10 - this.row;
    return `${colChar}${rowNum}`;
  }
}

class ChessPiece {
  color: string;
  type: string;
  enPassantUsedCount: number;
  justMovedThreeOrTwoSquares: boolean;
  symbol: string;
  name: string;

  constructor(color: string, type: string, enPassantUsedCount = 0, justMovedThreeOrTwoSquares = false) {
    this.color = color;
    this.type = type;
    this.enPassantUsedCount = enPassantUsedCount;
    this.justMovedThreeOrTwoSquares = justMovedThreeOrTwoSquares;
    this.symbol = pieceSymbols[color][type];
    this.name = type;
  }
}

class Move {
  from: Position;
  to: Position;
  movedPiece: ChessPiece;
  capturedPiece: ChessPiece | null;

  constructor(from: Position, to: Position, movedPiece: ChessPiece, capturedPiece: ChessPiece | null) {
    this.from = from;
    this.to = to;
    this.movedPiece = movedPiece;
    this.capturedPiece = capturedPiece;
  }
}

export default function DynamoChess() {
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(PieceColor.WHITE);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState("White's turn");
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

    for (let i = 0; i < BOARD_SIZE; i++) {
      newBoard[1][i] = new ChessPiece(PieceColor.BLACK, PieceType.PAWN);
      newBoard[BOARD_SIZE - 2][i] = new ChessPiece(PieceColor.WHITE, PieceType.PAWN);
    }

    const blackOrder = [
      PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.MISSILE,
      PieceType.QUEEN, PieceType.KING, PieceType.MISSILE, PieceType.BISHOP,
      PieceType.KNIGHT, PieceType.ROOK
    ];
    const whiteOrder = [
      PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.MISSILE,
      PieceType.KING, PieceType.QUEEN, PieceType.MISSILE, PieceType.BISHOP,
      PieceType.KNIGHT, PieceType.ROOK
    ];

    for (let i = 0; i < BOARD_SIZE; i++) {
      newBoard[0][i] = new ChessPiece(PieceColor.BLACK, blackOrder[i]);
      newBoard[BOARD_SIZE - 1][i] = new ChessPiece(PieceColor.WHITE, whiteOrder[i]);
    }

    setBoard(newBoard);
    setCurrentPlayer(PieceColor.WHITE);
    setSelectedPosition(null);
    setPossibleMoves([]);
    setGameStatus("White's turn");
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
  };

  const isValidPosition = (row, col) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  };

  const getPawnMoves = (row, col, color, board) => {
    const moves = [];
    const direction = color === PieceColor.WHITE ? -1 : 1;

    if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
      moves.push(new Position(row + direction, col));

      const isStartingWhite = row === BOARD_SIZE - 2 || row === BOARD_SIZE - 3;
      const isStartingBlack = row === 1 || row === 2;

      if ((color === PieceColor.WHITE && isStartingWhite) ||
        (color === PieceColor.BLACK && isStartingBlack)) {
        if (isValidPosition(row + 2 * direction, col) && !board[row + 2 * direction][col]) {
          moves.push(new Position(row + 2 * direction, col));
        }
        if (isValidPosition(row + 3 * direction, col) && !board[row + 3 * direction][col]) {
          moves.push(new Position(row + 3 * direction, col));
        }
      }
    }

    for (const colOffset of [-1, 1]) {
      const newCol = col + colOffset;
      if (isValidPosition(row + direction, newCol)) {
        const target = board[row + direction][newCol];
        if (target && target.color !== color) {
          moves.push(new Position(row + direction, newCol));
        }
      }
    }

    return moves;
  };

  const getSlidingMoves = (row, col, color, directions, board) => {
    const moves = [];
    for (const [dr, dc] of directions) {
      for (let i = 1; i < BOARD_SIZE; i++) {
        const newRow = row + dr * i;
        const newCol = col + dc * i;
        if (!isValidPosition(newRow, newCol)) break;
        const piece = board[newRow][newCol];
        if (!piece) {
          moves.push(new Position(newRow, newCol));
        } else {
          if (piece.color !== color) {
            moves.push(new Position(newRow, newCol));
          }
          break;
        }
      }
    }
    return moves;
  };

  const getKnightMoves = (row, col, color, board) => {
    const moves = [];
    const knightOffsets = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];

    for (const [dr, dc] of knightOffsets) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (isValidPosition(newRow, newCol)) {
        const piece = board[newRow][newCol];
        if (!piece || piece.color !== color) {
          moves.push(new Position(newRow, newCol));
        }
      }
    }
    return moves;
  };

  const getKingMoves = (row, col, color, board) => {
    const moves = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const newRow = row + dr;
        const newCol = col + dc;
        if (isValidPosition(newRow, newCol)) {
          const piece = board[newRow][newCol];
          if (!piece || piece.color !== color) {
            moves.push(new Position(newRow, newCol));
          }
        }
      }
    }
    return moves;
  };

  const getMissileMoves = (row, col, color, board) => {
    const bishopDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const moves = getSlidingMoves(row, col, color, bishopDirs, board);
    return moves.concat(getKnightMoves(row, col, color, board));
  };

  const getPossibleMoves = (row: number, col: number, board: ChessPiece[][]) => {
    const piece = board[row][col];
    if (!piece) return [];

    switch (piece.type) {
      case PieceType.PAWN:
        return getPawnMoves(row, col, piece.color, board);
      case PieceType.ROOK:
        return getSlidingMoves(row, col, piece.color, [[1, 0], [-1, 0], [0, 1], [0, -1]], board);
      case PieceType.KNIGHT:
        return getKnightMoves(row, col, piece.color, board);
      case PieceType.BISHOP:
        return getSlidingMoves(row, col, piece.color, [[1, 1], [1, -1], [-1, 1], [-1, -1]], board);
      case PieceType.QUEEN:
        return getSlidingMoves(row, col, piece.color, [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]], board);
      case PieceType.KING:
        return getKingMoves(row, col, piece.color, board);
      case PieceType.MISSILE:
        return getMissileMoves(row, col, piece.color, board);
      default:
        return [];
    }
  };

  const isKingInCheck = (color, testBoard) => {
    let kingPos = null;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = testBoard[row][col];
        if (piece?.type === PieceType.KING && piece?.color === color) {
          kingPos = new Position(row, col);
          break;
        }
      }
      if (kingPos) break;
    }
    if (!kingPos) return false;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = testBoard[row][col];
        if (piece && piece.color !== color) {
          const moves = getPossibleMoves(row, col, testBoard);
          if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const getValidMoves = (row, col, currentBoard) => {
    const piece = currentBoard[row][col];
    if (!piece) return [];

    const rawMoves = getPossibleMoves(row, col, currentBoard);
    const validMoves = [];

    for (const move of rawMoves) {
      const testBoard = currentBoard.map(r => [...r]);
      const capturedPiece = testBoard[move.row][move.col];
      testBoard[move.row][move.col] = piece;
      testBoard[row][col] = null;

      if (!isKingInCheck(piece.color, testBoard)) {
        validMoves.push(move);
      }
    }

    return validMoves;
  };

  const checkPawnPromotion = (newBoard, row, col) => {
    const piece = newBoard[row][col];
    if (piece?.type === PieceType.PAWN && (row === 0 || row === BOARD_SIZE - 1)) {
      newBoard[row][col] = new ChessPiece(piece.color, PieceType.MISSILE);
      return true;
    }
    return false;
  };

  const checkMissileCaptureWin = (currentBoard) => {
    let whiteMissiles = 0;
    let blackMissiles = 0;

    for (const row of currentBoard) {
      for (const piece of row) {
        if (piece?.type === PieceType.MISSILE) {
          if (piece.color === PieceColor.WHITE) whiteMissiles++;
          else blackMissiles++;
        }
      }
    }

    if (whiteMissiles === 0) return 'Black wins by capturing both Missiles!';
    if (blackMissiles === 0) return 'White wins by capturing both Missiles!';
    return null;
  };

  const movePiece = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = board.map(r => [...r]);
    const movingPiece = newBoard[fromRow][fromCol];
    const capturedPiece = newBoard[toRow][toCol];

    const newMove = new Move(
      new Position(fromRow, fromCol),
      new Position(toRow, toCol),
      movingPiece,
      capturedPiece
    );

    if (movingPiece?.type === PieceType.PAWN) {
      const distance = Math.abs(fromRow - toRow);
      const justMovedTwoOrThree = distance === 2 || distance === 3;
      newBoard[toRow][toCol] = new ChessPiece(
        movingPiece.color,
        movingPiece.type,
        movingPiece.enPassantUsedCount,
        justMovedTwoOrThree
      );
    } else {
      newBoard[toRow][toCol] = movingPiece;
    }

    newBoard[fromRow][fromCol] = null;

    const promoted = checkPawnPromotion(newBoard, toRow, toCol);
    const winStatus = checkMissileCaptureWin(newBoard);

    setBoard(newBoard);
    setMoveHistory([...moveHistory, newMove]);
    setCurrentMoveIndex(moveHistory.length);
    setSelectedPosition(null);
    setPossibleMoves([]);

    const nextPlayer = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    setCurrentPlayer(nextPlayer);

    if (winStatus) {
      setGameStatus(winStatus);
    } else if (promoted) {
      setGameStatus('Pawn promoted to Missile!');
    } else {
      setGameStatus(`${nextPlayer === PieceColor.WHITE ? 'White' : 'Black'}'s turn`);
    }
  };

  const handleTap = (row, col) => {
    const piece = board[row][col];

    if (currentMoveIndex !== moveHistory.length - 1 && currentMoveIndex !== -1) {
      setGameStatus('Return to present to make a new move.');
      return;
    }

    if (piece && piece.color === currentPlayer) {
      const valid = getValidMoves(row, col, board);
      setSelectedPosition(new Position(row, col));
      setPossibleMoves(valid);
      setGameStatus(`Selected: ${piece.name}`);
    } else if (selectedPosition) {
      const moveIsValid = possibleMoves.some(
        pos => pos.row === row && pos.col === col
      );
      if (moveIsValid) {
        movePiece(selectedPosition.row, selectedPosition.col, row, col);
      }
    }
  };

  const getSquareColor = (row, col) => {
    const piece = board[row][col];

    if (selectedPosition?.equals(new Position(row, col))) {
      return '#64B5F6';
    }

    if (possibleMoves.some(pos => pos.row === row && pos.col === col)) {
      return '#90CAF9';
    }

    if (piece?.type === PieceType.KING &&
      piece?.color === currentPlayer &&
      isKingInCheck(piece.color, board)) {
      return '#EF5350';
    }

    return (row + col) % 2 === 0 ? '#DCDA5C' : '#6AAA64';
  };

  const getAlgebraicNotation = (move) => {
    const movingPiece = move.movedPiece;
    const capturedPiece = move.capturedPiece;

    if (movingPiece?.type === PieceType.PAWN) {
      const fromColChar = String.fromCharCode('a'.charCodeAt(0) + move.from.col);
      const toColChar = String.fromCharCode('a'.charCodeAt(0) + move.to.col);
      if (capturedPiece || toColChar !== fromColChar) {
        return `${fromColChar}x${toColChar}${move.to.algebraic[1]}`;
      }
    }

    const targetSquare = move.to.algebraic;
    if (capturedPiece) {
      return `x${targetSquare}`;
    }
    return targetSquare;
  };

  const goToPreviousMove = () => {
    if (currentMoveIndex > 0) {
      const lastMove = moveHistory[currentMoveIndex];
      const newBoard = board.map(r => [...r]);
      newBoard[lastMove.from.row][lastMove.from.col] = lastMove.movedPiece;
      newBoard[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;

      setBoard(newBoard);
      setCurrentMoveIndex(currentMoveIndex - 1);
      setCurrentPlayer(currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE);
      setGameStatus('Viewing past move.');
    }
  };

  const goToNextMove = () => {
    if (currentMoveIndex < moveHistory.length - 1) {
      const nextMove = moveHistory[currentMoveIndex + 1];
      const newBoard = board.map(r => [...r]);
      newBoard[nextMove.to.row][nextMove.to.col] = nextMove.movedPiece;
      newBoard[nextMove.from.row][nextMove.from.col] = null;

      setBoard(newBoard);
      setCurrentMoveIndex(currentMoveIndex + 1);
      setCurrentPlayer(currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE);
      setGameStatus('Viewing past move.');
    }
  };

  const goToLastMove = () => {
    while (currentMoveIndex < moveHistory.length - 1) {
      const nextMove = moveHistory[currentMoveIndex + 1];
      const newBoard = board.map(r => [...r]);
      newBoard[nextMove.to.row][nextMove.to.col] = nextMove.movedPiece;
      newBoard[nextMove.from.row][nextMove.from.col] = null;

      setBoard(newBoard);
      setCurrentMoveIndex(prev => prev + 1);
      setCurrentPlayer(currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE);
    }
    setGameStatus(`${currentPlayer === PieceColor.WHITE ? 'Black' : 'White'}'s turn`);
  };

  const screenWidth = Dimensions.get('window').width;
  const squareSize = screenWidth / BOARD_SIZE;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DYNAMO CHESS</Text>
        <TouchableOpacity onPress={initializeBoard} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.status}>{gameStatus}</Text>

      <View style={styles.boardContainer}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.boardRow}>
            {row.map((piece: any, colIndex: any) => (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.square,
                  {
                    width: squareSize,
                    height: squareSize,
                    backgroundColor: getSquareColor(rowIndex, colIndex)
                  }
                ]}
                onPress={() => handleTap(rowIndex, colIndex)}
              >
                {piece && (
                  <Text style={styles.piece}>{piece.symbol}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <ScrollView style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Move History:</Text>
        <View style={styles.historyList}>
          {moveHistory.map((move, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.historyItem,
                index === currentMoveIndex && styles.currentMove
              ]}
              onPress={() => {
                while (currentMoveIndex > index) goToPreviousMove();
                while (currentMoveIndex < index) goToNextMove();
              }}
            >
              <Text style={styles.historyText}>
                {index + 1}. {getAlgebraicNotation(move)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, currentMoveIndex <= 0 && styles.buttonDisabled]}
          onPress={goToPreviousMove}
          disabled={currentMoveIndex <= 0}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, currentMoveIndex >= moveHistory.length - 1 && styles.buttonDisabled]}
          onPress={goToNextMove}
          disabled={currentMoveIndex >= moveHistory.length - 1}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, (currentMoveIndex === moveHistory.length - 1 || moveHistory.length === 0) && styles.buttonDisabled]}
          onPress={goToLastMove}
          disabled={currentMoveIndex === moveHistory.length - 1 || moveHistory.length === 0}
        >
          <Text style={styles.buttonText}>Last</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 16
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  resetButton: {
    padding: 8
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16
  },
  status: {
    textAlign: 'center',
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#fff'
  },
  boardContainer: {
    width: '100%',
    aspectRatio: 1
  },
  boardRow: {
    flexDirection: 'row',
    flex: 1
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#00000088'
  },
  piece: {
    fontSize: 28
  },
  historyContainer: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f5f5f5'
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  historyItem: {
    padding: 8,
    margin: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '45%'
  },
  currentMove: {
    backgroundColor: '#64B5F6'
  },
  historyText: {
    fontSize: 14
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});