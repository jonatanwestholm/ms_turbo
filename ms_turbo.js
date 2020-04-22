class Game{
    constructor(width, height, num_mines){
        this.width = width;
        this.height = height;
        this.num_mines = num_mines;

        const gameElement = document.getElementById("game");
        this.mount(gameElement);
        this.init_visible();
        this.init_labels();
        this.init_game();
        this.refresh();
    }

    init_game(){
        httpGetAsync(`http://127.0.0.1:5000/newgame/${this.width}/${this.height}/${this.num_mines}`, 
                     parse_response, this);
    }

    init_labels(){
        /*get this from GET request to python web app*/
        /*No, just use placeholder value*/
        this.label = [];
        for (let y = 0; y < this.height; y++){
            this.label.push([])
            for (let x = 0; x < this.width; x++){
                this.label[y].push(0);
            }
        }        
    }

    init_visible(){
        this.visible = [];
        for (let y = 0; y < this.height; y++){
            this.visible.push([])
            for (let x = 0; x < this.width; x++){
                this.visible[y].push(0);
            }
        }        
    }

    refresh(){
        for (let y = 0; y < this.height; y++){
            for (let x = 0; x < this.width; x++){
                let className;
                if (this.visible[y][x]){
                    className = `known label-${this.label[y][x]}`;
                    if (this.label[y][x] == 0){
                        className = "known";
                    }
                }else{
                    className = "unknown";
                }
                this.cells[y][x].className = 'cell ' + className;
            }
        }
        set_message(`${this.remaining_mines()} mines left`);
    }

    remaining_mines(){
        var visible_mines = 0;
        for (let y = 0; y < this.height; y++){
            for (let x = 0; x < this.width; x++){
                if (this.visible[y][x]){
                    if (this.label[y][x] == 9){
                        visible_mines++;
                    }
                }
            }
        }
        return this.num_mines - visible_mines;
    }

    mount(gameElement){
        const boardElement = document.createElement("div");
        boardElement.className = "board";
        boardElement.id = "board";
        gameElement.appendChild(boardElement);

        this.cells = [];

        for (let y = 0; y < this.height; y++){
            this.cells.push([]);
            const row = document.createElement("div");
            row.className = "board-row";
            for (let x = 0; x < this.width; x++){
                const cell = document.createElement("div");
                cell.className = "cell unknown";
                cell.onmousedown = e => this.cellMouseDown(e, x, y);
                cell.oncontextmenu = e => e.preventDefault();
                row.appendChild(cell);
                this.cells[y].push(cell);
            }
            boardElement.appendChild(row);
        }
    }

    cellMouseDown(e, x, y){
        switch(e.button) {
            case 0:
                e.preventDefault();
                this.open_tile(x, y, 0);
                //this.visible[y][x] = 1;
                //alert(`Left-clicked (${x}, ${y})`);
                //greeting = document.createElement("p");
                //greeting.text = `Clicked (${x}, ${y})`;
                break;
            case 2:
                e.preventDefault();
                this.open_tile(x, y, 1);
                //alert(`Right-clicked (${x}, ${y})`);
                break;
        }
        if (this.remaining_mines() == 0){
            set_message("You won!");
        }
    }

    open_tile(x, y, action){
        /*insert GET request from python webapp here*/
        httpGetAsync(`http://127.0.0.1:5000/${x}/${y}/${action}`, parse_response, this)
        this.refresh();
    }
    
}

function parse_response(game, json){
    var tiles = JSON.parse(json).tiles;
    let tile;
    let i;
    for (i in tiles){
        tile = tiles[i];
        game.visible[tile.y][tile.x] = 1;
        game.label[tile.y][tile.x] = tile.label;
    }
}


function httpGetAsync(theUrl, callback, game)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            if (callback != null){
                callback(game, xmlHttp.responseText);
            }
    }
    xmlHttp.open("GET", theUrl, false); // false for synchronous 
    xmlHttp.send(null);
}

function newGame(event) {
    if (event) {
        event.preventDefault();
    }

    const gameElement = document.getElementById("game");
    gameElement.innerHTML = '';
    const easy = document.getElementById("easy").checked;

    if (easy){
        game = new Game(20, 20, 72);
        set_message(`Created easy game.\n${game.remaining_mines()} mines left`);
    }else{
        game = new Game(30, 16, 99);
        set_message(`Created hard game.\n${game.remaining_mines()} mines left`);
    }


    //game.mount(gameElement);
    //updateSettings();
    updateSize();
}

function updateSize() {
    const board = document.getElementById('board');
    if (board.scrollWidth > board.offsetWidth) {
        const factor = board.offsetWidth / board.scrollWidth;
        board.style.transform = `scale(${factor})`;
        board.style.transformOrigin = 'top left';
        board.style.height = (board.scrollHeight * factor) + 'px';
    } else {
        board.style.transform = '';
        board.style.height = 'auto';
    }
}

function set_message(message){
    document.getElementById("message").value = message;
}

