let rndseed = 64;//60;57;55;54;//52;46;44;14;10;666;
let rndcnt = 0;
let terras = ["grass", "soil", "stone", "sand", "water"];
let mapSize = 64;
let tileSize = 32;
let radius = 1;
let screenSize = 920;
let screenW = screenSize + 100;
let screenH = screenSize;

let moveLock = false;
let continentTiles = [];
let tilesToFill = 0;
let continentCnt = 0;

onload = init;
onkeydown = keyDown;
onmousemove = mouseMove;
onclick = click;

function init()
{
	world.offsX = 0;
	world.offsY = 0;

	for(let y=0; y<mapSize; y++) {
		let row = newElm("row nodisplay");
		row.style.top = y * tileSize + "px";
		
		for(let x=0; x<mapSize; x++) {
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
			else if(tile.terra === "stone" && randInt(2) === 0) {
				addNewObject("rock", tile);
			}
		}
		
		ground.append(row);
	}

	for(let y=0; y<mapSize; y++) {
		for(let x=0; x<mapSize; x++) {
			let tile = getTile(x, y);
			
			if(tile.terra === "sand" && randInt(16) === 0) {
				addNewObject("sandStone", tile);
			}
		}
	}
	
	//initChar();

	/*
	for(let y=0; y<mapSize; y++) {
		for(let x=0; x<mapSize; x++) {
			let tile = getTile(x, y);
			
			if(!tile.obj && randInt(128) === 0) {
				addNewObject("item blueDiamond", tile, true);
			}
		}
	}
	*/
	
	fillTerraCircle(20, 10, 5, "sand");
	fillTerraCircle(24, 11, 7, "sand");
	fillTerraCircle(20, 10, 4, "water");
	fillTerraCircle(24, 11, 6, "water");
	
	setChar(13, 18);
	
	addNewObject("item axe", getTile(16, 20), true); // first axe
	addNewObject("item pickaxe", getTile(20, 16), true); // pickaxe
	addNewObject("item redDiamond", getTile(13, 21), true);
	addNewObject("item greenDiamond", getTile(5, 11), true);
	addNewObject("item blueDiamond", getTile(25, 10), true);
	
	addNewObject("item carrot", getTile(17, 13), true);
	addNewObject("item carrot", getTile(10, 18), true);
	addNewObject("item carrot", getTile(6, 15), true);
	addNewObject("item carrot", getTile(14, 6), true);
	addNewObject("item carrot", getTile(0, 17), true);
	
	addNewObject("rock", getTile(6, 14)); // close in blue diamond
	addNewObject("rock", getTile(18, 19));
	addNewObject("rock", getTile(7, 12));
	addNewObject("rock", getTile(8, 18));
	addNewObject("rock", getTile(15, 13));
	addNewObject("mossRock", getTile(13, 22));
	addNewObject("rock", getTile(14, 21));
	addNewObject("sandStone", getTile(14, 5));
	
	/*
	fillContinent(char.x, char.y, 0, () => {
		placeFirstAxe();
	});
	*/
	
	centerToChar();
	requestAnimationFrame(frame);
}

function fillTerraCircle(x, y, r, terra)
{
	for(let dy=-r; dy<=+r; dy++) {
		for(let dx=-r; dx<=+r; dx++) {
			if(dx * dx + dy * dy <= r * r) {
				let tile = getTile(x + dx, y + dy);
				tile.classList.remove(tile.terra);
				tile.terra = terra;
				tile.classList.add(tile.terra);
				
				if(terra === "water" && tile.obj) {
					removeObjectAt(tile);
				}
			}
		}
	}
}

function addNewObject(type, tile, walkable = false)
{
	removeObjectAt(tile);
	
	let dispCls = "";
	
	if(tile.classList.contains("nodisplay")) {
		dispCls = "nodisplay invis ";
	}
	
	let obj = newElm("sprite " + dispCls + type);
	obj.type = type;
	obj.walkable = walkable;
	//let tile = getTile(x, y);
	tile.obj = obj;
	setSpritePos(obj, tile.x, tile.y);
	world.append(obj);
}

function removeObjectAt(tile)
{
	if(tile && tile.obj) {
		tile.obj.remove();
		tile.obj = null;
	}
}

function keyDown(e)
{
	if(e.key.startsWith("Arrow") || ["w", "a", "s", "d"].includes(e.key)) {
		moveChar(e.key);
	}
}

function mouseMove(e)
{
	let [x, y] = clientPointToCoord(e.clientX, e.clientY);
	
	/*
	setToolCursor();
	
	[[-1,0], [+1,0], [0,-1], [0,+1]].forEach(([dx, dy]) => {
		if(testAdjacentPoint(x, y, dx, dy)) {
			mouseOverAdj(char.x + dx, char.y + dy);
		}
	});
	*/
}

function clientPointToCoord(x, y)
{
	let rect = viewport.getBoundingClientRect();
	x = Math.floor((x - rect.left + world.offsX) / tileSize);
	y = Math.floor((y - rect.top + world.offsY) / tileSize);
	return [x, y];
}

function click(e)
{
	let [x, y] = clientPointToCoord(e.clientX, e.clientY);
	
	console.log(x, y);
	fillContinent(x, y);
	
	/*
	let [x, y] = [e.clientX, e.clientY];
	
	setToolCursor();
	
	[[-1,0], [+1,0], [0,-1], [0,+1]].forEach(([dx, dy]) => {
		if(testAdjacentPoint(x, y, dx, dy)) {
			clickAdj(char.x + dx, char.y + dy);
		}
	});
	*/
}

function mouseOverAdj(x, y)
{
	let tile = getTile(x, y);
	
	if(tile.obj) {
		let tool = getToolFor(tile.obj.type);
		
		if(tool) {
			setToolCursor(tool, x, y);
		}
	}
}

function setToolCursor(tool, x, y)
{
	toolCursor.type && toolCursor.classList.remove(toolCursor.type);
	toolCursor.style.display = "";
	toolCursor.type = null;
	toolCursor.tool = null;
	
	if(tool) {
		let tile = getTile(x, y);
		let rect = tile.getBoundingClientRect();
		toolCursor.type && toolCursor.classList.remove(toolCursor.type);
		toolCursor.type = tool.type;
		toolCursor.tool = tool;
		toolCursor.classList.add(tool.type);
		toolCursor.style.left = rect.left + "px";
		toolCursor.style.top = rect.top + "px";
		toolCursor.style.display = "block";
	}
}

function clickAdj(x, y)
{
	let tile = getTile(x, y);
	
	if(tile.obj) {
		let tool = getToolFor(tile.obj.type);
		
		if(tool) {
			useTool(tool, tile);
		}
	}
}

function testAdjacentPoint(px, py, dx, dy)
{
	let tile = getTile(char.x + dx, char.y + dy);
	
	if(tile) {
		let rect = tile.getBoundingClientRect();
		
		if(pointInRect(px, py, rect)) {
			return true;
		}
	}
	
	return false;
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
		pickupItemAt(tile);
	}
	
	updateViewRange();
}

function updateViewRange()
{
	for(let dy=-radius; dy<=+radius; dy++) {
		for(let dx=-radius; dx<=+radius; dx++) {
			if(dx * dx + dy * dy <= radius * radius) {
				let tile = getTile(char.x + dx, char.y + dy);
				tile && tile.classList.remove("nodisplay");
				setTimeout(() => tile && tile.classList.remove("invis"));
				tile && tile.obj && tile.obj.classList.remove("nodisplay");
				setTimeout(() => tile && tile.obj && tile.obj.classList.remove("invis"));
			}
		}
	}
}

function pickupItemAt(tile)
{
	let obj = tile.obj;
	obj.classList.add("picking-up");
	
	setTimeout(() => {
		let type = obj.type.slice(5);
		
		if(type === "carrot") {
			radius ++;
			updateViewRange();
		}
		else {
			addInventoryItem(type);
		}
		
		removeObjectAt(tile);
	}, 250);
}

function cutTree(tile)
{
	tile.obj.remove();
	tile.obj = null;
	addInventoryItem("wood");
}

function pickRock(tile)
{
	tile.obj.remove();
	tile.obj = null;;
	addInventoryItem("brick");
}

function pickSandStone(tile)
{
	tile.obj.remove();
	tile.obj = null;;
	addInventoryItem("sandBrick");
}

function useTool(tool, tile)
{
	let dur = tool.durability;
	dur.val = Math.max(0, dur.val - 1);
	let rel = dur.val / dur.maxval;
	dur.style.width = rel * 100 + "%";
	dur.style.background = hexColor(1 - rel, rel, 0);
	
	if(tool.type === "axe" && tile.obj.type === "tree") {
		cutTree(tile);
	}
	else if(tool.type === "pickaxe" && (tile.obj.type === "rock" || tile.obj.type === "mossRock")) {
		pickRock(tile);
	}
	else if(tool.type === "pickaxe" && tile.obj.type === "sandStone") {
		pickSandStone(tile);
	}
	
	if(rel <= 0) {
		tool.remove();
	}
}

function centerToChar()
{
	let charRect = char.getBoundingClientRect();
	world.offsX = char.xpx - screenW / 2;
	world.offsY = char.ypx - screenH / 2;
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
	}
	
	delta = charRect.left - viewRect.left - tileSize * scrollRadius;
	
	if(delta < 0) {
		world.offsX += delta;
		world.style.left = -world.offsX + "px";
	}
	
	delta = charRect.bottom - viewRect.bottom + tileSize * scrollRadius;
	
	if(delta > 0) {
		world.offsY += delta;
		world.style.top = -world.offsY + "px";
		ymove = true;
	}
	
	delta = charRect.top - viewRect.top - tileSize * scrollRadius;
	
	if(delta < 0) {
		world.offsY += delta;
		world.style.top = -world.offsY + "px";
		ymove = true;
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
			if(y >= firsty && y <= firsty + Math.ceil(screenH / tileSize)) {
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
	if(moveLock) {
		return;
	}
	
	let x = char.x;
	let y = char.y;
	
	if(dir === "ArrowLeft" || dir === "a") {
		x --;
	}
	else if(dir === "ArrowRight" || dir === "d") {
		x ++;
	}
	else if(dir === "ArrowUp" || dir === "w") {
		y --;
	}
	else if(dir === "ArrowDown" || dir === "s") {
		y ++;
	}
	
	let tile = getTile(x, y);
	
	if(!walkable(tile)) {
		if(toolCursor.tool) {
			clickAdj(x, y);
			setToolCursor();
		}
		else {
			mouseOverAdj(x, y);
		}
	}
	else {
		setToolCursor();
		
		if(tile.terra !== "water") {
			setChar(x, y);
		}
	}
	
	moveLock = true;
	setTimeout(() => moveLock = false, 12);//125);
}

function fillContinent(x = char.x, y = char.y, interval = 0, cb = null, root = true)
{
	let tile = getTile(x, y);
	
	if(root) {
		continentCnt++;
	}
		
	if(walkable(tile) && !tile.continent) {
		tile.continent = continentCnt;
		tile.style.background = hexColor(
			tile.continent >> 0 & 1,
			tile.continent >> 1 & 1,
			tile.continent >> 2 & 1,
		);
		continentTiles.push({x, y});
		lastContinentTile = {x, y};
		tilesToFill += 4;
		
		setTimeout(() => {
			fillContinent(x - 1, y, interval, cb, false);
			tilesToFill --;
			fillContinent(x + 1, y, interval, cb, false);
			tilesToFill --;
			fillContinent(x, y - 1, interval, cb, false);
			tilesToFill --;
			fillContinent(x, y + 1, interval, cb, false);
			tilesToFill --;
		}, interval);
	}
	
	if(cb && tilesToFill === 1) {
		cb();
	}
}

function placeFirstAxe()
{
	let {x, y} = lastContinentTile;
	let tile = getTile(x, y);
	addNewObject("item axe", tile, true);
}







