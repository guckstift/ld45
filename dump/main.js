let rndseed = 64;//60;57;55;54;//52;46;44;14;10;666;
let rndcnt = 0;
let terras = ["grass", "soil", "stone", "sand", "water"];
let mapSize = 64;
let tileSize = 32;
let radius = 1;
let screenSize = 920;
let screenW = screenSize + 100;
let screenH = screenSize;
let woodForRaft = 2;
let diamondsFound = 0;

let moveLock = false;
let continentTiles = [];
let tilesToFill = 0;
let continentCnt = 0;
let onraft = false;

onload = init;
onkeydown = keyDown;
onmousemove = mouseMove;
onclick = click;

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
	
	return obj;
}

function addLaserSender(color, tile, rot = 0)
{
	let dispCls = "";
	
	if(tile.classList.contains("nodisplay")) {
		dispCls = "nodisplay invis ";
	}
	
	let sender = addNewObject("laserSender", tile);
	sender.classList.add(color);
	let beam = newElm("sprite " + dispCls + "laserBeam " + color + " rotate" + rot);
	sender.beam = beam;
	sender.rot = rot;
	setSpritePos(beam, tile.x, tile.y);
	world.append(beam);
	
	return sender;
}

function rotateSender(sender)
{
	sender.beam.classList.remove("rotate" + sender.rot);
	sender.rot = (sender.rot + 1) % 8;
	sender.beam.classList.add("rotate" + sender.rot);
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
		else if(tile.obj.type === "laserSender") {
			setBuildCursor("rotate", x, y);
		}
	}
	else if(tile.terra === "water") {
		let wood = getItemOf("wood");
		
		if(wood && wood.count >= woodForRaft) {
			setBuildCursor("raft", x, y);
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
		toolCursor.type = tool.type;
		toolCursor.tool = tool;
		toolCursor.classList.add(tool.type);
		toolCursor.style.left = rect.left + "px";
		toolCursor.style.top = rect.top + "px";
		toolCursor.style.display = "block";
	}
}

function setBuildCursor(type, x, y)
{
	toolCursor.type && toolCursor.classList.remove(toolCursor.type);
	toolCursor.style.display = "";
	toolCursor.type = null;
	toolCursor.tool = null;
	
	if(type) {
		let tile = getTile(x, y);
		let rect = tile.getBoundingClientRect();
		toolCursor.type = type;
		toolCursor.classList.add(type);
		toolCursor.style.left = rect.left + "px";
		toolCursor.style.top = rect.top + "px";
		toolCursor.style.display = "block";
	}
}

function clickAdj(x, y)
{
	let tile = getTile(x, y);
	
	console.log("clickAdj");
	
	if(tile.obj) {
		let tool = getToolFor(tile.obj.type);
		
		if(tool) {
			useTool(tool, tile);
			setToolCursor();
		}
		else if(tile.obj.type === "laserSender") {
			console.log("rot");
			rotateSender(tile.obj);
			setBuildCursor("rotate", x, y);
		}
	}
	else if(tile.terra === "water") {
		let wood = getItemOf("wood");
		
		if(wood && wood.count >= woodForRaft) {
			buildRaft(x, y);
		}
		
		setToolCursor();
	}
}

function buildRaft(x, y)
{
	console.log("build raft");
	addNewObject("raft", getTile(x, y), true);
	consumeItem("wood", woodForRaft);
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
			console.log(type);
			
			if(type === "redDiamond" || type === "greenDiamond" || type === "blueDiamond") {
				foundDiamond();
			}
		}
		
		removeObjectAt(tile);
	}, 250);
}

function foundDiamond()
{
	diamondsFound ++;
	
	if(diamondsFound === 1) {
		document.body.classList.remove("grayed");
		document.body.classList.add("grayed2");
	}
	else if(diamondsFound === 2) {
		document.body.classList.remove("grayed2");
		document.body.classList.add("grayed3");
	}
	else if(diamondsFound === 3) {
		document.body.classList.remove("grayed3");
	}
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
	else if(
		tool.type === "pickaxe" && (tile.obj.type === "rock" || tile.obj.type === "mossRock")
	) {
		pickRock(tile);
	}
	else if(tool.type === "pickaxe" && tile.obj.type === "sandStone") {
		pickSandStone(tile);
	}
	
	if(rel <= 0) {
		tool.remove();
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
	
	if(onraft) {
		setToolCursor();
		
		if(tile.terra === "water") {
			setChar(x, y);
		}
		else if(walkable(tile)) {
			stepOffRaft(x, y, char.x, char.y);
		}
	}
	else {
		if(!walkable(tile)) {
			if(toolCursor.type) {
				clickAdj(x, y);
			}
			else if(onraft === false && tile.obj && tile.obj.type === "raft") {
				console.log("there is a raft");
				stepOnRaft(x, y);
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
	}
	
	moveLock = true;
	setTimeout(() => moveLock = false, 125);//125);
}

function stepOnRaft(x, y)
{
	onraft = true;
	let tile = getTile(x, y);
	removeObjectAt(tile);
	setChar(x, y);
	char.classList.add("onraft");
}

function stepOffRaft(x, y, oldx, oldy)
{
	onraft = false;
	let tile = getTile(x, y);
	addNewObject("raft", getTile(oldx, oldy), true);
	setChar(x, y);
	char.classList.remove("onraft");
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







