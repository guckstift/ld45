let rndseed = 64;//60;57;55;54;//52;46;44;14;10;666;
let rndcnt = 0;
let terras = ["grass", "soil", "stone", "sand", "water"];
let mapSize = 64;
let tileSize = 32;
let radius = 8;

let moveLock = false;
let continentTiles = [];
let tilesToFill = 0;

onload = init;
onkeydown = keyDown;

function init()
{
	world.offsX = 0;
	world.offsY = 0;

	for(let y=0; y<mapSize; y++) {
		let row = newElm("row nodisplay");
		row.style.top = y * tileSize + "px";
		
		for(let x=0; x<mapSize; x++) {
			//let prob = Math.floor(noise2d(x, y) * terras.length);
			//let terra = terras[prob];
			let terra = randChoice(terras);
			let tile = newElm("tile nodisplay invis " + terra);
			tile.x = x;
			tile.y = y;
			tile.style.left = x * tileSize + "px";
			tile.terra = terra;
			row.append(tile);
			
			if(tile.terra === "grass" && randInt(2) === 0) {
				addNewObject("tree", tile);
			}
			
			if(tile.terra === "stone" && randInt(2) === 0) {
				addNewObject("rock", tile);
			}
		}
		
		ground.append(row);
	}
	
	initChar();
	
	fillContinent(char.x, char.y, 0, () => {
		placeFirstAxe();
	});
	
	centerToChar();
	requestAnimationFrame(frame);
}

function addNewObject(type, tile, walkable = false)
{
	let dispCls = "";
	
	if(tile.classList.contains("nodisplay")) {
		dispCls = "nodisplay invis ";
	}
	
	let obj = newElm("sprite " + dispCls + type);
	obj.walkable = walkable;
	//let tile = getTile(x, y);
	tile.obj = obj;
	setSpritePos(obj, tile.x, tile.y);
	world.append(obj);
}

function keyDown(e)
{
	if(e.key.startsWith("Arrow")) {
		moveChar(e.key);
	}
}

function frame()
{
	requestAnimationFrame(frame);
	scrollToChar();
}

function initChar()
{
	for(let i=0; i<1024; i++) {
		//let x = Math.floor(noise1d(1 + i) * mapSize);
		//let y = Math.floor(noise1d(2 + i) * mapSize);
		let x = randInt(mapSize);
		let y = randInt(mapSize);
		let tile = getTile(x, y);
		
		if(walkable(tile)) {
			setChar(x, y);
			return;
		}
	}
	
	throw "Could not place character";
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
	setSpritePos(char, x, y);
	
	let tile = getTile(x, y);
	
	if(tile && tile.obj && tile.obj.classList.contains("item")) {
		pickupItem(tile.obj);
	}
	
	for(let dy=-radius; dy<=+radius; dy++) {
		for(let dx=-radius; dx<=+radius; dx++) {
			if(dx * dx + dy * dy <= radius * radius) {
				let tile = getTile(x + dx, y + dy);
				tile && tile.classList.remove("nodisplay");
				setTimeout(() => tile && tile.classList.remove("invis"));
				tile && tile.obj && tile.obj.classList.remove("nodisplay");
				setTimeout(() => tile && tile.obj && tile.obj.classList.remove("invis"));
			}
		}
	}
}

function pickupItem(obj)
{
	obj.classList.add("picking-up");
	
	setTimeout(() => {
		sidebar.append(obj);
		obj.classList.add("inv-item");
		obj.classList.remove("picking-up");
		obj.classList.remove("sprite");
		obj.classList.remove("item");
	}, 250);
}

function centerToChar()
{
	let charRect = char.getBoundingClientRect();
	world.offsX = char.xpx - 256;
	world.offsY = char.ypx - 256;
	world.style.left = -world.offsX + "px";
	world.style.top = -world.offsY + "px";
	updateCullRows();
}

function scrollToChar()
{
	let charRect = char.getBoundingClientRect();
	let viewRect = viewport.getBoundingClientRect();
	let delta;
	let ymove = false;
	
	let scrollRadius = Math.min(radius + 1, 7);
	
	delta = charRect.right - viewRect.right + tileSize * scrollRadius;
	
	if(delta > 0) {
		world.offsX += delta;
		world.style.left = -world.offsX + "px";
		//viewport.scrollLeft += delta;
	}
	
	delta = charRect.left - viewRect.left - tileSize * scrollRadius;
	
	if(delta < 0) {
		world.offsX += delta;
		world.style.left = -world.offsX + "px";
		//viewport.scrollLeft += delta;
	}
	
	delta = charRect.bottom - viewRect.bottom + tileSize * scrollRadius;
	
	if(delta > 0) {
		world.offsY += delta;
		world.style.top = -world.offsY + "px";
		ymove = true;
		//viewport.scrollTop += delta;
	}
	
	delta = charRect.top - viewRect.top - tileSize * scrollRadius;
	
	if(delta < 0) {
		world.offsY += delta;
		world.style.top = -world.offsY + "px";
		ymove = true;
		//viewport.scrollTop += delta;
	}
	
	if(ymove) {
		updateCullRows();
	}
}

function updateCullRows()
{
	for(let y=0; y<mapSize; y++) {
		let firsty = Math.floor(world.offsY / tileSize);
		let row = getRow(y);
		
		if(row) {
			if(y >= firsty && y <= firsty + 16) {
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

function posOutside(x, y)
{
	return x < 0 || x >= mapSize || y < 0 || y >= mapSize;
}

function walkable(tile)
{
	if(!tile || tile.terra === "water") {
		return false;
	}
	
	if(tile.obj && tile.obj.walkable === false) {
		return false;
	}
	
	return true;
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
	
	if(moveLock) {
		return;
	}
	
	moveLock = true;
	setTimeout(() => moveLock = false, 125);
	
	if(tile.terra !== "water") {
		setChar(x, y);
	}
}

function fillContinent(x = char.x, y = char.y, interval = 1000, cb = null)
{
	let tile = getTile(x, y);
		
	if(walkable(tile) && !tile.continent) {
		tile.continent = 1;
		tile.style.background = "#f66";
		continentTiles.push({x, y});
		lastContinentTile = {x, y};
		tilesToFill += 4;
		
		setTimeout(() => {
			fillContinent(x - 1, y, interval, cb);
			tilesToFill --;
			fillContinent(x + 1, y, interval, cb);
			tilesToFill --;
			fillContinent(x, y - 1, interval, cb);
			tilesToFill --;
			fillContinent(x, y + 1, interval, cb);
			tilesToFill --;
		}, interval);
	}
	
	if(cb && tilesToFill === 1) {
		cb();
	}
}

function placeFirstAxe()
{
	var {x, y} = lastContinentTile;
	//console.log(x, y);
	//var {x, y} = continentTiles[continentTiles.length - 1];
	let tile = getTile(x, y);
	addNewObject("item axe", tile, true);
	/*
	var {x, y} = continentTiles[continentTiles.length - 2];
	tile = getTile(x, y);
	addNewObject("item axe", tile, true);
	*/
}







