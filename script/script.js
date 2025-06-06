document.addEventListener('DOMContentLoaded', function() {
            // Game state
            const gameState = {
                board: [],
                selectedSquare: null,
                currentTurn: 'white',
                quantumMode: false,
                splitMode: false,
                entangleMode: false,
                firstEntanglePiece: null,
                quantumPieces: [],
                moveHistory: [],
                showProbabilities: false
            };

            // DOM elements
            const boardElement = document.getElementById('board');
            const currentTurnElement = document.getElementById('current-turn');
            const gamePhaseElement = document.getElementById('game-phase');
            const selectedPieceElement = document.getElementById('selected-piece');
            const quantumCountElement = document.getElementById('quantum-count');
            const moveHistoryElement = document.getElementById('move-history');
            const newGameButton = document.getElementById('new-game');
            const collapseButton = document.getElementById('collapse');
            const showProbabilitiesButton = document.getElementById('show-probabilities');
            const quantumSplitButton = document.getElementById('quantum-split');
            const quantumEntangleButton = document.getElementById('quantum-entangle');

            // Initialize the board
            function initializeBoard() {
                boardElement.innerHTML = '';
                gameState.board = Array(8).fill().map(() => Array(8).fill(null));
                gameState.selectedSquare = null;
                gameState.currentTurn = 'white';
                gameState.quantumMode = false;
                gameState.splitMode = false;
                gameState.entangleMode = false;
                gameState.firstEntanglePiece = null;
                gameState.quantumPieces = [];
                gameState.moveHistory = [];
                gameState.showProbabilities = false;

                // Set up pawns
                for (let col = 0; col < 8; col++) {
                    gameState.board[1][col] = { type: 'pawn', color: 'black', quantum: false };
                    gameState.board[6][col] = { type: 'pawn', color: 'white', quantum: false };
                }

                // Set up other pieces
                const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
                for (let col = 0; col < 8; col++) {
                    gameState.board[0][col] = { type: pieceOrder[col], color: 'black', quantum: false };
                    gameState.board[7][col] = { type: pieceOrder[col], color: 'white', quantum: false };
                }

                // Create board UI
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const square = document.createElement('div');
                        square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                        square.dataset.row = row;
                        square.dataset.col = col;
                        square.addEventListener('click', () => handleSquareClick(row, col));
                        boardElement.appendChild(square);
                    }
                }

                updateUI();
            }

            // Update the UI based on game state
            function updateUI() {
                // Update board display
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const squareIndex = row * 8 + col;
                        const squareElement = boardElement.children[squareIndex];
                        squareElement.innerHTML = '';
                        squareElement.classList.remove('selected', 'highlight');

                        const piece = gameState.board[row][col];
                        if (piece) {
                            const pieceElement = document.createElement('div');
                            pieceElement.textContent = getPieceSymbol(piece);
                            pieceElement.style.color = piece.color === 'white' ? '#ffffff' : '#000000';
                            squareElement.appendChild(pieceElement);

                            if (piece.quantum) {
                                const quantumOverlay = document.createElement('div');
                                quantumOverlay.className = 'quantum-overlay';
                                squareElement.appendChild(quantumOverlay);

                                if (piece.superposition) {
                                    const splitOverlay = document.createElement('div');
                                    splitOverlay.className = 'quantum-split';
                                    squareElement.appendChild(splitOverlay);
                                }

                                if (gameState.showProbabilities && piece.probability) {
                                    const probDisplay = document.createElement('div');
                                    probDisplay.className = 'probability-display';
                                    probDisplay.textContent = `${Math.round(piece.probability * 100)}%`;
                                    squareElement.appendChild(probDisplay);
                                }
                            }
                        }
                    }
                }

                // Highlight selected square
                if (gameState.selectedSquare) {
                    const { row, col } = gameState.selectedSquare;
                    const squareIndex = row * 8 + col;
                    boardElement.children[squareIndex].classList.add('selected');
                }

                // Update control buttons
                currentTurnElement.textContent = gameState.currentTurn.charAt(0).toUpperCase() + gameState.currentTurn.slice(1);
                gamePhaseElement.textContent = gameState.quantumMode ? 'Quantum' : 'Classical';
                quantumCountElement.textContent = gameState.quantumPieces.length;

                collapseButton.disabled = gameState.quantumPieces.length === 0;
                quantumSplitButton.disabled = !gameState.selectedSquare || gameState.quantumMode;
                quantumEntangleButton.disabled = gameState.quantumPieces.length < 2 || !gameState.quantumMode;

                // Update selected piece display
                if (gameState.selectedSquare) {
                    const { row, col } = gameState.selectedSquare;
                    const piece = gameState.board[row][col];
                    if (piece) {
                        selectedPieceElement.textContent = `${piece.color} ${piece.type}${piece.quantum ? ' (quantum)' : ''}`;
                    } else {
                        selectedPieceElement.textContent = 'Empty square';
                    }
                } else {
                    selectedPieceElement.textContent = 'None';
                }

                // Update move history
                moveHistoryElement.innerHTML = gameState.moveHistory.map(move => 
                    `<div>${move}</div>`
                ).join('');
                moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
            }

            // Get Unicode symbol for a piece
            function getPieceSymbol(piece) {
                const symbols = {
                    king: { white: '♔', black: '♚' },
                    queen: { white: '♕', black: '♛' },
                    rook: { white: '♖', black: '♜' },
                    bishop: { white: '♗', black: '♝' },
                    knight: { white: '♘', black: '♞' },
                    pawn: { white: '♙', black: '♟' }
                };
                return symbols[piece.type][piece.color];
            }

            // Handle square clicks
            function handleSquareClick(row, col) {
                const piece = gameState.board[row][col];

                if (gameState.entangleMode) {
                    handleEntanglementSelection(row, col);
                    return;
                }

                if (gameState.splitMode) {
                    handleSplitMove(row, col);
                    return;
                }

                // If no square is selected, select this one if it has a piece of the current color
                if (!gameState.selectedSquare) {
                    if (piece && piece.color === gameState.currentTurn) {
                        gameState.selectedSquare = { row, col };
                    }
                } 
                // If a square is already selected
                else {
                    const selectedRow = gameState.selectedSquare.row;
                    const selectedCol = gameState.selectedSquare.col;
                    const selectedPiece = gameState.board[selectedRow][selectedCol];

                    // If clicking on the same square, deselect it
                    if (selectedRow === row && selectedCol === col) {
                        gameState.selectedSquare = null;
                    } 
                    // If clicking on another piece of the same color, select that one instead
                    else if (piece && piece.color === gameState.currentTurn) {
                        gameState.selectedSquare = { row, col };
                    } 
                    // Otherwise, attempt to move the selected piece to this square
                    else {
                        if (isValidMove(selectedRow, selectedCol, row, col)) {
                            makeMove(selectedRow, selectedCol, row, col);
                            gameState.selectedSquare = null;
                        }
                    }
                }

                updateUI();
            }

            // Check if a move is valid (simplified for this demo)
            function isValidMove(fromRow, fromCol, toRow, toCol) {
                const piece = gameState.board[fromRow][fromCol];
                if (!piece) return false;

                // Basic movement rules (simplified)
                if (piece.type === 'pawn') {
                    // Pawns move forward one square, capture diagonally
                    const direction = piece.color === 'white' ? -1 : 1;
                    if (fromCol === toCol) {
                        // Forward move
                        if (toRow === fromRow + direction && !gameState.board[toRow][toCol]) {
                            return true;
                        }
                        // Initial two-square move
                        if ((fromRow === 1 || fromRow === 6) && 
                            toRow === fromRow + 2 * direction && 
                            !gameState.board[fromRow + direction][fromCol] && 
                            !gameState.board[toRow][toCol]) {
                            return true;
                        }
                    } else if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction) {
                        // Capture
                        return gameState.board[toRow][toCol] && gameState.board[toRow][toCol].color !== piece.color;
                    }
                } else if (piece.type === 'knight') {
                    // Knights move in L-shape
                    const rowDiff = Math.abs(toRow - fromRow);
                    const colDiff = Math.abs(toCol - fromCol);
                    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
                } else {
                    // For other pieces, use very simplified rules
                    const rowDiff = Math.abs(toRow - fromRow);
                    const colDiff = Math.abs(toCol - fromCol);
                    
                    if (piece.type === 'bishop') {
                        return rowDiff === colDiff;
                    } else if (piece.type === 'rook') {
                        return rowDiff === 0 || colDiff === 0;
                    } else if (piece.type === 'queen') {
                        return rowDiff === colDiff || rowDiff === 0 || colDiff === 0;
                    } else if (piece.type === 'king') {
                        return rowDiff <= 1 && colDiff <= 1;
                    }
                }

                return false;
            }

            // Make a classical move
            function makeMove(fromRow, fromCol, toRow, toCol) {
                const piece = gameState.board[fromRow][fromCol];
                const capturedPiece = gameState.board[toRow][toCol];

                // Move the piece
                gameState.board[toRow][toCol] = {...piece};
                gameState.board[fromRow][fromCol] = null;

                // Record the move
                const moveNotation = `${piece.type} from ${String.fromCharCode(97 + fromCol)}${8 - fromRow} to ${String.fromCharCode(97 + toCol)}${8 - toRow}`;
                gameState.moveHistory.push(`${gameState.currentTurn}: ${moveNotation}${capturedPiece ? ` (captured ${capturedPiece.type})` : ''}`);

                // Switch turns
                gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
            }

            // Handle quantum split move
            function handleSplitMove(toRow, toCol) {
                if (!gameState.selectedSquare) return;

                const { row: fromRow, col: fromCol } = gameState.selectedSquare;
                const piece = gameState.board[fromRow][fromCol];

                if (!piece || piece.color !== gameState.currentTurn) return;

                if (!isValidMove(fromRow, fromCol, toRow, toCol)) return;

                // Create superposition
                gameState.board[fromRow][fromCol] = {
                    ...piece,
                    quantum: true,
                    superposition: true,
                    probability: 0.5,
                    states: [
                        { row: fromRow, col: fromCol, probability: 0.5 },
                        { row: toRow, col: toCol, probability: 0.5 }
                    ]
                };

                // Create the other state
                gameState.board[toRow][toCol] = {
                    ...piece,
                    quantum: true,
                    superposition: true,
                    probability: 0.5,
                    states: [
                        { row: fromRow, col: fromCol, probability: 0.5 },
                        { row: toRow, col: toCol, probability: 0.5 }
                    ]
                };

                // Track quantum pieces
                gameState.quantumPieces.push({ row: fromRow, col: fromCol });
                gameState.quantumPieces.push({ row: toRow, col: toCol });

                // Record the move
                gameState.moveHistory.push(`${gameState.currentTurn}: quantum split ${piece.type} from ${String.fromCharCode(97 + fromCol)}${8 - fromRow} to ${String.fromCharCode(97 + toCol)}${8 - toRow}`);

                // Switch to quantum mode
                gameState.quantumMode = true;
                gameState.splitMode = false;
                gameState.selectedSquare = null;

                // Don't switch turns yet - player needs to collapse
            }

            // Handle entanglement selection
            function handleEntanglementSelection(row, col) {
                const piece = gameState.board[row][col];
                if (!piece || !piece.quantum) return;

                if (!gameState.firstEntanglePiece) {
                    gameState.firstEntanglePiece = { row, col };
                } else {
                    // Entangle the two pieces
                    const firstPiece = gameState.board[gameState.firstEntanglePiece.row][gameState.firstEntanglePiece.col];
                    const secondPiece = gameState.board[row][col];

                    if (firstPiece && secondPiece) {
                        firstPiece.entangledWith = { row, col };
                        secondPiece.entangledWith = { 
                            row: gameState.firstEntanglePiece.row, 
                            col: gameState.firstEntanglePiece.col 
                        };

                        // Record the move
                        gameState.moveHistory.push(`${gameState.currentTurn}: entangled pieces at ${String.fromCharCode(97 + gameState.firstEntanglePiece.col)}${8 - gameState.firstEntanglePiece.row} and ${String.fromCharCode(97 + col)}${8 - row}`);
                    }

                    gameState.firstEntanglePiece = null;
                    gameState.entangleMode = false;
                }

                updateUI();
            }

            // Collapse quantum states
            function collapseQuantumStates() {
                if (gameState.quantumPieces.length === 0) return;

                // For each quantum piece, randomly choose one state based on probability
                const resolvedPieces = new Set();

                for (const { row, col } of gameState.quantumPieces) {
                    const piece = gameState.board[row][col];
                    if (!piece || !piece.quantum || resolvedPieces.has(`${row},${col}`)) continue;

                    // For entangled pieces, resolve them together
                    if (piece.entangledWith) {
                        const { row: eRow, col: eCol } = piece.entangledWith;
                        const entangledPiece = gameState.board[eRow][eCol];
                        
                        if (entangledPiece && entangledPiece.quantum && !resolvedPieces.has(`${eRow},${eCol}`)) {
                            // Choose a random state (same for both pieces)
                            const random = Math.random();
                            const firstState = random < 0.5;
                            
                            // Resolve first piece
                            resolveQuantumPiece(row, col, firstState);
                            resolvedPieces.add(`${row},${col}`);
                            
                            // Resolve entangled piece
                            resolveQuantumPiece(eRow, eCol, firstState);
                            resolvedPieces.add(`${eRow},${eCol}`);
                            
                            // Record the collapse
                            gameState.moveHistory.push(`${gameState.currentTurn}: collapsed entangled pieces to ${firstState ? 'first' : 'second'} state`);
                        }
                    } 
                    // For non-entangled pieces
                    else if (piece.superposition) {
                        const random = Math.random();
                        const firstState = random < piece.states[0].probability;
                        
                        resolveQuantumPiece(row, col, firstState);
                        resolvedPieces.add(`${row},${col}`);
                        
                        // Record the collapse
                        gameState.moveHistory.push(`${gameState.currentTurn}: collapsed ${piece.type} to ${firstState ? 'first' : 'second'} state`);
                    }
                }

                // Clear quantum mode
                gameState.quantumMode = false;
                gameState.quantumPieces = [];
                
                // Switch turns after collapse
                gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';

                updateUI();
            }

            // Resolve a quantum piece to a specific state
            function resolveQuantumPiece(row, col, chooseFirstState) {
                const piece = gameState.board[row][col];
                if (!piece || !piece.quantum) return;

                if (piece.superposition) {
                    const chosenState = chooseFirstState ? piece.states[0] : piece.states[1];
                    const otherState = chooseFirstState ? piece.states[1] : piece.states[0];

                    // If this is the chosen state, make it classical
                    if (chosenState.row === row && chosenState.col === col) {
                        gameState.board[row][col] = {
                            type: piece.type,
                            color: piece.color,
                            quantum: false
                        };
                    } 
                    // If this is the other state, remove the piece
                    else {
                        gameState.board[row][col] = null;
                    }
                }
            }

            // Event listeners for buttons
            newGameButton.addEventListener('click', initializeBoard);
            
            collapseButton.addEventListener('click', () => {
                collapseQuantumStates();
            });
            
            showProbabilitiesButton.addEventListener('click', () => {
                gameState.showProbabilities = !gameState.showProbabilities;
                showProbabilitiesButton.textContent = gameState.showProbabilities ? 
                    'Hide Probabilities' : 'Show Probabilities';
                updateUI();
            });
            
            quantumSplitButton.addEventListener('click', () => {
                gameState.splitMode = !gameState.splitMode;
                quantumSplitButton.textContent = gameState.splitMode ? 
                    'Cancel Split' : 'Split Move (50/50)';
                updateUI();
            });
            
            quantumEntangleButton.addEventListener('click', () => {
                gameState.entangleMode = !gameState.entangleMode;
                quantumEntangleButton.textContent = gameState.entangleMode ? 
                    'Cancel Entanglement' : 'Entangle Pieces';
                gameState.firstEntanglePiece = null;
                updateUI();
            });

            // Initialize the game
            initializeBoard();
        });