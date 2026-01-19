// ========================================
// FILE 1: src/types/chess.tsx
// ========================================

export enum PieceColor {
    WHITE = 'white',
    BLACK = 'black',
}

export enum PieceType {
    PAWN = 'pawn',
    ROOK = 'rook',
    KNIGHT = 'knight',
    BISHOP = 'bishop',
    QUEEN = 'queen',
    KING = 'king',
    MISSILE = 'missile',
}

export class Position {
    row: number;
    col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    equals(other: Position): boolean {
        return this.row === other.row && this.col === other.col;
    }

    get algebraic(): string {
        if (this.row < 0 || this.row >= 10 || this.col < 0 || this.col >= 10) {
            return 'Invalid';
        }
        const colChar = String.fromCharCode('a'.charCodeAt(0) + this.col);
        const rowNum = 10 - this.row;
        return `${colChar}${rowNum}`;
    }
}

export class ChessPiece {
    color: PieceColor;
    type: PieceType;
    symbol: string;
    name: string;
    enPassantUsedCount: number;
    justMovedThreeOrTwoSquares: boolean;

    constructor(
        color: PieceColor,
        type: PieceType,
        enPassantUsedCount = 0,
        justMovedThreeOrTwoSquares = false
    ) {
        this.color = color;
        this.type = type;
        this.symbol = this.getSymbol(type, color);
        this.name = type;
        this.enPassantUsedCount = enPassantUsedCount;
        this.justMovedThreeOrTwoSquares = justMovedThreeOrTwoSquares;
    }

    private getSymbol(type: PieceType, color: PieceColor): string {
        const whitePieces = ['♙', '♖', '♘', '♗', '♕', '♔', '🚀'];
        const blackPieces = ['♟', '♜', '♞', '♝', '♛', '♚', '🚀'];
        const types = [
            PieceType.PAWN,
            PieceType.ROOK,
            PieceType.KNIGHT,
            PieceType.BISHOP,
            PieceType.QUEEN,
            PieceType.KING,
            PieceType.MISSILE,
        ];
        const index = types.indexOf(type);
        return color === PieceColor.WHITE ? whitePieces[index] : blackPieces[index];
    }
}

export class Move {
    from: Position;
    to: Position;
    movedPiece: ChessPiece | null;
    capturedPiece: ChessPiece | null;

    constructor(
        from: Position,
        to: Position,
        movedPiece: ChessPiece | null,
        capturedPiece: ChessPiece | null
    ) {
        this.from = from;
        this.to = to;
        this.movedPiece = movedPiece;
        this.capturedPiece = capturedPiece;
    }
}