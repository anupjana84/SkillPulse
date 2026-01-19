

// ========================================
// FILE 2: src/hooks/useChessGame.tsx
// ========================================

import { useState } from 'react';
import { ChessPiece, PieceColor, PieceType, Position, Move } from './chess';

const BOARD_SIZE = 10;

export const useChessGame = () => {
    const [board, setBoard] = useState<(ChessPiece | null)[][]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<PieceColor>(PieceColor.WHITE);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
    const [gameStatus, setGameStatus] = useState("White's turn");
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

    const initializeBoard = () => {
        const newBoard: (ChessPiece | null)[][] = Array(BOARD_SIZE)
            .fill(null)
            .map(() => Array(BOARD_SIZE).fill(null));

        // Pawns
        for (let i = 0; i < BOARD_SIZE; i++) {
            newBoard[1][i] = new ChessPiece(PieceColor.BLACK, PieceType.PAWN);
            newBoard[BOARD_SIZE - 2][i] = new ChessPiece(PieceColor.WHITE, PieceType.PAWN);
        }

        // Back row pieces
        const blackOrder = [
            PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.MISSILE,
            PieceType.QUEEN, PieceType.KING, PieceType.MISSILE, PieceType.BISHOP,
            PieceType.KNIGHT, PieceType.ROOK,
        ];
        const whiteOrder = [
            PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.MISSILE,
            PieceType.KING, PieceType.QUEEN, PieceType.MISSILE, PieceType.BISHOP,
            PieceType.KNIGHT, PieceType.ROOK,
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

    const isValidPosition = (row: number, col: number): boolean => {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    };

    const getPawnMoves = (
        row: number,
        col: number,
        color: PieceColor,
        moves: Position[],
        testBoard: (ChessPiece | null)[][]
    ) => {
        const direction = color === PieceColor.WHITE ? -1 : 1;

        if (isValidPosition(row + direction, col) && !testBoard[row + direction][col]) {
            moves.push(new Position(row + direction, col));

            const isStartingWhite = row === BOARD_SIZE - 2 || row === BOARD_SIZE - 3;
            const isStartingBlack = row === 1 || row === 2;

            if (
                (color === PieceColor.WHITE && isStartingWhite) ||
                (color === PieceColor.BLACK && isStartingBlack)
            ) {
                if (
                    isValidPosition(row + 2 * direction, col) &&
                    !testBoard[row + 2 * direction][col]
                ) {
                    moves.push(new Position(row + 2 * direction, col));
                }
                if (
                    isValidPosition(row + 3 * direction, col) &&
                    !testBoard[row + 3 * direction][col]
                ) {
                    moves.push(new Position(row + 3 * direction, col));
                }
            }
        }

        for (const colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            if (
                newCol >= 0 &&
                newCol < BOARD_SIZE &&
                isValidPosition(row + direction, newCol)
            ) {
                const target = testBoard[row + direction][newCol];
                if (target && target.color !== color) {
                    moves.push(new Position(row + direction, newCol));
                }
            }
        }
    };

    const getSlidingMoves = (
        row: number,
        col: number,
        color: PieceColor,
        directions: number[][],
        moves: Position[],
        testBoard: (ChessPiece | null)[][]
    ) => {
        for (const [dRow, dCol] of directions) {
            for (let i = 1; i < BOARD_SIZE; i++) {
                const newRow = row + dRow * i;
                const newCol = col + dCol * i;
                if (!isValidPosition(newRow, newCol)) break;
                const piece = testBoard[newRow][newCol];
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
    };

    const getPossibleMoves = (
        row: number,
        col: number,
        testBoard: (ChessPiece | null)[][]
    ): Position[] => {
        const piece = testBoard[row][col];
        if (!piece) return [];

        const moves: Position[] = [];

        switch (piece.type) {
            case PieceType.PAWN:
                getPawnMoves(row, col, piece.color, moves, testBoard);
                break;

            case PieceType.ROOK:
                getSlidingMoves(row, col, piece.color, [[1, 0], [-1, 0], [0, 1], [0, -1]], moves, testBoard);
                break;

            case PieceType.KNIGHT:
                const knightMoves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
                for (const [dRow, dCol] of knightMoves) {
                    const newRow = row + dRow;
                    const newCol = col + dCol;
                    if (isValidPosition(newRow, newCol)) {
                        const targetPiece = testBoard[newRow][newCol];
                        if (!targetPiece || targetPiece.color !== piece.color) {
                            moves.push(new Position(newRow, newCol));
                        }
                    }
                }
                break;

            case PieceType.BISHOP:
                getSlidingMoves(row, col, piece.color, [[1, 1], [1, -1], [-1, 1], [-1, -1]], moves, testBoard);
                break;

            case PieceType.QUEEN:
                getSlidingMoves(
                    row, col, piece.color,
                    [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
                    moves, testBoard
                );
                break;

            case PieceType.KING:
                for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
                    for (let colOffset = -1; colOffset <= 1; colOffset++) {
                        if (rowOffset === 0 && colOffset === 0) continue;
                        const newRow = row + rowOffset;
                        const newCol = col + colOffset;
                        if (isValidPosition(newRow, newCol)) {
                            const targetPiece = testBoard[newRow][newCol];
                            if (!targetPiece || targetPiece.color !== piece.color) {
                                moves.push(new Position(newRow, newCol));
                            }
                        }
                    }
                }
                break;

            case PieceType.MISSILE:
                getSlidingMoves(row, col, piece.color, [[1, 1], [1, -1], [-1, 1], [-1, -1]], moves, testBoard);
                const missileMoves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
                for (const [dRow, dCol] of missileMoves) {
                    const newRow = row + dRow;
                    const newCol = col + dCol;
                    if (isValidPosition(newRow, newCol)) {
                        const targetPiece = testBoard[newRow][newCol];
                        if (!targetPiece || targetPiece.color !== piece.color) {
                            moves.push(new Position(newRow, newCol));
                        }
                    }
                }
                break;
        }

        return moves;
    };

    const isKingInCheck = (
        testBoard: (ChessPiece | null)[][],
        color: PieceColor
    ): boolean => {
        let kingPos: Position | null = null;

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
                    if (moves.some((m) => m.equals(kingPos!))) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const getValidMoves = (row: number, col: number): Position[] => {
        const piece = board[row][col];
        if (!piece) return [];

        const rawMoves = getPossibleMoves(row, col, board);
        const validMoves: Position[] = [];

        for (const move of rawMoves) {
            const testBoard = board.map((r) => [...r]);
            const capturedPiece = testBoard[move.row][move.col];
            testBoard[move.row][move.col] = piece;
            testBoard[row][col] = null;

            if (!isKingInCheck(testBoard, piece.color)) {
                validMoves.push(move);
            }
        }

        return validMoves;
    };

    const checkPawnPromotion = (
        newBoard: (ChessPiece | null)[][],
        row: number,
        col: number
    ) => {
        const piece = newBoard[row][col];
        if (piece?.type === PieceType.PAWN && (row === 0 || row === BOARD_SIZE - 1)) {
            newBoard[row][col] = new ChessPiece(piece.color, PieceType.MISSILE);
            setGameStatus('Pawn promoted to Missile!');
        }
    };

    const checkMissileCaptureWin = (newBoard: (ChessPiece | null)[][]) => {
        let whiteMissiles = 0;
        let blackMissiles = 0;

        for (const row of newBoard) {
            for (const piece of row) {
                if (piece?.type === PieceType.MISSILE) {
                    if (piece.color === PieceColor.WHITE) whiteMissiles++;
                    else blackMissiles++;
                }
            }
        }

        if (whiteMissiles === 0) {
            setGameStatus('Black wins by capturing both Missiles!');
        } else if (blackMissiles === 0) {
            setGameStatus('White wins by capturing both Missiles!');
        }
    };

    const movePiece = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
        const newBoard = board.map((row) => [...row]);
        const movingPiece = newBoard[fromRow][fromCol];
        const capturedPiece = newBoard[toRow][toCol];

        const move = new Move(
            new Position(fromRow, fromCol),
            new Position(toRow, toCol),
            movingPiece,
            capturedPiece
        );
        setMoveHistory([...moveHistory, move]);
        setCurrentMoveIndex(moveHistory.length);

        if (movingPiece && movingPiece.type === PieceType.PAWN) {
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
        setBoard(newBoard);
        setSelectedPosition(null);
        setPossibleMoves([]);

        const nextPlayer = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
        setCurrentPlayer(nextPlayer);

        checkPawnPromotion(newBoard, toRow, toCol);
        checkMissileCaptureWin(newBoard);
    };

    const handleSquareTap = (row: number, col: number) => {
        const piece = board[row][col];

        if (currentMoveIndex !== moveHistory.length - 1) {
            setGameStatus('Return to present to make a new move.');
            return;
        }

        if (piece && piece.color === currentPlayer) {
            setSelectedPosition(new Position(row, col));
            const moves = getValidMoves(row, col);
            setPossibleMoves(moves);
            setGameStatus(`Selected: ${piece.name}`);
        } else if (selectedPosition) {
            const moveValid = possibleMoves.some((pos) => pos.row === row && pos.col === col);
            if (moveValid) {
                movePiece(selectedPosition.row, selectedPosition.col, row, col);
            }
        }
    };

    const getSquareColor = (
        row: number,
        col: number,
        isSelected: boolean,
        isPossibleMove: boolean
    ): string => {
        if (isSelected) return '#64B5F6';
        if (isPossibleMove) return '#90CAF9';

        const piece = board[row][col];
        if (
            piece?.type === PieceType.KING &&
            piece?.color === currentPlayer &&
            isKingInCheck(board, piece.color)
        ) {
            return '#FF5252';
        }

        return (row + col) % 2 === 0 ? '#DCDA5C' : '#4CAF50';
    };

    return {
        board,
        currentPlayer,
        selectedPosition,
        possibleMoves,
        gameStatus,
        moveHistory,
        currentMoveIndex,
        initializeBoard,
        handleSquareTap,
        getSquareColor,
    };
};