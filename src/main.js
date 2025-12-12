let debug = false;

let sndTheme = null;

let rndseed = 64;
let rndcnt = 0;
let terras = ["grass", "soil", "stone", "sand", "water"];
let mapSize = 64;
let tileSize = 32;
let radius = 1;
let screenSize = 512;
let screenW = screenSize;
let screenH = screenSize;
let woodForRaft = 5;
let diamondsFound = 0;
let correctLasers = 0;

let moveLock = false;
let continentTiles = [];
let tilesToFill = 0;
let continentCnt = 0;
let finalSequence = false;
let driftingSequence = false;
let onraft = false;
let drift = 0;
let sidebar = null;

let map = [];

onload = init;
onkeydown = keyDown;
onmousemove = mouseMove;
onclick = click;

function addNewObject(type, tile, walkable = false)
{
	removeObjectAt(tile);

	let dispCls = "";

	if(!tile.revealed) {
		dispCls = "nodisplay invis ";
	}

	let obj = newElm("sprite " + dispCls + type);
	obj.type = type;
	obj.walkable = walkable;
	tile.obj = obj;
	setSpritePos(obj, tile.x, tile.y);
	world.append(obj);

	return obj;
}

function addLaserSender(color, tile, rot = 0, correct = false, correctRot = 0)
{
	let dispCls = "";

	if(!tile.revealed) {
		dispCls = "nodisplay invis ";
	}

	let sender = addNewObject("laserSender", tile);
	sender.classList.add(color);

	let beam = newElm(
		"sprite " + dispCls + "laserBeam " + color + " rotate" + rot +
		(correct ? " correct" : "")
	);

	sender.beam = beam;
	sender.rot = rot;
	sender.correct = correct;
	sender.correctRot = correctRot;
	setSpritePos(beam, tile.x, tile.y);
	world.append(beam);

	return sender;
}

function rotateSender(sender)
{
	let wasCorrect = sender.rot === sender.correctRot;

	sender.beam.classList.remove("rotate" + sender.rot);
	sender.rot = (sender.rot + 1) % 8;
	sender.beam.classList.add("rotate" + sender.rot);

	if(sender.correct) {
		if(sender.rot === sender.correctRot) {
			correctLasers ++;
		}
		else if(wasCorrect) {
			correctLasers --;
		}
	}
	else {
		if(sender.rot === sender.correctRot) {
			correctLasers --;
		}
		else if(wasCorrect) {
			correctLasers ++;
		}
	}

	if(correctLasers === 3) {
		allLasersCorrect();
	}
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
}

function clientPointToCoord(x, y)
{
	let rect = document.getElementById("viewport").getBoundingClientRect();
	x = Math.floor((x - rect.left + world.offsX) / tileSize);
	y = Math.floor((y - rect.top + world.offsY) / tileSize);
	return [x, y];
}

function click(e)
{
	let [x, y] = clientPointToCoord(e.clientX, e.clientY);
	console.log(x, y);
	//fillContinent(x, y);
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
		let tileX = tile.x * tileSize - world.offsX;
		let tileY = tile.y * tileSize - world.offsY;
		toolCursor.type = tool.type;
		toolCursor.tool = tool;
		toolCursor.classList.add(tool.type);
		toolCursor.style.left = tileX + "px";
		toolCursor.style.top = tileY + "px";
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
		let tileX = tile.x * tileSize - world.offsX;
		let tileY = tile.y * tileSize - world.offsY;
		toolCursor.type = type;
		toolCursor.classList.add(type);
		toolCursor.style.left = tileX + "px";
		toolCursor.style.top = tileY + "px";
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
			setToolCursor();
		}
		else if(tile.obj.type === "laserSender") {
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
	addNewObject("raft", getTile(x, y), true);
	consumeItem("wood", woodForRaft);
}

/*
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
*/

function initChar()
{
	for(let i=0; i<1024; i++) {
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
		return map[y][x];
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
			foundCarrot();
		}
		else {
			addInventoryItem(type);

			if(type === "redDiamond" || type === "greenDiamond" || type === "blueDiamond") {
				foundDiamond();
			}
		}

		removeObjectAt(tile);
	}, 250);
}

function foundCarrot()
{
	if(radius <= 8) {
		setScreenSize(
			screenSize + tileSize,
			() => {
				radius ++;
				updateViewRange();
			},
		);
	}
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
	sndTheme.play();

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
			else if(onraft === false && tile && tile.obj && tile.obj.type === "raft") {
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
	setTimeout(() => moveLock = false, 10);//125);
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

function fadeInTile(tile)
{
	tile.revealed = true;
	animate(tile, {opacity: 0}, {opacity: 1}, 500);
}



function allLasersCorrect()
{
	console.log("YIPPY");

	for(let y=0; y<mapSize; y++) {
		for(let x=0; x<mapSize; x++) {
			let tile = getTile(x, y);

			if(!tile.revealed) {
				fadeInTile(tile);
			}
		}
	}

	finalSequence = true;
	world.classList.add("finale");
	rollToTile(getTile(34, 37));

	setTimeout(() => {
		driftingSequence = true;
		document.body.classList.add("finale");
	}, 4000);

	setTimeout(() => {
		let text = document.createElement("div");
		text.innerText = "The End";
		text.style.position = "absolute";
		text.style.opacity = "0";
		text.style.left = "25%";
		text.style.bottom = "66%";
		text.style.color = "#fff";
		text.style.fontSize = "88px";
		viewport.appendChild(text);
		animate(text.style, {opacity: 0}, {opacity: 1}, 3000, false);
	}, 10000);
	//fillContinent(34, 36, 125)
}
