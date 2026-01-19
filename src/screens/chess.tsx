import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  FlatList,
  ActivityIndicator,
  Image,
  BackHandler,
  ScrollView,
  SafeAreaView,
} from 'react-native';
// import { Audio } from 'expo-av';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Player {
  playerId: string;
  name: string;
  coin: number;
  profileImageUrl: string;
  playerStatus: string;
  countryicon: string;
  colour?: string;
  Rating?: number;
}

const BOARD_SIZE = 10;
const { width, height } = Dimensions.get('window');
// Calculate board size to fit screen with margins
const BOARD_WIDTH = Math.min(width * 0.95, height * 0.5);
const SQUARE_SIZE = BOARD_WIDTH / BOARD_SIZE;

// Piece images mapping
const pieceImages = {
  bp: require('../assets/images/bp2.png'),
  br: require('../assets/images/br2.png'),
  bn: require('../assets/images/bn.png'),
  bb: require('../assets/images/bb.png'),
  bq: require('../assets/images/bq2.png'),
  bk: require('../assets/images/bk2.png'),
  bm: require('../assets/images/bm.png'),
  wp: require('../assets/images/wp2.png'),
  wr: require('../assets/images/wr2.png'),
  wn: require('../assets/images/wn.png'),
  wb: require('../assets/images/wb.png'),
  wq: require('../assets/images/wq2.png'),
  wk: require('../assets/images/wk2.png'),
  wm: require('../assets/images/wm.png'),
};

// Create initial board position
const createPosition = () => {
  const position = Array(10).fill(null).map(() => Array(10).fill(''));

  // Setup pawns
  for (let i = 0; i < 10; i++) {
    position[1][i] = 'bp';
    position[8][i] = 'wp';
  }

  // Setup black pieces
  position[0] = ['br', 'bn', 'bb', 'bm', 'bq', 'bk', 'bm', 'bb', 'bn', 'br'];

  // Setup white pieces
  position[9] = ['wr', 'wn', 'wb', 'wm', 'wq', 'wk', 'wm', 'wb', 'wn', 'wr'];

  return position;
};

const ChessGame = ({ route, navigation }: any) => {
  // const { roomId, currentTime } = route.params;
  const roomId = 'randomMultiplayer';
  const currentTime = '00:00';
  const socketRef = useRef<any>(null);

  // State management
  const [position, setPosition] = useState(createPosition());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState(
    Array(10).fill(null).map(() => Array(10).fill(false))
  );
  const [kingInDanger, setKingInDanger] = useState(
    Array(10).fill(null).map(() => Array(10).fill(false))
  );
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [timer1, setTimer1] = useState('00:00');
  const [timer2, setTimer2] = useState('00:00');
  const [startGame, setStartGame] = useState(false);
  const [playerNextId, setPlayerNextId] = useState('');
  const [playerNextTurnColor, setPlayerNextTurnColor] = useState('');
  const [moveList, setMoveList] = useState([]);
  const [winData, setWinData] = useState(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState('Initializing...');
  const [currentPlayerIsWhite, setCurrentPlayerIsWhite] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(null);

  const soundRef = useRef({});

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Setup socket connection
  useEffect(() => {
    if (currentUser) {
      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser]);

  // Handle back button
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Confirm Exit',
        'Are you sure you want to leave the game? You will lose.',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            onPress: () => {
              leaveGame();
              navigation.goBack();
            },
          },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userDetail');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const connectSocket = () => {
    socketRef.current = io('YOUR_BACKEND_URL', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      timeout: 20000,
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO');
      joinRoom();
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
    });

    setupSocketListeners();
  };

  const setupSocketListeners = () => {
    const socket = socketRef.current;

    socket.on('roomJoined', (data: any) => {
      console.log('Room joined:', data.roomId);
    });

    socket.on('createPosition', (data: any) => {
      if (data?.positions?.[0]?.createPosition2 && currentUser?.id) {
        const createPosData = data.positions[0].createPosition2;
        const isCurrentUserBlack = checkIfUserIsBlack();
        const shouldReverse = data.positions[0].playerId === currentUser.id;

        setPosition(convertBackendBoard(createPosData, shouldReverse));
        setIsWhiteTurn(false);
      }
    });

    socket.on('receive_boardData', (data: any) => {
      const newPositionData = data.data.newPosition;
      const isCurrentUserBlack = checkIfUserIsBlack();

      if (isCurrentUserBlack) {
        setPosition(convertBackendBoard(newPositionData, true));
        setIsWhiteTurn(true);
      } else {
        setPosition(convertBackendBoard(newPositionData, false));
        setIsWhiteTurn(false);
      }

      setCurrentPlayerIsWhite(!isCurrentUserBlack);
      checkKingsInDanger();
    });

    socket.on('moveList', (data: any) => {
      setMoveList(data);
    });

    socket.on('updatedRoom', (data: any) => {
      setPlayers(data.players || []);
      setTimer1(convertSecondsToMinutes(data.timer1 || 0));
      setTimer2(convertSecondsToMinutes(data.timer2 || 0));
      setPlayerNextId(data.nextPlayerId);

      if (data.players?.length > 1) {
        setStartGame(true);
      }

      if (data.allBoardData?.length > 0) {
        const latestBoard = data.allBoardData[data.allBoardData.length - 1].newPosition;
        const isCurrentUserBlack = checkIfUserIsBlack();
        setPosition(convertBackendBoard(latestBoard, isCurrentUserBlack));
      }
    });

    socket.on('startGame', (data: any) => {
      setStartGame(data.start);
    });

    socket.on('nextPlayerTurn', (data: any) => {
      setPlayerNextTurnColor(data.playerColour);
      setPlayerNextId(data.playerId);
    });

    socket.on('playerWon', (data: any) => {
      setWinData(data);
      setStartGame(false);
      setGameStatus(data.playerId === currentUser.id ? 'You Win!' : 'You Lose!');
      // playGameEndSound(data.playerId === currentUser.id);

      setTimeout(() => {
        leaveGame();
        navigation.goBack();
      }, 3000);
    });
  };

  const joinRoom = () => {
    if (!currentUser?.id) return;

    const joinData = {
      playerId: currentUser.id,
      name: currentUser.name,
      coin: 200,
      profileImageUrl: 'null',
      playerStatus: 'Good',
      joinId: roomId,
      timer: currentTime,
      countryicon: currentUser.countryIcon,
    };

    socketRef.current.emit('joinRoom', joinData);
  };

  const leaveGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', {
        roomId: roomId,
        playerId: currentUser?.id,
        challengeId: 'randomMultiplayer',
      });
      socketRef.current.disconnect();
    }
  };

  const checkIfUserIsBlack = () => {
    return players.some(
      (p) => p.playerId === currentUser?.id && p.colour === 'w'
    );
  };

  const convertBackendBoard = (boardData: string[][], reverse: boolean = false): string[][] => {
    const size = boardData.length;
    let convertedBoard: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        convertedBoard[i][j] = boardData[i][j] || '';
      }
    }

    if (reverse) {
      convertedBoard = convertedBoard.reverse();
    }

    return convertedBoard;
  };

  const convertSecondsToMinutes = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const calculateValidMoves = (row, col) => {
    const newValidMoves = Array(10).fill(null).map(() => Array(10).fill(false));
    const piece = position[row][col];
    if (!piece) return newValidMoves;

    const isWhite = piece[0] === 'w';
    const pieceType = piece.substring(1);

    // Calculate moves based on piece type
    switch (pieceType) {
      case 'p':
        calculatePawnMoves(row, col, isWhite, newValidMoves);
        break;
      case 'r':
        calculateRookMoves(row, col, isWhite, newValidMoves);
        break;
      case 'n':
        calculateKnightMoves(row, col, isWhite, newValidMoves);
        break;
      case 'b':
        calculateBishopMoves(row, col, isWhite, newValidMoves);
        break;
      case 'q':
        calculateQueenMoves(row, col, isWhite, newValidMoves);
        break;
      case 'k':
        calculateKingMoves(row, col, isWhite, newValidMoves);
        break;
      case 'm':
        calculateBishopMoves(row, col, isWhite, newValidMoves);
        calculateKnightMoves(row, col, isWhite, newValidMoves);
        break;
    }

    setValidMoves(newValidMoves);
  };

  const calculatePawnMoves = (row, col, isWhite, moves) => {
    const isCurrentUserBlack = checkIfUserIsBlack();
    const direction = isCurrentUserBlack ? (isWhite ? -1 : 1) : (isWhite ? 1 : -1);

    // Single square forward
    if (row + direction >= 0 && row + direction < 10) {
      if (position[row + direction][col] === '') {
        moves[row + direction][col] = true;

        // Check starting position for 2-3 square moves
        const isStarting = isWhite
          ? (isCurrentUserBlack ? row === 8 : row === 1)
          : (isCurrentUserBlack ? row === 1 : row === 8);

        if (isStarting) {
          if (position[row + 2 * direction]?.[col] === '') {
            moves[row + 2 * direction][col] = true;
          }
          if (position[row + 3 * direction]?.[col] === '') {
            moves[row + 3 * direction][col] = true;
          }
        }
      }
    }

    // Diagonal captures
    [-1, 1].forEach((i) => {
      if (col + i >= 0 && col + i < 10 && row + direction >= 0 && row + direction < 10) {
        const target = position[row + direction][col + i];
        if (target && target[0] !== (isWhite ? 'w' : 'b')) {
          moves[row + direction][col + i] = true;
        }
      }
    });
  };

  const calculateRookMoves = (row, col, isWhite, moves) => {
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    directions.forEach(([dr, dc]) => {
      for (let i = 1; i < 10; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r < 0 || r >= 10 || c < 0 || c >= 10) break;

        if (position[r][c] === '') {
          moves[r][c] = true;
        } else {
          if (position[r][c][0] !== (isWhite ? 'w' : 'b')) {
            moves[r][c] = true;
          }
          break;
        }
      }
    });
  };

  const calculateKnightMoves = (row, col, isWhite, moves) => {
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    knightMoves.forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < 10 && c >= 0 && c < 10) {
        if (position[r][c] === '' || position[r][c][0] !== (isWhite ? 'w' : 'b')) {
          moves[r][c] = true;
        }
      }
    });
  };

  const calculateBishopMoves = (row, col, isWhite, moves) => {
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    directions.forEach(([dr, dc]) => {
      for (let i = 1; i < 10; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r < 0 || r >= 10 || c < 0 || c >= 10) break;

        if (position[r][c] === '') {
          moves[r][c] = true;
        } else {
          if (position[r][c][0] !== (isWhite ? 'w' : 'b')) {
            moves[r][c] = true;
          }
          break;
        }
      }
    });
  };

  const calculateQueenMoves = (row, col, isWhite, moves) => {
    calculateRookMoves(row, col, isWhite, moves);
    calculateBishopMoves(row, col, isWhite, moves);
  };

  const calculateKingMoves = (row, col, isWhite, moves) => {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const r = row + i;
        const c = col + j;
        if (r >= 0 && r < 10 && c >= 0 && c < 10) {
          if (position[r][c] === '' || position[r][c][0] !== (isWhite ? 'w' : 'b')) {
            moves[r][c] = true;
          }
        }
      }
    }
  };

  const checkKingsInDanger = () => {
    // Implementation for checking if kings are in danger
    // This would involve checking if any opponent piece can attack the king positions
  };

  const handleSquarePress = (row, col) => {
    const piece = position[row][col];

    if (currentUser?.id !== playerNextId) return;

    if (piece &&
      ((piece[0] === 'w' && playerNextTurnColor === 'w') ||
        (piece[0] === 'b' && playerNextTurnColor === 'b'))) {
      setSelectedSquare({ row, col });
      setSelectedPiece(piece);
      calculateValidMoves(row, col);
    } else if (selectedSquare && validMoves[row][col]) {
      movePiece(selectedSquare.row, selectedSquare.col, row, col);
    } else {
      setSelectedSquare(null);
      setValidMoves(Array(10).fill(null).map(() => Array(10).fill(false)));
    }
  };

  const movePiece = (fromRow, fromCol, toRow, toCol) => {
    const newPosition = position.map(row => [...row]);
    const isCapture = newPosition[toRow][toCol] !== '';

    newPosition[toRow][toCol] = newPosition[fromRow][fromCol];
    newPosition[fromRow][fromCol] = '';

    // Check for pawn promotion
    const movedPiece = newPosition[toRow][toCol];
    if ((movedPiece === 'wp' && toRow === 0) || (movedPiece === 'bp' && toRow === 9)) {
      setShowPromotionDialog({ row: toRow, col: toCol, color: movedPiece[0] });
    }

    setPosition(newPosition);
    setSelectedSquare(null);
    setValidMoves(Array(10).fill(null).map(() => Array(10).fill(false)));

    // Emit move to server
    const reversedBoard = newPosition.slice().reverse();
    socketRef.current?.emit('boardUpdate', {
      roomId: roomId,
      boardData: { newPosition: reversedBoard },
      playerId: currentUser?.id,
      move: generateMoveNotation(fromRow, fromCol, toRow, toCol, isCapture),
    });
  };

  const generateMoveNotation = (fromRow, fromCol, toRow, toCol, isCapture) => {
    const files = 'abcdefghij';
    const from = `${files[fromCol]}${10 - fromRow}`;
    const to = `${files[toCol]}${10 - toRow}`;
    return isCapture ? `${from}x${to}` : to;
  };

  const promotePawn = (pieceType) => {
    if (!showPromotionDialog) return;

    const newPosition = position.map(row => [...row]);
    newPosition[showPromotionDialog.row][showPromotionDialog.col] =
      `${showPromotionDialog.color}${pieceType}`;

    setPosition(newPosition);
    setShowPromotionDialog(null);
  };

  const renderSquare = (row, col) => {
    const piece = position[row][col];
    const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
    const isValid = validMoves[row][col];
    const isDanger = kingInDanger[row][col];

    let backgroundColor = (row + col) % 2 === 0 ? '#DCDA5C' : '#4CAF50';
    if (isDanger) backgroundColor = '#FF0000';
    else if (isSelected) backgroundColor = '#FFEB3B';
    else if (isValid) backgroundColor = '#8BC34A';

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[styles.square, { backgroundColor }]}
        onPress={() => handleSquarePress(row, col)}
      >
        {piece && pieceImages[piece] && (
          <Image source={pieceImages[piece]} style={styles.piece} />
        )}
      </TouchableOpacity>
    );
  };

  const renderBoard = () => {
    const board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        board.push(renderSquare(row, col));
      }
    }
    return board;
  };

  const renderPlayerInfo = (player, timer, isCurrentTurn) => {
    const playerName = player?.name?.substring(0, 15) || 'Anonymous';

    return (
      <View style={styles.playerInfo}>
        <View style={styles.playerRow}>
          <View
            style={[
              styles.turnIndicator,
              { backgroundColor: isCurrentTurn ? '#4CAF50' : '#9E9E9E' },
            ]}
          />
          <Text style={styles.playerName} numberOfLines={1}>{playerName}</Text>
          {player?.Rating && (
            <Text style={styles.rating}>({player.Rating.toFixed(0)})</Text>
          )}
        </View>
        <Text style={styles.timer}>{timer}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const currentPlayerIsBlack = checkIfUserIsBlack();
  const topPlayer = players.find(p => p.colour === (currentPlayerIsBlack ? 'w' : 'b'));
  const bottomPlayer = players.find(p => p.colour === (currentPlayerIsBlack ? 'b' : 'w'));
  const topTimer = currentPlayerIsBlack ? timer2 : timer1;
  const bottomTimer = currentPlayerIsBlack ? timer1 : timer2;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {isWhiteTurn ? "White's Turn" : "Black's Turn"}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderPlayerInfo(topPlayer, topTimer, playerNextId === topPlayer?.playerId)}

          <View style={styles.boardContainer}>
            <View style={styles.board}>{renderBoard()}</View>

            {!startGame && !winData && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  {players.length < 2
                    ? 'Waiting for Opponent...'
                    : 'Starting Game...'}
                </Text>
              </View>
            )}

            {winData && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>{gameStatus}</Text>
              </View>
            )}
          </View>

          {renderPlayerInfo(bottomPlayer, bottomTimer, playerNextId === bottomPlayer?.playerId)}

          <View style={styles.moveHistory}>
            <Text style={styles.moveHistoryTitle}>Moves</Text>
            <FlatList
              horizontal
              data={moveList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.moveItem}>
                  <Text style={styles.moveText}>{item}</Text>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </ScrollView>

        {showPromotionDialog && (
          <View style={styles.promotionOverlay}>
            <View style={styles.promotionDialog}>
              <Text style={styles.promotionTitle}>Promote Pawn</Text>
              <View style={styles.promotionOptions}>
                {['q', 'r', 'b', 'n'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => promotePawn(type)}
                    style={styles.promotionOption}
                  >
                    <Image
                      source={pieceImages[`${showPromotionDialog.color}${type}`]}
                      style={styles.promotionPiece}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#263238',
  },
  container: {
    flex: 1,
    backgroundColor: '#263238',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#263238',
  },
  header: {
    padding: 12,
    backgroundColor: '#37474F',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#37474F',
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  turnIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
    flex: 1,
  },
  rating: {
    color: '#B0BEC5',
    fontSize: 11,
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  boardContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginVertical: 8,
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  board: {
    width: BOARD_WIDTH,
    height: BOARD_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  piece: {
    width: SQUARE_SIZE * 0.8,
    height: SQUARE_SIZE * 0.8,
    resizeMode: 'contain',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#37474F',
    borderRadius: 8,
    overflow: 'hidden',
  },
  moveHistory: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#37474F',
    marginHorizontal: 10,
    marginTop: 4,
    borderRadius: 8,
    maxHeight: 80,
  },
  moveHistoryTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  moveItem: {
    backgroundColor: '#546E7A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 6,
  },
  moveText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  promotionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionDialog: {
    backgroundColor: '#37474F',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  promotionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  promotionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promotionOption: {
    marginHorizontal: 10,
  },
  promotionPiece: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});

export default ChessGame;