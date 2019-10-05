let terras = ["grass", "soil", "stone", "sand", "water"];
let mapSize = 256;
let tileSize = 32;

onload = e => {
	initChar();
};

onkeydown = e => {
	if(e.key.startsWith("Arrow")) {
		moveChar(e.key);
	}
};

for(let y=0; y<mapSize; y++) {
	let row = newElm("row");
	
	for(let x=0; x<mapSize; x++) {
		let terra = randChoice(terras);
		let tile = newElm("tile invis " + terra);
		tile.terra = terra;
		row.append(tile);
		
		if(tile.terra === "grass" && randInt(2) === 0) {
			let tree = newElm("sprite invis tree");
			tile.obj = tree;
			setSpritePos(tree, x, y);
			world.append(tree);
		}
	}
	
	ground.append(row);
}

function initChar()
{
	for(let i=0; i<1024; i++) {
		let x = randInt(mapSize);
		let y = randInt(mapSize);
		let tile = getTile(x, y);
		
		if(tile.terra !== "water") {
			setChar(x, y);
			break;
		}
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

function setSpritePos(sprite, x, y)
{
	sprite.x = x;
	sprite.y = y;
	sprite.xpx = x * tileSize;
	sprite.ypx = y * tileSize;
	sprite.style.left = sprite.xpx + "px";
	sprite.style.top = sprite.ypx + "px";
	sprite.style.zIndex = 1000 + sprite.ypx;
}

function setChar(x, y)
{
	setSpritePos(char, x, y);
	
	let tile;
	tile = getTile(x, y);
	tile && tile.classList.remove("invis");
	tile && tile.obj && tile.obj.classList.remove("invis");
	tile = getTile(x - 1, y);
	tile && tile.classList.remove("invis");
	tile && tile.obj && tile.obj.classList.remove("invis");
	tile = getTile(x + 1, y);
	tile && tile.classList.remove("invis");
	tile && tile.obj && tile.obj.classList.remove("invis");
	tile = getTile(x, y - 1);
	tile && tile.classList.remove("invis");
	tile && tile.obj && tile.obj.classList.remove("invis");
	tile = getTile(x, y + 1);
	tile && tile.classList.remove("invis");
	tile && tile.obj && tile.obj.classList.remove("invis");
	
	let charRect = char.getBoundingClientRect();
	let viewRect = viewport.getBoundingClientRect();
	let delta;
	
	delta = charRect.right - viewRect.right + tileSize;
	
	if(delta > 0) {
		viewport.scrollLeft += delta;
	}
	
	delta = charRect.left - viewRect.left - tileSize;
	
	if(delta < 0) {
		viewport.scrollLeft += delta;
	}
	
	delta = charRect.bottom - viewRect.bottom + tileSize;
	
	if(delta > 0) {
		viewport.scrollTop += delta;
	}
	
	delta = charRect.top - viewRect.top - tileSize;
	
	if(delta < 0) {
		viewport.scrollTop += delta;
	}
}

function posOutside(x, y)
{
	return x < 0 || x >= mapSize || y < 0 || y >= mapSize;
}

function moveChar(dir)
{
	let x = char.x;
	let y = char.y;
	
	if(dir === "ArrowLeft") {
		x --;
	}
	else if(dir === "ArrowRight") {
		x ++;
	}
	else if(dir === "ArrowUp") {
		y --;
	}
	else if(dir === "ArrowDown") {
		y ++;
	}
	
	if(posOutside(x, y)) {
		return;
	}
	
	let tile = getTile(x, y);
	
	if(tile.terra !== "water") {
		setChar(x, y);
	}
}








