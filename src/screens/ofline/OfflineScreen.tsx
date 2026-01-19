

// ========================================
// FILE 3: src/screens/OfflineChessScreen.tsx
// ========================================

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useChessGame } from './useChessGame';

const BOARD_SIZE = 10;
const { width } = Dimensions.get('window');
const SQUARE_SIZE = (width - 40) / BOARD_SIZE;

const OfflineChessScreen1 = ({ navigation }: any) => {
  const {
    board,
    selectedPosition,
    possibleMoves,
    gameStatus,
    moveHistory,
    currentMoveIndex,
    initializeBoard,
    handleSquareTap,
    getSquareColor,
  } = useChessGame();

  useEffect(() => {
    initializeBoard();
  }, []);

  const resetGame = () => {
    Alert.alert('Reset Game', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', onPress: initializeBoard },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>DYNAMO CHESS</Text>
        <TouchableOpacity onPress={resetGame}>
          <Text style={styles.headerButton}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Game Status */}
      <Text style={styles.status}>{gameStatus}</Text>

      {/* Chess Board */}
      <View style={styles.board}>
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isSelected =
              selectedPosition?.row === rowIndex && selectedPosition?.col === colIndex;
            const isPossibleMove = possibleMoves.some(
              (pos) => pos.row === rowIndex && pos.col === colIndex
            );

            return (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.square,
                  {
                    backgroundColor: getSquareColor(rowIndex, colIndex, isSelected, isPossibleMove),
                  },
                ]}
                onPress={() => handleSquareTap(rowIndex, colIndex)}
              >
                {piece && <Text style={styles.pieceSymbol}>{piece.symbol}</Text>}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Move History */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Move History:</Text>
        <ScrollView style={styles.historyScroll}>
          {moveHistory.map((move, index) => {
            const isCurrentMove = index === currentMoveIndex;
            return (
              <View
                key={index}
                style={[styles.moveItem, isCurrentMove && styles.moveItemActive]}
              >
                <Text style={[styles.moveText, isCurrentMove && styles.moveTextActive]}>
                  {index + 1}. {move.movedPiece?.name} {move.from.algebraic} → {move.to.algebraic}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 15,
    paddingTop: 50,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    color: '#fff',
    fontSize: 16,
  },
  status: {
    textAlign: 'center',
    padding: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  board: {
    width: width - 40,
    height: width - 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#000',
  },
  pieceSymbol: {
    fontSize: 30,
  },
  historyContainer: {
    flex: 1,
    padding: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyScroll: {
    flex: 1,
  },
  moveItem: {
    padding: 8,
    marginBottom: 5,
    borderRadius: 4,
  },
  moveItemActive: {
    backgroundColor: '#E3F2FD',
  },
  moveText: {
    fontSize: 14,
  },
  moveTextActive: {
    fontWeight: 'bold',
  },
});

export default OfflineChessScreen1;