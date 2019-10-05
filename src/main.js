let terras = ["grass", "soil", "stone", "sand", "water"];
let mapSize = 32;
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
		let tile = newElm("tile " + terra);
		tile.terra = terra;
		row.append(tile);
		
		if(tile.terra === "grass") {
			let tree = newElm("tree");
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
}

function setChar(x, y)
{
	setSpritePos(char, x, y);
	
	let charRect = char.getBoundingClientRect();
	let viewRect = viewport.getBoundingClientRect();
	
	if(charRect.right - viewRect.right > 0) {
		viewport.scrollLeft += charRect.right - viewRect.right;
	}
	if(charRect.left - viewRect.left < 0) {
		viewport.scrollLeft += charRect.left - viewRect.left;
	}
	if(charRect.bottom - viewRect.bottom > 0) {
		viewport.scrollTop += charRect.bottom - viewRect.bottom;
	}
	if(charRect.top - viewRect.top < 0) {
		viewport.scrollTop += charRect.top - viewRect.top;
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








