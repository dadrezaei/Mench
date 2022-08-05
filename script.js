const colors = ["blue", "red", "green", "orange"];
const totalSteps = 41;
const commonSteps = 37;
var playingColors = [];
var activePlayerNumber = 0;
var isDiceEnable = false;
var pieces = [
    blue = {
        moves: [0],
        color: "blue",
        items: [
            {
                number: 1,
                isOnBoard: false,
                position: 0
            },
            {
                number: 2,
                isOnBoard: false,
                position: 0
            },
            {
                number: 3,
                isOnBoard: false,
                position: 0
            },
            {
                number: 4,
                isOnBoard: false,
                position: 0
            }
        ],
    },
    red = {
        moves: [0],
        color: "red",
        items: [
            {
                number: 1,
                isOnBoard: false,
                position: 0
            },
            {
                number: 2,
                isOnBoard: false,
                position: 0
            },
            {
                number: 3,
                isOnBoard: false,
                position: 0
            },
            {
                number: 4,
                isOnBoard: false,
                position: 0
            }
        ],
    },
    green = {
        moves: [0],
        color: "green",
        items: [
            {
                number: 1,
                isOnBoard: false,
                position: 0
            },
            {
                number: 2,
                isOnBoard: false,
                position: 0
            },
            {
                number: 3,
                isOnBoard: false,
                position: 0
            },
            {
                number: 4,
                isOnBoard: false,
                position: 0
            }
        ],
    },
    orange = {
        moves: [0],
        color: "orange",
        items: [
            {
                number: 1,
                isOnBoard: false,
                position: 0
            },
            {
                number: 2,
                isOnBoard: false,
                position: 0
            },
            {
                number: 3,
                isOnBoard: false,
                position: 0
            },
            {
                number: 4,
                isOnBoard: false,
                position: 0
            }
        ],
    },
];

document.addEventListener("DOMContentLoaded", function (event) {
    init();
});

const init = () => {
    resetPieces();
    quitAllPices();
    playingColors = [];
    activePlayerNumber = 0;
    disableDice();
    document.getElementById("dice-button").addEventListener("click", async function () {
        await diceClick();
    });
    const checkBoxes = document.getElementsByName("checkbox");
    for (let i = 0; i < checkBoxes.length; i++) {
        const cb = checkBoxes[i];
        cb.addEventListener("change", function () {
            toggleCheckboxes();
        })
    };
    document.getElementById("playerNumbers").addEventListener("change", function () {
        toggleCheckboxes();
    });
    const container = document.getElementsByClassName("piece-container");
    for (let i = 0; i < container.length; i++) {
        const element = container[i];
        element.addEventListener("click", function () {
            pieceClick(this);
        });
    }
    window.addEventListener("resize", function () {
        onWindowResized();
    })
    
}

const start = () => {
    var audio = new Audio('audio/knock-wood-door.m4a');
    audio.play();
    if (playingColors.length > 0) {
        if (confirm("Restart the game!") != true) {
            return;
        }
        else {
            init();
        }
    }
    playingColors = [];
    const playersCount = document.getElementById("playerNumbers").value;
    const selectedColors = document.querySelectorAll(".color-picker input:checked");
    if (selectedColors == null || playersCount != selectedColors.length) {
        alert("Select players' colors");
        return;
    }
    for (let index = 0; index < selectedColors.length; index++) {
        const element = selectedColors[index];
        playingColors.push(element.parentElement.classList[1]);
    }
    hideNotPlayingColors();
    resetPieces();
    activePlayerNumber = 0;
    document.getElementById("activePlayer").innerHTML = playingColors[0];
    enableDice();
    openFullscreen();
}

const diceClick = async () => {
    if (isDiceEnable == false) {
        return;
    }
    disableDice();
    const color = playingColors[activePlayerNumber];
    const player = pieces.filter(x => x.color == color)[0];
    const rand = await rollDice();
    const hasItemOnBoard = player.items.filter(x => x.isOnBoard == true).length > 0;
    if (rand == 6) {
        if (hasItemOnBoard == true) {
            player.moves.push(rand);
            showActivePlayerDetails();

            enableDice();
            return;
        }
        else {
            enterPiece(activePlayerNumber, 1);
            nextTurn();
            return;
        }
    }
    else {
        if (hasItemOnBoard == false) {
            nextTurn();
            return;
        }
        player.moves.push(rand);
        showActivePlayerDetails();

        if (playerCanMove(player) == false) {
            player.moves = [0];
            showActivePlayerDetails();

            nextTurn();
            return;
        }
        return;
    }
}

const pieceClick = (pieceContainer) => {
    if (isDiceEnable == true) {
        return;
    }
    const pieceId = pieceContainer.id;
    const idParts = pieceId.split("-");
    const color = idParts[0];
    const itemNumber = idParts[2];
    const player = pieces.filter(x => x.color == color)[0];
    const piece = player.items.filter(x => x.number == itemNumber)[0];
    if (piece.isOnBoard == false) {
        if (player.moves.indexOf(6) > 0) {
            const isEntered = enterPiece(activePlayerNumber, piece.number);
            if (isEntered == true) {
                player.moves = [0];
                showActivePlayerDetails();

                nextTurn();
            }
            return;
        }
        else {
            console.log("You can't enter this item! For entering items you must get 6 on dice.");
            return;
        }
    }

    if (pieceCanMove(player, piece) == false) {
        console.log("You are not available to moves this item at this moment!");
        return;
    }
    checkDestination(player, piece);
    //
    const move = firstAvailableMove(player, piece);
    if (move < 1) {
        return;
    }
    piece.position += move;
    movePiece(piece, color, itemNumber, move);
    player.moves.splice(player.moves.indexOf(move), 1);
    showActivePlayerDetails();

    if (player.moves.reduce(add, 0) < 1 || playerCanMove(player) == false) {
        if (isGameFinished(player) == true) {
            alert("Player " + player.color + " has wone the race!")
        }
        nextTurn();
    }
}

const enterPiece = (activePlayerNumber, pieceNumber) => {
    const color = playingColors[activePlayerNumber];
    const player = pieces.filter(x => x.color == color)[0];
    if (player.items.filter(x => x.position == 1).length > 0) {
        console.log("You already have a piece in start position!");
        return false;
    }
    const start = document.querySelector("." + color + ".start-step");
    const rect = start.getBoundingClientRect();
    const container = document.getElementById(color + "-container-" + pieceNumber);
    translate(container, rect.left + 7, rect.top);
    // container.style.top = rect.top;// + document.scrollingElement.scrollHeight - document.scrollingElement.offsetHeight;
    // container.style.left = rect.left + 7;//+ document.scrollingElement.scrollWidth - document.scrollingElement.offsetWidth;
    const piece = player.items.filter(x => x.number == pieceNumber)[0];
    piece.position = 1;
    piece.isOnBoard = true;
    return true;
}

const nextTurn = () => {
    activePlayerNumber++;
    if (activePlayerNumber >= playingColors.length) {
        activePlayerNumber = 0;
    }
    showActivePlayerDetails();
    enableDice();
}

const movePiece = async (piece, color, itemNumber, move) => {
    let destination = null;
    for (let i = move - 1; i >= 0; i--) {
        let num = piece.position - i;
        if (num > 37) {
            const finalItemNumber = num - 37;
            console.log(`div[data-${color}-final-number='${finalItemNumber}']`);
            destination = document.querySelector(`div[data-${color}-final-number='${finalItemNumber}']`);
        }
        else {
            destination = document.querySelector("div[data-" + color + "-number='" + num + "']");
            console.log(`div[data-${color}-number='${num}']`);
        }
        const rect = destination.getBoundingClientRect();
        const container = document.getElementById(color + "-container-" + itemNumber);
        translate(container, rect.left + 7, rect.top);
        await sleep(400);
        var audio = new Audio('audio/knock-wood-door.m4a');
        audio.play();
        await sleep(300);
    }
    showActivePlayerDetails();
    // container.style.top = rect.top; //+ document.scrollingElement.scrollHeight - document.scrollingElement.offsetHeight;
    // container.style.left = rect.left + 7; //+ document.scrollingElement.scrollWidth - document.scrollingElement.offsetWidth;
}

const toggleCheckboxes = () => {
    const playersCount = document.getElementById("playerNumbers").value;
    const selectedColors = document.querySelectorAll(".color-picker input:checked");

    if (selectedColors != null && playersCount == selectedColors.length) {
        const unChecked = document.querySelectorAll(".color-picker input:not(:checked)");
        for (let index = 0; index < unChecked.length; index++) {
            const element = unChecked[index];
            element.disabled = true;
        }
    }
    else {
        const allInputs = document.querySelectorAll(".color-picker input");
        for (let index = 0; index < allInputs.length; index++) {
            const element = allInputs[index];
            element.disabled = false;
        }
    }
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const quitAllPices = () => {
    for (let index = 0; index < colors.length; index++) {
        for (let number = 1; number <= 4; number++) {
            quitPiece(colors[index], number);
        }

    }
}

const quitPiece = (color, number) => {
    const bench = document.getElementById(color + "-bench-" + number);
    var rect = bench.getBoundingClientRect();
    const container = document.getElementById(color + "-container-" + number);
    translate(container, rect.left, rect.top - 7);
    // container.style.top = rect.top - 7;
    // container.style.left = rect.left;
}

const hideNotPlayingColors = () => {
    for (let index = 0; index < colors.length; index++) {
        const element = colors[index];
        if (playingColors.indexOf(element) < 0) {
            hidePices(element);
        }
        else {
            showPices(element);
        }
    }
}

const hidePices = (color) => {
    for (let index = 1; index <= 4; index++) {
        document.getElementById(color + "-container-" + index).hidden = true;
    }
}

const showPices = (color) => {
    for (let index = 1; index <= 4; index++) {
        document.getElementById(color + "-container-" + index).hidden = false;
    }
}

const resetPieces = () => {
    pieces = [
        blue = {
            moves: [0],
            color: "blue",
            items: [
                {
                    number: 1,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 2,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 3,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 4,
                    isOnBoard: false,
                    position: 0
                }
            ],
        },
        red = {
            moves: [0],
            color: "red",
            items: [
                {
                    number: 1,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 2,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 3,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 4,
                    isOnBoard: false,
                    position: 0
                }
            ],
        },
        green = {
            moves: [0],
            color: "green",
            items: [
                {
                    number: 1,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 2,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 3,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 4,
                    isOnBoard: false,
                    position: 0
                }
            ],
        },
        orange = {
            moves: [0],
            color: "orange",
            items: [
                {
                    number: 1,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 2,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 3,
                    isOnBoard: false,
                    position: 0
                },
                {
                    number: 4,
                    isOnBoard: false,
                    position: 0
                }
            ],
        },
    ];
}

const enableDice = () => {
    document.getElementById("dice-button").disabled = false;
    isDiceEnable = true;
}

const disableDice = () => {
    document.getElementById("dice-button").disabled = true;
    isDiceEnable = false;
}

const playerCanMove = (player) => {
    let result = false;
    player.items.forEach(piece => {
        if (pieceCanMove(player, piece) == true) {
            result = true;
        }
    });
    return result;
}

const pieceCanMove = (player, piece) => {
    let result = false;
    if (piece.isOnBoard == false) {
        result = player.moves.indexOf(6) >= 0 && player.items.filter(x => x.isOnBoard == true && x.position == 1).length == 0;
    }
    else {
        for (let i = 0; i < player.moves.length; i++) {
            const move = player.moves[i];
            if (isMoveAvailable(player, piece, move)) {
                result = true;
                break;
            }
        }
    }
    return result;
}

const onWindowResized = () => {
    relocatePices();
}

const relocatePices = () => {
    for (let i = 0; i < pieces.length; i++) {
        const player = pieces[i];
        for (let j = 0; j < player.items.length; j++) {
            const item = player.items[j];
            if (item.isOnBoard) {
                movePiece(item, player.color, item.number, 1);
            }
            else {
                quitPiece(player.color, item.number);
            }
        }
    }
}

const isMoveAvailable = (player, piece, move) => {
    return (piece.position + move <= totalSteps
        && player.items.filter(x => x.position == piece.position + move).length == 0);
}

const firstAvailableMove = (player, piece) => {
    let availableMove = 0;
    for (let i = 0; i < player.moves.length; i++) {
        const move = player.moves[i];
        if (isMoveAvailable(player, piece, move) == true) {
            availableMove = move;
            break;
        }
    }
    return availableMove;
}

const isGameFinished = (player) => {
    if (player.items.filter(x => x.position == totalSteps).length > 0 && player.items.filter(x => x.position == totalSteps - 1).length > 0
        && player.items.filter(x => x.position == totalSteps - 2).length > 0 && player.items.filter(x => x.position == totalSteps - 3).length > 0) {
        return true;
    }
    return false;
}

const rollDice = async () => {
    const rand = Math.floor(Math.random() * 6) + 1;

    for (let i = 1; i < 6; i++) {
        if (rand != i) {
            document.getElementById("dice-image").src = `images/${i}.png`;
            await sleep(100);
        }
    }

    document.getElementById("dice-image").src = `images/${rand}.png`;
    return rand;
}

const checkDestination = (player, piece) => {
    const move = firstAvailableMove(player, piece);
    if (move <= 0) {
        return;
    }
    const destinationNumber = piece.position + move;
    const destinationAttrSelector = "data-" + player.color + "-number";
    const deadPiece = {
        isExist: false,
        color: "",
        number: 0
    };
    for (let i = 0; i < pieces.length; i++) {
        const element = pieces[i];
        const onBoardPieces = element.items.filter(x => x.isOnBoard && x.position <= commonSteps);
        for (let j = 0; j < onBoardPieces.length; j++) {
            const item = onBoardPieces[j];
            const container = document.querySelector("div[data-" + element.color + "-number='" + item.position + "']");
            if (container.getAttribute(destinationAttrSelector) == destinationNumber) {
                deadPiece.isExist = true;
                deadPiece.color = element.color;
                deadPiece.number = item.number;
                break;
            }
        }
    }
    if (deadPiece.isExist && deadPiece.color != player.color) {
        killItem(deadPiece.color, deadPiece.number)
    }
}

const killItem = (color, number) => {
    const player = pieces.filter(x => x.color == color)[0];
    const piece = player.items.filter(x => x.number == number)[0];
    piece.position = 0;
    piece.isOnBoard = false;
    quitPiece(color, number);
}

const openFullscreen = () => {
    document.documentElement.requestFullscreen()
}

const add = (accumulator, a) => {
    return accumulator + a;
}

const showActivePlayerDetails = () => {
    const color = playingColors[activePlayerNumber];
    const player = pieces.filter(x => x.color == color)[0];
    document.getElementById("activePlayer").innerHTML = color + ": " + player.moves.filter(x => x != 0);
}

const translate = (elem, x, y) => {
    var left = parseInt(css(elem, 'left'), 10),
        top = parseInt(css(elem, 'top'), 10),
        dx = left - x,
        dy = top - y,
        i = 1,
        count = 20,
        delay = 20;

    function loop() {
        if (i >= count) { return; }
        i += 1;
        elem.style.left = (left - (dx * i / count)).toFixed(0) + 'px';
        elem.style.top = (top - (dy * i / count)).toFixed(0) + 'px';
        setTimeout(loop, delay);
    }

    loop();
}

const css = (element, property) => {
    return window.getComputedStyle(element, null).getPropertyValue(property);
}