import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, Text, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import {
    PieceColor,
    PieceType,
    ChessPiece,
    Move,
    Position,
} from './types';
import { BOARD_SIZE, getSymbol, positionsEqual, isValidPosition, algebraicNotation } from './utils';
import { ChessPieceComponent } from './ChessPiece';

interface ChessBoardProps {
    onStatusChange: (status: string) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ onStatusChange }) => {
    const [board, setBoard] = useState<(ChessPiece | null)[][]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [gameStatus, setGameStatus] = useState("White's turn");

    // Initialize board
    const initializeBoard = useCallback(() => {
        const newBoard = Array(BOARD_SIZE)
            .fill(null)
            .map(() => Array(BOARD_SIZE).fill(null)) as (ChessPiece | null)[][];

        // Pawns
        for (let i = 0; i < BOARD_SIZE; i++) {
            newBoard[1][i] = createPiece('black', 'pawn');
            newBoard[BOARD_SIZE - 2][i] = createPiece('white', 'pawn');
        }

        const blackOrder: PieceType[] = [
            'rook', 'knight', 'bishop', 'missile', 'queen', 'king', 'missile', 'bishop', 'knight', 'rook'
        ];
        const whiteOrder: PieceType[] = [
            'rook', 'knight', 'bishop', 'missile', 'king', 'queen', 'missile', 'bishop', 'knight', 'rook'
        ];

        for (let i = 0; i < BOARD_SIZE; i++) {
            newBoard[0][i] = createPiece('black', blackOrder[i]);
            newBoard[BOARD_SIZE - 1][i] = createPiece('white', whiteOrder[i]);
        }

        setBoard(newBoard);
        setCurrentPlayer('white');
        setSelectedPosition(null);
        setPossibleMoves([]);
        setMoveHistory([]);
        setCurrentMoveIndex(-1);
        setGameStatus("White's turn");
    }, []);

    const createPiece = (color: PieceColor, type: PieceType, history?: {
        enPassantUsedCount: number;
        justMovedThreeOrTwoSquares: boolean;
    }): ChessPiece => ({
        color,
        type,
        symbol: getSymbol(type, color),
        name: type.charAt(0).toUpperCase() + type.slice(1),
        ...(history || { enPassantUsedCount: 0, justMovedThreeOrTwoSquares: false }),
    });

    useEffect(() => {
        initializeBoard();
    }, [initializeBoard]);

    // ========== Game Logic ==========
    const isKingInCheck = (color: PieceColor): boolean => {
        let kingPos: Position | null = null;
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = board[row][col];
                if (piece?.type === 'king' && piece.color === color) {
                    kingPos = { row, col };
                    break;
                }
            }
            if (kingPos) break;
        }
        if (!kingPos) return false;

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = board[row][col];
                if (piece && piece.color !== color) {
                    const moves = getPossibleMoves(row, col);
                    if (moves.some(move => positionsEqual(move, kingPos!))) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const isKingInCheckAtPosition = (row: number, col: number): boolean => {
        const piece = board[row][col];
        return !!(
            piece?.type === 'king' &&
            piece.color === currentPlayer &&
            isKingInCheck(piece.color)
        );
    };

    const getPossibleMoves = (row: number, col: number): Position[] => {
        const piece = board[row][col];
        if (!piece) return [];

        const moves: Position[] = [];

        switch (piece.type) {
            case 'pawn':
                getPawnMoves(row, col, piece.color, moves);
                break;
            case 'rook':
                getRookMoves(row, col, piece.color, moves);
                break;
            case 'knight':
                getKnightMoves(row, col, piece.color, moves);
                break;
            case 'bishop':
                getBishopMoves(row, col, piece.color, moves);
                break;
            case 'queen':
                getQueenMoves(row, col, piece.color, moves);
                break;
            case 'king':
                getKingMoves(row, col, piece.color, moves);
                break;
            case 'missile':
                getMissileMoves(row, col, piece.color, moves);
                break;
        }
        return moves;
    };

    const getValidMoves = (row: number, col: number): Position[] => {
        const piece = board[row][col];
        if (!piece) return [];

        const rawMoves = getPossibleMoves(row, col);
        const validMoves: Position[] = [];

        for (const move of rawMoves) {
            const capturedPiece = board[move.row][move.col];
            const newBoard = board.map(r => [...r]);
            newBoard[move.row][move.col] = piece;
            newBoard[row][col] = null;

            // Temporarily set board to check king safety
            const originalBoard = board;
            setBoard(newBoard);
            const inCheck = isKingInCheck(piece.color);
            setBoard(originalBoard);

            if (!inCheck) {
                validMoves.push(move);
            }
        }
        return validMoves;
    };

    // --- Movement Helpers ---
    const getSlidingMoves = (
        row: number,
        col: number,
        color: PieceColor,
        directions: number[][],
        moves: Position[]
    ) => {
        for (const [dr, dc] of directions) {
            for (let i = 1; i < BOARD_SIZE; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                if (!isValidPosition(newRow, newCol)) break;
                const piece = board[newRow][newCol];
                if (!piece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (piece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }
    };

    const getPawnMoves = (row: number, col: number, color: PieceColor, moves: Position[]) => {
        const direction = color === 'white' ? -1 : 1;
        const forwardRow = row + direction;

        if (isValidPosition(forwardRow, col) && !board[forwardRow][col]) {
            moves.push({ row: forwardRow, col });
            const isStartingWhite = row === BOARD_SIZE - 2 || row === BOARD_SIZE - 3;
            const isStartingBlack = row === 1 || row === 2;

            if ((color === 'white' && isStartingWhite) || (color === 'black' && isStartingBlack)) {
                const doubleRow = row + 2 * direction;
                if (isValidPosition(doubleRow, col) && !board[doubleRow][col]) {
                    moves.push({ row: doubleRow, col });
                }
                const tripleRow = row + 3 * direction;
                if (isValidPosition(tripleRow, col) && !board[tripleRow][col]) {
                    moves.push({ row: tripleRow, col });
                }
            }
        }

        // Captures & en passant
        for (const colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            if (newCol >= 0 && newCol < BOARD_SIZE && isValidPosition(forwardRow, newCol)) {
                const target = board[forwardRow][newCol];
                if (target && target.color !== color) {
                    moves.push({ row: forwardRow, col: newCol });
                }
            }
        }

        // En passant
        for (const colOffset of [-1, 1]) {
            const adjCol = col + colOffset;
            if (adjCol >= 0 && adjCol < BOARD_SIZE) {
                const enemyPawn = board[row][adjCol];
                if (
                    enemyPawn?.type === 'pawn' &&
                    enemyPawn.color !== color &&
                    enemyPawn.justMovedThreeOrTwoSquares
                ) {
                    const enPassantRow = row + direction;
                    const enPassantCol = adjCol;
                    if (isValidPosition(enPassantRow, enPassantCol) && !board[enPassantRow][enPassantCol]) {
                        moves.push({ row: enPassantRow, col: enPassantCol });
                    }
                }
            }
        }
    };

    const getRookMoves = (row: number, col: number, color: PieceColor, moves: Position[]) => {
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        getSlidingMoves(row, col, color, directions, moves);
    };

    const getKnightMoves = (row: number, col: number, color: PieceColor, moves: Position[]) => {
        const knightOffsets = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2]
        ];
        for (const [dr, dc] of knightOffsets) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (isValidPosition(newRow, newCol)) {
                const piece = board[newRow][newCol];
                if (!piece || piece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    };

    const getBishopMoves = (row: number, col: number, color: PieceColor, moves: Position[]) => {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        getSlidingMoves(row, col, color, directions, moves);
    };

    const getQueenMoves = (row: number, col: number, color: PieceColor, moves: Position[]) => {
        const directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        getSlidingMoves(row, col, color, directions, moves);
    };

    const getKingMoves = (row: number, col: number, color: PieceColor, moves: Position[]) => {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (isValidPosition(newRow, newCol)) {
                    const piece = board[newRow][newCol];
                    if (!piece || piece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        checkCastling(row, col, color, moves);
    };

    const checkCastling = (row: number, col: number, color: PieceColor, moves: Position[]) => {
        const rank = color === 'white' ? BOARD_SIZE - 1 : 0;
        if (row !== rank) return;

        // Kingside
        if (
            !board[row][col + 1] &&
            !board[row][col + 2] &&
            board[row][col + 3]?.type === 'rook' &&
            board[row][col + 3]?.color === color
        ) {
            moves.push({ row, col: col + 3 });
        }

        // Queenside
        if (
            !board[row][col - 1] &&
            !board[row][col - 2] &&
            !board[row][col - 3] &&
            board[row][col - 4]?.type === 'rook' &&
            board[row][col - 4]?.color === color
        ) {
            moves.push({ row, col: col - 4 });
        }
    };

    const getMissileMoves = (row: number, col: number, color: PieceColor, moves: Position[]) => {
        const bishopDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        getSlidingMoves(row, col, color, bishopDirs, moves);

        const knightOffsets = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2]
        ];
        for (const [dr, dc] of knightOffsets) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (isValidPosition(newRow, newCol)) {
                const piece = board[newRow][newCol];
                if (!piece || piece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    };

    // --- Move Execution ---
    const movePiece = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
        setBoard(prev => {
            const newBoard = prev.map(r => [...r]);
            const movingPiece = newBoard[fromRow][fromCol];
            const capturedPiece = newBoard[toRow][toCol];

            if (movingPiece?.type === 'pawn') {
                const distance = Math.abs(fromRow - toRow);
                const justMoved = distance === 2 || distance === 3;
                newBoard[toRow][toCol] = createPiece(
                    movingPiece.color,
                    movingPiece.type,
                    {
                        enPassantUsedCount: movingPiece.enPassantUsedCount ?? 0,
                        justMovedThreeOrTwoSquares: justMoved,
                    }
                );
            } else {
                newBoard[toRow][toCol] = movingPiece;
            }
            newBoard[fromRow][fromCol] = null;

            return newBoard;
        });

        const newMove: Move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            movedPiece: board[fromRow][fromCol],
            capturedPiece: board[toRow][toCol],
        };

        setMoveHistory(prev => [...prev.slice(0, currentMoveIndex + 1), newMove]);
        setCurrentMoveIndex(prev => prev + 1);
        setCurrentPlayer(prev => (prev === 'white' ? 'black' : 'white'));
        setSelectedPosition(null);
        setPossibleMoves([]);

        checkPawnPromotion(toRow, toCol);
        checkMissileCaptureWin();
        checkMissileMate();
        playMoveSound();
    };

    const checkPawnPromotion = (row: number, col: number) => {
        setBoard(prev => {
            const newBoard = prev.map(r => [...r]);
            const piece = newBoard[row][col];
            if (piece?.type === 'pawn' && (row === 0 || row === BOARD_SIZE - 1)) {
                newBoard[row][col] = createPiece(piece.color, 'missile');
                setGameStatus('Pawn promoted to Missile!');
            }
            return newBoard;
        });
    };

    const checkMissileCaptureWin = () => {
        let whiteMissiles = 0;
        let blackMissiles = 0;
        board.forEach(row => {
            row.forEach(piece => {
                if (piece?.type === 'missile') {
                    if (piece.color === 'white') whiteMissiles++;
                    else blackMissiles++;
                }
            });
        });

        if (whiteMissiles === 0) {
            setGameStatus('Black wins by capturing both Missiles!');
        } else if (blackMissiles === 0) {
            setGameStatus('White wins by capturing both Missiles!');
        }
    };

    const checkMissileMate = () => {
        let missile: ChessPiece | null = null;
        let missilePos: Position | null = null;
        let enemyKing: ChessPiece | null = null;
        let enemyKingPos: Position | null = null;

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const piece = board[r][c];
                if (piece) {
                    if (piece.type === 'missile') {
                        missile = piece;
                        missilePos = { row: r, col: c };
                    } else if (piece.type === 'king') {
                        enemyKing = piece;
                        enemyKingPos = { row: r, col: c };
                    }
                }
            }
        }

        if (missile && enemyKing && missilePos && enemyKingPos) {
            const isCorner =
                (enemyKingPos.row === 0 || enemyKingPos.row === BOARD_SIZE - 1) &&
                (enemyKingPos.col === 0 || enemyKingPos.col === BOARD_SIZE - 1);
            const distance = Math.abs(missilePos.row - enemyKingPos.row) +
                Math.abs(missilePos.col - enemyKingPos.col);
            if (isCorner && distance <= 2) {
                const winner = missile.color === 'white' ? 'White' : 'Black';
                setGameStatus(`${winner} wins with Missile Mate!`);
            }
        }
    };

    const playMoveSound = async () => {
        try {
            const sound = new Audio.Sound();
            await sound.loadAsync(require('../assets/sound/move.mp3'));
            await sound.playAsync();
            setTimeout(() => sound.unloadAsync(), 1000);
        } catch (e) {
            console.warn('Sound error:', e);
        }
    };

    // --- UI Handlers ---
    const handleTap = (row: number, col: number) => {
        if (currentMoveIndex !== moveHistory.length - 1) {
            setGameStatus('Return to present to make a new move.');
            return;
        }

        const piece = board[row][col];
        if (piece && piece.color === currentPlayer) {
            const moves = getValidMoves(row, col);
            setSelectedPosition({ row, col });
            setPossibleMoves(moves);
            setGameStatus(`Selected: ${piece.name}`);
        } else if (selectedPosition) {
            const isValid = possibleMoves.some(p => positionsEqual(p, { row, col }));
            if (isValid) {
                movePiece(selectedPosition.row, selectedPosition.col, row, col);
            }
        }
    };

    const resetGame = () => {
        initializeBoard();
    };

    // --- Move History Navigation ---
    const goToPreviousMove = () => {
        if (currentMoveIndex <= 0) return;
        const lastMove = moveHistory[currentMoveIndex];
        setBoard(prev => {
            const newBoard = prev.map(r => [...r]);
            newBoard[lastMove.from.row][lastMove.from.col] = lastMove.movedPiece;
            newBoard[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;
            return newBoard;
        });
        setCurrentMoveIndex(prev => prev - 1);
        setCurrentPlayer(prev => (prev === 'white' ? 'black' : 'white'));
        setGameStatus('Viewing past move.');
    };

    const goToNextMove = () => {
        if (currentMoveIndex >= moveHistory.length - 1) return;
        const nextMove = moveHistory[currentMoveIndex + 1];
        setBoard(prev => {
            const newBoard = prev.map(r => [...r]);
            newBoard[nextMove.to.row][nextMove.to.col] = nextMove.movedPiece;
            newBoard[nextMove.from.row][nextMove.from.col] = null;
            return newBoard;
        });
        setCurrentMoveIndex(prev => prev + 1);
        setCurrentPlayer(prev => (prev === 'white' ? 'black' : 'white'));
        setGameStatus('Viewing past move.');
    };

    const goToMove = (index: number) => {
        while (currentMoveIndex > index) goToPreviousMove();
        while (currentMoveIndex < index) goToNextMove();
    };

    const goToLastMove = () => {
        goToMove(moveHistory.length - 1);
    };

    // --- UI Helpers ---
    const getSquareColor = (row: number, col: number, isSelected: boolean, isPossible: boolean): string => {
        if (isSelected) return '#4285F4';
        if (isPossible) return '#BBDEFB';
        if (isKingInCheckAtPosition(row, col)) return '#FF5252';
        return (row + col) % 2 === 0 ? '#DCDA5C' : '#4CAF50';
    };

    const renderSquare = (row: number, col: number) => {
        const piece = board[row]?.[col];
        const isSelected = selectedPosition && positionsEqual(selectedPosition, { row, col });
        const isPossible = possibleMoves.some(p => positionsEqual(p, { row, col }));

        return (
            <Pressable
                key={`${row}-${col}`}
                style={[
                    styles.square,
                    { backgroundColor: getSquareColor(row, col, !!isSelected, isPossible) },
                ]}
                onPress={() => handleTap(row, col)}
            >
                {piece && <ChessPieceComponent piece={piece} style={styles.piece} />}
            </Pressable>
        );
    };

    // Sync status
    useEffect(() => {
        onStatusChange(gameStatus);
    }, [gameStatus, onStatusChange]);

    return (
        <View style={styles.container}>
            <View style={styles.board}>
                {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) =>
                    renderSquare(Math.floor(i / BOARD_SIZE), i % BOARD_SIZE)
                )}
            </View>

            {/* Move History Panel */}
            <View style={styles.historyPanel}>
                <Text style={styles.historyTitle}>Move History:</Text>
                <View style={styles.historyList}>
                    {moveHistory.map((move, index) => {
                        const isCurrent = index === currentMoveIndex;
                        const notation = `${index + 1}. ${move.movedPiece?.name || ''} ${move.from.row}${move.from.col}→${move.to.row}${move.to.col}`;
                        return (
                            <Pressable key={index} onPress={() => goToMove(index)}>
                                <Text style={[styles.historyItem, isCurrent && styles.historyCurrent]}>
                                    {notation}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
                <View style={styles.navButtons}>
                    <Pressable
                        style={[styles.navButton, currentMoveIndex <= 0 && styles.navButtonDisabled]}
                        onPress={goToPreviousMove}
                        disabled={currentMoveIndex <= 0}
                    >
                        <Text style={styles.navButtonText}>◀ Previous</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.navButton, currentMoveIndex >= moveHistory.length - 1 && styles.navButtonDisabled]}
                        onPress={goToNextMove}
                        disabled={currentMoveIndex >= moveHistory.length - 1}
                    >
                        <Text style={styles.navButtonText}>Next ▶</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.navButton, moveHistory.length === 0 && styles.navButtonDisabled]}
                        onPress={goToLastMove}
                        disabled={moveHistory.length === 0}
                    >
                        <Text style={styles.navButtonText}>Last</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', padding: 10 },
    board: {
        width: Math.min(Dimensions.get('window').width - 40, 400),
        height: Math.min(Dimensions.get('window').width - 40, 400),
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 1,
        borderColor: '#333',
    },
    square: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#333',
    },
    piece: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },
    historyPanel: {
        marginTop: 16,
        width: '100%',
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    historyList: {
        maxHeight: 150,
    },
    historyItem: {
        padding: 4,
        fontSize: 14,
    },
    historyCurrent: {
        fontWeight: 'bold',
        backgroundColor: '#E3F2FD',
    },
    navButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 10,
    },
    navButton: {
        backgroundColor: '#1976D2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    navButtonDisabled: {
        backgroundColor: '#90A4AE',
    },
    navButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ChessBoard;