/* ===========================================================
   TATI-FLIX
   Fase 4 - Sopa de Letras Interativa
   wordsearch.js COMPLETO
=========================================================== */

(() => {
    "use strict";

    /* =========================
       CONFIGURAÇÃO
    ========================= */

    const GRID_SIZE = 13;

    const FALLBACK_WORDS = [
        "ROSINHA",
        "BRASAO",
        "TINHOSO",
        "PRESSINHAS",
        "INDIVIDUAL",
        "FRANCESINHA"
    ];

    const DIRECTIONS = [
        { dr: 0, dc: 1 },    // →
        { dr: 0, dc: -1 },   // ←
        { dr: 1, dc: 0 },    // ↓
        { dr: -1, dc: 0 },   // ↑
        { dr: 1, dc: 1 },    // ↘
        { dr: -1, dc: -1 },  // ↖
        { dr: 1, dc: -1 },   // ↙
        { dr: -1, dc: 1 }    // ↗
    ];

    const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const wordsearchElement = document.getElementById("wordsearch");
    const wordListElement = document.getElementById("wordList");

    if (!wordsearchElement) {
        return;
    }

    let board = [];
    let cellElements = [];
    let words = [];
    let foundWords = new Set();

    let isSelecting = false;
    let startCell = null;
    let currentSelection = [];

    /* =========================
       ESTILOS EXTRA
    ========================= */

    injectWordSearchStyles();

    function injectWordSearchStyles() {
        const style = document.createElement("style");

        style.textContent = `
            #wordsearch {
                display: inline-block;
                margin: 28px auto;
                padding: 14px;
                border-radius: 18px;
                background: rgba(0, 0, 0, 0.35);
                box-shadow: 0 0 25px rgba(229, 9, 20, 0.28);
                user-select: none;
                touch-action: none;
            }

            .ws-row {
                display: flex;
                justify-content: center;
            }

            .ws-cell {
                width: 34px;
                height: 34px;
                margin: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                font-family: monospace;
                font-size: 21px;
                font-weight: 900;
                color: #ffffff;
                background: rgba(255, 255, 255, 0.05);
                cursor: pointer;
                transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
            }

            .ws-cell:hover {
                background: rgba(255, 255, 255, 0.14);
                transform: scale(1.04);
            }

            .ws-cell.selected {
                background: #e50914;
                color: #ffffff;
                box-shadow: 0 0 12px rgba(229, 9, 20, 0.75);
                transform: scale(1.06);
            }

            .ws-cell.invalid {
                background: #7a0000;
                animation: wsShake 0.25s ease;
            }

            .ws-cell.found {
                background: #00c853;
                color: #ffffff;
                box-shadow: 0 0 12px rgba(0, 200, 83, 0.85);
            }

            .ws-cell.found-pop {
                animation: wsFoundPop 0.65s ease;
            }

            #wordList li {
                transition: opacity 0.25s ease, color 0.25s ease, transform 0.25s ease;
            }

            #wordList li.word-found {
                opacity: 0.45;
                color: #00c853;
                text-decoration: line-through;
                transform: translateX(6px);
            }

            .ws-progress-wrapper {
                width: 100%;
                max-width: 360px;
                margin: 14px auto 18px;
                text-align: center;
            }

            .ws-progress-text {
                color: #ffffff;
                font-size: 14px;
                margin-bottom: 8px;
                opacity: 0.85;
            }

            .ws-progress-bar {
                width: 100%;
                height: 10px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.15);
                overflow: hidden;
            }

            .ws-progress-fill {
                height: 100%;
                width: 0%;
                border-radius: 999px;
                background: linear-gradient(90deg, #e50914, #ff5f6d);
                transition: width 0.35s ease;
            }

            .mission-complete-overlay {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.92);
                animation: wsFadeIn 0.7s ease forwards;
            }

            .mission-complete-box {
                width: min(90%, 560px);
                padding: 38px 28px;
                border-radius: 24px;
                text-align: center;
                background: linear-gradient(145deg, #140000, #050505);
                border: 1px solid rgba(229, 9, 20, 0.55);
                box-shadow: 0 0 45px rgba(229, 9, 20, 0.35);
            }

            .mission-complete-box h1 {
                margin: 0 0 12px;
                color: #e50914;
                font-size: clamp(32px, 7vw, 56px);
                letter-spacing: 2px;
            }

            .mission-complete-box p {
                color: #ffffff;
                font-size: 18px;
                line-height: 1.5;
                opacity: 0.92;
            }

            .mission-complete-box button {
                margin-top: 22px;
                padding: 14px 28px;
                border: none;
                border-radius: 999px;
                background: #e50914;
                color: #ffffff;
                font-weight: 800;
                font-size: 16px;
                cursor: pointer;
                transition: transform 0.2s ease, background 0.2s ease;
            }

            .mission-complete-box button:hover {
                background: #ff1a25;
                transform: scale(1.04);
            }

            @keyframes wsFoundPop {
                0% {
                    transform: scale(1);
                    background: #e50914;
                    box-shadow: 0 0 8px rgba(229, 9, 20, 0.8);
                }

                45% {
                    transform: scale(1.22);
                    background: #ffffff;
                    color: #e50914;
                    box-shadow: 0 0 24px rgba(255, 255, 255, 0.95);
                }

                100% {
                    transform: scale(1);
                    background: #00c853;
                    color: #ffffff;
                    box-shadow: 0 0 12px rgba(0, 200, 83, 0.85);
                }
            }

            @keyframes wsShake {
                0% { transform: translateX(0); }
                25% { transform: translateX(-3px); }
                50% { transform: translateX(3px); }
                75% { transform: translateX(-2px); }
                100% { transform: translateX(0); }
            }

            @keyframes wsFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @media (max-width: 600px) {
                #wordsearch {
                    padding: 8px;
                }

                .ws-cell {
                    width: 24px;
                    height: 24px;
                    margin: 1.5px;
                    font-size: 15px;
                    border-radius: 5px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =========================
       FUNÇÕES DE TEXTO
    ========================= */

    function normalizeWord(value) {
        return String(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z]/gi, "")
            .toUpperCase();
    }

    function getWordsFromHTML() {
        const items = document.querySelectorAll("#wordList li[data-word]");

        if (!items.length) {
            return FALLBACK_WORDS.map(normalizeWord);
        }

        return Array.from(items)
            .map(item => normalizeWord(item.dataset.word || item.textContent))
            .filter(Boolean);
    }

    function reverseString(value) {
        return value.split("").reverse().join("");
    }

    /* =========================
       MOTOR DA GRELHA
    ========================= */

    function createEmptyBoard() {
        board = [];
        cellElements = [];

        for (let row = 0; row < GRID_SIZE; row++) {
            board[row] = [];
            cellElements[row] = [];

            for (let col = 0; col < GRID_SIZE; col++) {
                board[row][col] = "";
                cellElements[row][col] = null;
            }
        }
    }

    function randomLetter() {
        return LETTERS[Math.floor(Math.random() * LETTERS.length)];
    }

    function shuffleArray(array) {
        const copy = [...array];

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }

        return copy;
    }

    function canPlaceWord(word, startRow, startCol, direction) {
        for (let i = 0; i < word.length; i++) {
            const row = startRow + direction.dr * i;
            const col = startCol + direction.dc * i;

            if (
                row < 0 ||
                row >= GRID_SIZE ||
                col < 0 ||
                col >= GRID_SIZE
            ) {
                return false;
            }

            const currentLetter = board[row][col];

            if (currentLetter !== "" && currentLetter !== word[i]) {
                return false;
            }
        }

        return true;
    }

    function placeWord(word) {
        const attempts = 1200;

        for (let attempt = 0; attempt < attempts; attempt++) {
            const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);

            if (!canPlaceWord(word, row, col, direction)) {
                continue;
            }

            for (let i = 0; i < word.length; i++) {
                const targetRow = row + direction.dr * i;
                const targetCol = col + direction.dc * i;

                board[targetRow][targetCol] = word[i];
            }

            return true;
        }

        return false;
    }

    function placeAllWords() {
        const sortedWords = [...words].sort((a, b) => b.length - a.length);

        for (const word of sortedWords) {
            const placed = placeWord(word);

            if (!placed) {
                console.warn(`Não foi possível colocar a palavra: ${word}`);
            }
        }
    }

    function fillEmptySpaces() {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (board[row][col] === "") {
                    board[row][col] = randomLetter();
                }
            }
        }
    }

    /* =========================
       RENDERIZAÇÃO
    ========================= */

    function renderBoard() {
        wordsearchElement.innerHTML = "";

        for (let row = 0; row < GRID_SIZE; row++) {
            const rowElement = document.createElement("div");
            rowElement.className = "ws-row";

            for (let col = 0; col < GRID_SIZE; col++) {
                const cell = document.createElement("div");

                cell.className = "ws-cell";
                cell.textContent = board[row][col];

                cell.dataset.row = String(row);
                cell.dataset.col = String(col);
                cell.dataset.letter = board[row][col];

                cellElements[row][col] = cell;
                rowElement.appendChild(cell);
            }

            wordsearchElement.appendChild(rowElement);
        }
    }

    function createProgressBar() {
        if (!wordListElement) return;

        if (document.querySelector(".ws-progress-wrapper")) return;

        const wrapper = document.createElement("div");
        wrapper.className = "ws-progress-wrapper";

        const text = document.createElement("div");
        text.className = "ws-progress-text";
        text.textContent = `0/${words.length} memórias recuperadas`;

        const bar = document.createElement("div");
        bar.className = "ws-progress-bar";

        const fill = document.createElement("div");
        fill.className = "ws-progress-fill";

        bar.appendChild(fill);
        wrapper.appendChild(text);
        wrapper.appendChild(bar);

        wordListElement.insertBefore(wrapper, wordListElement.firstChild);
    }

    function updateProgressBar() {
        const text = document.querySelector(".ws-progress-text");
        const fill = document.querySelector(".ws-progress-fill");

        const total = words.length;
        const done = foundWords.size;
        const percentage = total === 0 ? 0 : (done / total) * 100;

        if (text) {
            text.textContent = `${done}/${total} memórias recuperadas`;
        }

        if (fill) {
            fill.style.width = `${percentage}%`;
        }
    }

    /* =========================
       SELEÇÃO
    ========================= */

    function getCellData(cell) {
        return {
            row: Number(cell.dataset.row),
            col: Number(cell.dataset.col),
            letter: cell.dataset.letter,
            element: cell
        };
    }

    function getCellFromPoint(clientX, clientY) {
        const element = document.elementFromPoint(clientX, clientY);

        if (!element) return null;

        if (!element.classList.contains("ws-cell")) {
            return null;
        }

        return element;
    }

    function clearSelection() {
        currentSelection.forEach(cellData => {
            if (!cellData.element.classList.contains("found")) {
                cellData.element.classList.remove("selected");
                cellData.element.classList.remove("invalid");
            }
        });

        currentSelection = [];
    }

    function isStraightLine(start, end) {
        const rowDiff = end.row - start.row;
        const colDiff = end.col - start.col;

        const sameRow = rowDiff === 0;
        const sameCol = colDiff === 0;
        const diagonal = Math.abs(rowDiff) === Math.abs(colDiff);

        return sameRow || sameCol || diagonal;
    }

    function getStep(start, end) {
        const rowDiff = end.row - start.row;
        const colDiff = end.col - start.col;

        return {
            dr: Math.sign(rowDiff),
            dc: Math.sign(colDiff)
        };
    }

    function buildSelectionPath(start, end) {
        if (!isStraightLine(start, end)) {
            return [];
        }

        const step = getStep(start, end);
        const path = [];

        let row = start.row;
        let col = start.col;

        path.push({
            row,
            col,
            letter: board[row][col],
            element: cellElements[row][col]
        });

        while (row !== end.row || col !== end.col) {
            row += step.dr;
            col += step.dc;

            if (
                row < 0 ||
                row >= GRID_SIZE ||
                col < 0 ||
                col >= GRID_SIZE
            ) {
                return [];
            }

            path.push({
                row,
                col,
                letter: board[row][col],
                element: cellElements[row][col]
            });
        }

        return path;
    }

    function renderSelection(path) {
        clearSelection();

        currentSelection = path;

        currentSelection.forEach(cellData => {
            if (!cellData.element.classList.contains("found")) {
                cellData.element.classList.add("selected");
            }
        });
    }

    function startSelection(cell) {
        isSelecting = true;
        startCell = getCellData(cell);

        renderSelection([startCell]);
    }

    function moveSelection(cell) {
        if (!isSelecting || !startCell) return;

        const endCell = getCellData(cell);
        const path = buildSelectionPath(startCell, endCell);

        if (!path.length) {
            return;
        }

        renderSelection(path);
    }

    function endSelection() {
        if (!isSelecting) return;

        isSelecting = false;
        startCell = null;

        validateSelection();
    }

    /* =========================
       VALIDAÇÃO
    ========================= */

    function getSelectedWord() {
        return currentSelection
            .map(cellData => cellData.letter)
            .join("");
    }

    function findMatchingWord(selectedWord) {
        const normalized = normalizeWord(selectedWord);
        const reversed = reverseString(normalized);

        for (const word of words) {
            if (foundWords.has(word)) continue;

            if (word === normalized || word === reversed) {
                return word;
            }
        }

        return null;
    }

    function validateSelection() {
        if (currentSelection.length < 2) {
            clearSelection();
            return;
        }

        const selectedWord = getSelectedWord();
        const matchedWord = findMatchingWord(selectedWord);

        if (!matchedWord) {
            markInvalidSelection();
            return;
        }

        markWordAsFound(matchedWord);
    }

    function markInvalidSelection() {
        window.TatiSound?.play("error");
        currentSelection.forEach(cellData => {
            if (!cellData.element.classList.contains("found")) {
                cellData.element.classList.add("invalid");
            }
        });

        setTimeout(() => {
            clearSelection();
        }, 280);
    }

    function markWordAsFound(word) {
        foundWords.add(word);

        window.TatiSound?.play("wordFound");
        currentSelection.forEach((cellData, index) => {
            const element = cellData.element;

            element.classList.remove("selected");
            element.classList.add("found");

            setTimeout(() => {
                element.classList.add("found-pop");

                setTimeout(() => {
                    element.classList.remove("found-pop");
                }, 700);
            }, index * 55);
        });

        markWordInList(word);
        updateProgressBar();

        currentSelection = [];

        if (foundWords.size === words.length) {
            setTimeout(() => {
                completeMission();
            }, 900);
        }
    }

    function markWordInList(word) {
        const items = document.querySelectorAll("#wordList li[data-word]");

        items.forEach(item => {
            const itemWord = normalizeWord(item.dataset.word || item.textContent);

            if (itemWord === word) {
                item.classList.add("word-found");
            }
        });
    }

    /* =========================
       EVENTOS
    ========================= */

    function attachMouseEvents() {
        wordsearchElement.addEventListener("mousedown", event => {
            const cell = event.target.closest(".ws-cell");

            if (!cell) return;

            event.preventDefault();
            startSelection(cell);
        });

        wordsearchElement.addEventListener("mouseover", event => {
            const cell = event.target.closest(".ws-cell");

            if (!cell) return;

            moveSelection(cell);
        });

        document.addEventListener("mouseup", () => {
            endSelection();
        });
    }

    function attachTouchEvents() {
        wordsearchElement.addEventListener("touchstart", event => {
            event.preventDefault();

            const touch = event.touches[0];
            const cell = getCellFromPoint(touch.clientX, touch.clientY);

            if (!cell) return;

            startSelection(cell);
        }, { passive: false });

        wordsearchElement.addEventListener("touchmove", event => {
            event.preventDefault();

            const touch = event.touches[0];
            const cell = getCellFromPoint(touch.clientX, touch.clientY);

            if (!cell) return;

            moveSelection(cell);
        }, { passive: false });

        document.addEventListener("touchend", () => {
            endSelection();
        });
    }

    /* =========================
       MISSÃO CONCLUÍDA
    ========================= */

    function completeMission() {
        window.TatiSound?.play("missionComplete");
        
        localStorage.setItem("tatiflix_mission_001", "completed");

        const overlay = document.createElement("div");
        overlay.className = "mission-complete-overlay";

        overlay.innerHTML = `
            <div class="mission-complete-box">
                <h1>MISSÃO CONCLUÍDA</h1>
                <p>
                    Todas as memórias foram recuperadas.<br>
                    O episódio exclusivo foi desbloqueado.
                </p>
                <button id="continueAfterMission">
                    Continuar
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        const continueButton = document.getElementById("continueAfterMission");

        if (continueButton) {
            continueButton.addEventListener("click", () => {
                window.location.href = "poster.html";
            });
        }
    }

    /* =========================
       INICIALIZAÇÃO
    ========================= */

    function initWordSearch() {
        words = getWordsFromHTML();

        if (!words.length) {
            console.error("Nenhuma palavra encontrada para a sopa de letras.");
            return;
        }

        createEmptyBoard();
        placeAllWords();
        fillEmptySpaces();
        renderBoard();
        createProgressBar();
        updateProgressBar();

        attachMouseEvents();
        attachTouchEvents();
    }

    initWordSearch();

})();