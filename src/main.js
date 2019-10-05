let terras = ["grass", "soil", "stone", "sand", "water"];
let mapSize = 64;
let tileSize = 32;

world.offsX = 0;
world.offsY = 0;

onload = e => {
	initChar();
};

onkeydown = e => {
	if(e.key.startsWith("Arrow")) {
		moveChar(e.key);
	}
};

for(let y=0; y<mapSize; y++) {
	let row = newElm("row nodisplay");
	row.style.top = y * tileSize + "px";
	
	for(let x=0; x<mapSize; x++) {
		let terra = randChoice(terras);
		let tile = newElm("tile nodisplay invis " + terra);
		tile.style.left = x * tileSize + "px";
		tile.terra = terra;
		row.append(tile);
		
		if(tile.terra === "grass" && randInt(2) === 0) {
			let tree = newElm("sprite nodisplay invis tree");
			tile.obj = tree;
			setSpritePos(tree, x, y);
			world.append(tree);
		}
	}
	
	ground.append(row);
}

requestAnimationFrame(frame);

function frame()
{
	requestAnimationFrame(frame);
	scrollToChar();
}

function initChar()
{
	for(let i=0; i<1024; i++) {
		let x = randInt(mapSize);
		let y = randInt(mapSize);
		let tile = getTile(x, y);
		
		if(walkable(tile)) {
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

function getRow(y)
{
	if(!posOutside(0, y)) {
		return ground.children[y];
	}
}

function getTile(x, y)
{
	if(!posOutside(x, y)) {
		return ground.children[y].children[x];
	}
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
	let radius = 1;
	
	setSpritePos(char, x, y);
	
	for(let dy=-radius; dy<=+radius; dy++) {
		for(let dx=-radius; dx<=+radius; dx++) {
			let tile = getTile(x + dx, y + dy);
			tile && tile.classList.remove("nodisplay");
			setTimeout(() => tile && tile.classList.remove("invis"));
			tile && tile.obj && tile.obj.classList.remove("invis");
			setTimeout(() => tile && tile.obj && tile.obj.classList.remove("nodisplay"));
		}
	}
}

function scrollToChar()
{
	let charRect = char.getBoundingClientRect();
	let viewRect = viewport.getBoundingClientRect();
	let delta;
	let ymove = false;
	
	delta = charRect.right - viewRect.right + tileSize;
	
	if(delta > 0) {
		world.offsX += delta;
		world.style.left = -world.offsX + "px";
		//viewport.scrollLeft += delta;
	}
	
	delta = charRect.left - viewRect.left - tileSize;
	
	if(delta < 0) {
		world.offsX += delta;
		world.style.left = -world.offsX + "px";
		//viewport.scrollLeft += delta;
	}
	
	delta = charRect.bottom - viewRect.bottom + tileSize;
	
	if(delta > 0) {
		world.offsY += delta;
		world.style.top = -world.offsY + "px";
		ymove = true;
		//viewport.scrollTop += delta;
	}
	
	delta = charRect.top - viewRect.top - tileSize;
	
	if(delta < 0) {
		world.offsY += delta;
		world.style.top = -world.offsY + "px";
		ymove = true;
		//viewport.scrollTop += delta;
	}
	
	if(ymove) {
		for(let y=0; y<mapSize; y++) {
			let firsty = Math.floor(world.offsY / tileSize);
			let row = getRow(y);
			
			if(row) {
				if(y > firsty && y < firsty + 16) {
					if(row.classList.contains("nodisplay")) {
						row.classList.remove("nodisplay");
					}
				}
				else {
					if(!row.classList.contains("nodisplay")) {
						row.classList.add("nodisplay");
					}
				}
			}
		}
	}
}

function posOutside(x, y)
{
	return x < 0 || x >= mapSize || y < 0 || y >= mapSize;
}

function walkable(tile)
{
	return tile && tile.terra !== "water" && !tile.obj;
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
	
	let tile = getTile(x, y);
	
	if(!walkable(tile)) {
		return;
	}
	
	
	if(tile.terra !== "water") {
		setChar(x, y);
	}
}








