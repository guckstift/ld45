let terras = ["grass", "soil", "stone", "sand", "water"];
let mapSize = 16;
let tileSize = 32;

onkeydown = e => {
	if(e.key === "ArrowLeft") {
		setChar(char.x - 1, char.y);
	}
	if(e.key === "ArrowRight") {
		setChar(char.x + 1, char.y);
	}
	if(e.key === "ArrowUp") {
		setChar(char.x, char.y - 1);
	}
	if(e.key === "ArrowDown") {
		setChar(char.x, char.y + 1);
	}
};

for(let y=0; y<mapSize; y++) {
	let row = newElm("row");
	
	for(let x=0; x<mapSize; x++) {
		let terra = randChoice(terras);
		let tile = newElm("tile " + terra);
		tile.terra = terra;
		row.append(tile);
	}
	
	ground.append(row);
}

for(let i=0; i<1024; i++) {
	let x = randInt(mapSize);
	let y = randInt(mapSize);
	let tile = getTile(x, y);
	
	if(tile.terra !== "water") {
		setChar(x, y);
		break;
	}
}

function newElm(cls)
{
	let elm = document.createElement("div");
	elm.className = cls;
	return elm;
}

function hexColor(r, g, b)
{
	return (
		"#"
		+ Math.floor(255 * r).toString(16).padStart(2, "0")
		+ Math.floor(255 * g).toString(16).padStart(2, "0")
		+ Math.floor(255 * b).toString(16).padStart(2, "0")
	);
}

function randInt(n)
{
	return Math.floor(Math.random() * n);
}

function randChoice(arr)
{
	return arr[randInt(arr.length)];
}

function getTile(x, y)
{
	return ground.children[y].children[x];
}

function setChar(x, y)
{
	char.x = x;
	char.y = y;
	char.style.left = x * tileSize + "px";
	char.style.top = y * tileSize + "px";
}
