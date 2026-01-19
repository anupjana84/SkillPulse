import { PieceColor, PieceType, ChessPiece, Position } from './types';

export const BOARD_SIZE = 10;

export const getSymbol = (type: PieceType, color: PieceColor): string => {
  const whiteSymbols = ['♙', '♖', '♘', '♗', '♕', '♔', '🚀'];
  const blackSymbols = ['♟', '♜', '♞', '♝', '♛', '♚', '🚀'];
  const index = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king', 'missile'].indexOf(type);
  return color === 'white' ? whiteSymbols[index] : blackSymbols[index];
};

export const positionsEqual = (a: Position, b: Position): boolean => 
  a.row === b.row && a.col === b.col;

export const isValidPosition = (row: number, col: number): boolean => 
  row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;

export const algebraicNotation = (pos: Position): string => {
  if (!isValidPosition(pos.row, pos.col)) return 'Invalid';
  const colChar = String.fromCharCode('a'.charCodeAt(0) + pos.col);
  const rowNum = BOARD_SIZE - pos.row;
  return `${colChar}${rowNum}`;
};