class TicTacToe {
    constructor() {
        this.setupScreen = document.getElementById('setup-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.weaponInput1 = document.getElementById('weapon-input-1');
        this.weaponInput2 = document.getElementById('weapon-input-2');
        this.submitWeapons = document.getElementById('submit-weapons');
        this.loading = document.getElementById('loading');
        
        this.board = Array(9).fill('');
        this.currentPlayer = 'player1';
        this.gameActive = false;
        this.playerWeapons = {
            player1: { name: '', imageUrl: '' },
            player2: { name: '', imageUrl: '' }
        };
        
        this.statusElement = document.getElementById('status');
        this.cells = document.querySelectorAll('.cell');
        this.restartButton = document.getElementById('restart');
        
        this.initializeGame();
    }

    async initializeGame() {
        this.setupScreen.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
        
        this.submitWeapons.addEventListener('click', () => this.handleWeaponsSubmit());
        this.weaponInput1.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.weaponInput2.focus();
        });
        this.weaponInput2.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleWeaponsSubmit();
        });
        
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
        
        this.restartButton.addEventListener('click', () => this.restartGame());
    }

    async handleWeaponsSubmit() {
        const weapon1 = this.weaponInput1.value.trim();
        const weapon2 = this.weaponInput2.value.trim();
        
        if (!weapon1 || !weapon2) {
            alert('Please enter weapons for both players');
            return;
        }

        this.loading.classList.remove('hidden');
        this.submitWeapons.disabled = true;
        this.weaponInput1.disabled = true;
        this.weaponInput2.disabled = true;

        try {
            // Generate both images in parallel
            const [image1, image2] = await Promise.all([
                this.generateWeaponImage(weapon1),
                this.generateWeaponImage(weapon2)
            ]);
            
            this.playerWeapons.player1 = {
                name: weapon1,
                imageUrl: image1
            };
            this.playerWeapons.player2 = {
                name: weapon2,
                imageUrl: image2
            };

            // Start the game
            this.setupScreen.classList.add('hidden');
            this.gameScreen.classList.remove('hidden');
            this.gameActive = true;
            this.currentPlayer = 'player1';
            this.updateStatus();
        } catch (error) {
            console.error('Error generating images:', error);
            alert('Error generating images. Please try again.');
            this.submitWeapons.disabled = false;
            this.weaponInput1.disabled = false;
            this.weaponInput2.disabled = false;
        } finally {
            this.loading.classList.add('hidden');
        }
    }

    async generateWeaponImage(prompt) {
        const response = await fetch('/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Failed to generate image');
        }

        const data = await response.json();
        return data.url;
    }

    handleCellClick(cell) {
        if (!this.gameActive) return;
        
        const index = cell.getAttribute('data-index');
        
        if (this.board[index]) return;

        this.board[index] = this.currentPlayer;
        const img = document.createElement('img');
        img.src = this.playerWeapons[this.currentPlayer].imageUrl;
        img.alt = this.playerWeapons[this.currentPlayer].name;
        img.className = 'player-image';
        cell.innerHTML = '';
        cell.appendChild(img);
        
        if (this.checkWin()) {
            this.gameActive = false;
            this.statusElement.textContent = `Player ${this.playerWeapons[this.currentPlayer].name} wins!`;
            return;
        }
        
        if (this.checkDraw()) {
            this.gameActive = false;
            this.statusElement.textContent = "Game ended in a draw!";
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';
        this.updateStatus();
    }

    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] &&
                   this.board[a] === this.board[b] &&
                   this.board[a] === this.board[c];
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    updateStatus() {
        const currentWeapon = this.playerWeapons[this.currentPlayer].name;
        this.statusElement.textContent = `Player ${currentWeapon}'s turn`;
    }

    restartGame() {
        this.board = Array(9).fill('');
        this.cells.forEach(cell => cell.innerHTML = '');
        this.setupScreen.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
        this.gameActive = false;
        this.weaponInput1.value = '';
        this.weaponInput2.value = '';
        this.weaponInput1.disabled = false;
        this.weaponInput2.disabled = false;
        this.submitWeapons.disabled = false;
        this.playerWeapons = {
            player1: { name: '', imageUrl: '' },
            player2: { name: '', imageUrl: '' }
        };
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
