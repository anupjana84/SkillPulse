export type PieceColor = 'white' | 'black';
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'missile';

export interface Position {
  row: number;
  col: number;
}

export interface ChessPiece {
  color: PieceColor;
  type: PieceType;
  symbol: string;
  name: string;
  enPassantUsedCount?: number;
  justMovedThreeOrTwoSquares?: boolean;
}

export interface Move {
  from: Position;
  to: Position;
  movedPiece: ChessPiece | null;
  capturedPiece: ChessPiece | null;
}