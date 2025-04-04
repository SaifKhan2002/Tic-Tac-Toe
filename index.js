document.addEventListener('DOMContentLoaded', () => {
  // Game state
  let board = ['', '', '', '', '', '', '', '', ''];
  let currentPlayer = 'X';
  let gameActive = true;
  let scores = { xWins: 0, oWins: 0, draws: 0 };
  let moveHistory = [];
  
  // DOM elements
  const cells = document.querySelectorAll('.cell');
  const statusMessage = document.getElementById('statusMessage');
  const xWinsElement = document.getElementById('xWins');
  const oWinsElement = document.getElementById('oWins');
  const drawsElement = document.getElementById('draws');
  const newGameBtn = document.getElementById('newGameBtn');
  const themeBtn = document.getElementById('themeBtn');
  const timelineElement = document.getElementById('timeline');
  const playerXSelect = document.getElementById('playerX');
  const playerOSelect = document.getElementById('playerO');
  const reactionContainer = document.getElementById('reactionContainer');
  const confettiCanvas = document.getElementById('confetti');
  
  // Player symbols
  let playerXSymbol = 'X';
  let playerOSymbol = 'O';
  
  // Reaction emojis
  const reactions = ['😊', '👍', '👏', '🎉', '🤩', '🔥', '💯'];
  
  // Initialize game
  init();
  
  function init() {
      // Event listeners
      cells.forEach(cell => {
          cell.addEventListener('click', handleCellClick);
          cell.addEventListener('mouseenter', handleCellHover);
          cell.addEventListener('mouseleave', handleCellHoverOut);
      });
      
      newGameBtn.addEventListener('click', startNewGame);
      themeBtn.addEventListener('click', toggleTheme);
      
      playerXSelect.addEventListener('change', (e) => {
          playerXSymbol = e.target.value;
          updateStatusMessage();
      });
      
      playerOSelect.addEventListener('change', (e) => {
          playerOSymbol = e.target.value;
          updateStatusMessage();
      });
      
      // Create reaction buttons
      reactions.forEach(reaction => {
          const reactionElement = document.createElement('div');
          reactionElement.classList.add('reaction');
          reactionElement.textContent = reaction;
          reactionElement.addEventListener('click', () => {
              createFloatingReaction(reaction);
          });
          reactionContainer.appendChild(reactionElement);
      });
      
      // Initialize confetti canvas
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
      
      // Load scores from localStorage
      const savedScores = localStorage.getItem('ticTacToeScores');
      if (savedScores) {
          scores = JSON.parse(savedScores);
          updateScoreboard();
      }
      
      updateStatusMessage();
  }
  
  function handleCellClick(e) {
      const cell = e.target;
      const cellIndex = parseInt(cell.getAttribute('data-index'));
      
      // If cell is already filled or game is not active, ignore click
      if (board[cellIndex] !== '' || !gameActive) return;
      
      // Make move
      board[cellIndex] = currentPlayer;
      cell.textContent = currentPlayer === 'X' ? playerXSymbol : playerOSymbol;
      cell.classList.add(currentPlayer.toLowerCase());
      cell.classList.add('animate__animated', 'animate__zoomIn');
      
      // Add to move history
      moveHistory.push({
          player: currentPlayer,
          position: cellIndex,
          moveNumber: moveHistory.length + 1
      });
      updateTimeline();
      
      // Check for win or draw
      if (checkWin()) {
          endGame(false);
          return;
      }
      
      if (checkDraw()) {
          endGame(true);
          return;
      }
      
      // Switch player
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateStatusMessage();
      
      // Remove animation class after it completes
      setTimeout(() => {
          cell.classList.remove('animate__animated', 'animate__zoomIn');
      }, 500);
  }
  
  function handleCellHover(e) {
      const cell = e.target;
      const cellIndex = parseInt(cell.getAttribute('data-index'));
      
      if (board[cellIndex] === '' && gameActive) {
          cell.textContent = currentPlayer === 'X' ? playerXSymbol : playerOSymbol;
          cell.style.opacity = '0.5';
      }
  }
  
  function handleCellHoverOut(e) {
      const cell = e.target;
      const cellIndex = parseInt(cell.getAttribute('data-index'));
      
      if (board[cellIndex] === '') {
          cell.textContent = '';
          cell.style.opacity = '1';
      }
  }
  
  function checkWin() {
      const winPatterns = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
          [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
          [0, 4, 8], [2, 4, 6]             // diagonals
      ];
      
      return winPatterns.some(pattern => {
          const [a, b, c] = pattern;
          return board[a] !== '' && board[a] === board[b] && board[a] === board[c];
      });
  }
  
  function checkDraw() {
      return board.every(cell => cell !== '');
  }
  
  function endGame(isDraw) {
      gameActive = false;
      
      if (isDraw) {
          statusMessage.textContent = "Game ended in a draw!";
          scores.draws++;
          animateCells('animate__tada');
      } else {
          const winner = currentPlayer === 'X' ? 'X' : 'O';
          statusMessage.textContent = `Player ${winner} wins!`;
          
          if (winner === 'X') {
              scores.xWins++;
          } else {
              scores.oWins++;
          }
          
          highlightWinningCells();
          triggerConfetti();
      }
      
      updateScoreboard();
      saveScores();
  }
  
  function startNewGame() {
      // Reset board
      board = ['', '', '', '', '', '', '', '', ''];
      currentPlayer = 'X';
      gameActive = true;
      moveHistory = [];
      timelineElement.innerHTML = '';
      
      // Clear cells
      cells.forEach(cell => {
          cell.textContent = '';
          cell.classList.remove('x', 'o', 'winner', 'animate__tada', 'animate__animated');
      });
      
      updateStatusMessage();
  }
  
  function updateStatusMessage() {
      const playerSymbol = currentPlayer === 'X' ? playerXSymbol : playerOSymbol;
      statusMessage.textContent = `Player ${currentPlayer}'s turn (${playerSymbol})`;
      statusMessage.classList.add('animate__animated', 'animate__pulse');
      
      setTimeout(() => {
          statusMessage.classList.remove('animate__animated', 'animate__pulse');
      }, 500);
  }
  
  function updateScoreboard() {
      xWinsElement.textContent = scores.xWins;
      oWinsElement.textContent = scores.oWins;
      drawsElement.textContent = scores.draws;
  }
  
  function updateTimeline() {
      timelineElement.innerHTML = '';
      moveHistory.forEach(move => {
          const timelineItem = document.createElement('div');
          timelineItem.classList.add('timeline-item');
          const playerSymbol = move.player === 'X' ? playerXSymbol : playerOSymbol;
          timelineItem.textContent = `Move ${move.moveNumber}: Player ${move.player} (${playerSymbol}) placed at position ${move.position + 1}`;
          timelineElement.appendChild(timelineItem);
      });
      
      // Scroll to bottom
      timelineElement.scrollTop = timelineElement.scrollHeight;
  }
  
  function animateCells(animation) {
      cells.forEach(cell => {
          cell.classList.add('animate__animated', animation);
          
          setTimeout(() => {
              cell.classList.remove('animate__animated', animation);
          }, 1000);
      });
  }
  
  function highlightWinningCells() {
      const winPatterns = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
          [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
          [0, 4, 8], [2, 4, 6]             // diagonals
      ];
      
      const winningPattern = winPatterns.find(pattern => {
          const [a, b, c] = pattern;
          return board[a] !== '' && board[a] === board[b] && board[a] === board[c];
      });
      
      if (winningPattern) {
          winningPattern.forEach(index => {
              cells[index].classList.add('winner', 'animate__animated', 'animate__heartBeat');
          });
      }
  }
  
  function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'dark') {
          document.documentElement.removeAttribute('data-theme');
          themeBtn.textContent = '🌙';
      } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          themeBtn.textContent = '☀️';
      }
  }
  
  function saveScores() {
      localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
  }
  
  function createFloatingReaction(reaction) {
      const floatingReaction = document.createElement('div');
      floatingReaction.textContent = reaction;
      floatingReaction.style.position = 'fixed';
      floatingReaction.style.bottom = '20px';
      floatingReaction.style.right = '20px';
      floatingReaction.style.fontSize = '2rem';
      floatingReaction.style.opacity = '1';
      floatingReaction.style.transition = 'all 1s ease-out';
      floatingReaction.style.zIndex = '1000';
      document.body.appendChild(floatingReaction);
      
      // Animate
      setTimeout(() => {
          floatingReaction.style.bottom = `${Math.random() * window.innerHeight}px`;
          floatingReaction.style.right = `${Math.random() * window.innerWidth}px`;
          floatingReaction.style.opacity = '0';
          floatingReaction.style.transform = 'scale(2)';
      }, 10);
      
      // Remove after animation
      setTimeout(() => {
          floatingReaction.remove();
      }, 1000);
  }
  
  function triggerConfetti() {
      const canvas = confettiCanvas;
      const ctx = canvas.getContext('2d');
      const particles = [];
      const particleCount = 150;
      
      // Create particles
      for (let i = 0; i < particleCount; i++) {
          particles.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height - canvas.height,
              size: Math.random() * 10 + 5,
              speed: Math.random() * 3 + 2,
              color: `hsl(${Math.random() * 360}, 100%, 50%)`,
              angle: Math.random() * Math.PI * 2,
              rotation: Math.random() * 0.2 - 0.1,
              rotationSpeed: Math.random() * 0.01 - 0.005
          });
      }
      
      // Animation loop
      function animate() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          let stillActive = false;
          
          particles.forEach(particle => {
              particle.y += particle.speed;
              particle.x += Math.sin(particle.angle) * 1;
              particle.angle += particle.rotationSpeed;
              
              ctx.save();
              ctx.translate(particle.x, particle.y);
              ctx.rotate(particle.rotation);
              ctx.fillStyle = particle.color;
              ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
              ctx.restore();
              
              particle.rotation += particle.rotationSpeed;
              
              if (particle.y < canvas.height) {
                  stillActive = true;
              }
          });
          
          if (stillActive) {
              requestAnimationFrame(animate);
          } else {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
      }
      
      animate();
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
  });
});