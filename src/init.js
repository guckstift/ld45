function init()
{
	sndTheme = document.createElement("audio");
	sndTheme.src = "audio/theme.mp3";
	sndTheme.setAttribute("preload", "auto");
	sndTheme.setAttribute("controls", "none");
	sndTheme.style.display = "none";
	document.body.append(sndTheme);
	
	if(debug) {
		document.body.classList.remove("grayed");
	}
	
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
	
	fillTerraCircle(25, 28, 5, "sand");
	
	drawTerraLine(15, 16, 20, 16, "way");
	
	if(debug) {
		setChar(13, 18);
	}
	else {
		setChar(13, 18);
	}
	
	//setChar(26, 26);
	//setChar(45, 20);
	//setChar(34, 35);
	
	
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
	
	[
		[13, 28],
		[27, 20],
		[21, 28],
		[12, 8],
		[9, 31],
		[35, 16],
		[41, 21],
		[34, 27],
		[45, 24],
	].forEach(([x, y]) => addNewObject("item carrot", getTile(x, y), true));
	
	addNewObject("rock", getTile(6, 14)); // close in blue diamond
	addNewObject("rock", getTile(18, 19));
	addNewObject("rock", getTile(7, 12));
	addNewObject("rock", getTile(8, 18));
	addNewObject("rock", getTile(15, 13));
	addNewObject("mossRock", getTile(13, 22));
	addNewObject("rock", getTile(14, 21));
	addNewObject("sandStone", getTile(14, 5));
	
	addLaserSender("red", getTile(48, 23), 7, true, 3);   // 3 7
	addLaserSender("green", getTile(34, 45), 3, true, 6); // 6 3
	addLaserSender("blue", getTile(25, 28), 0, true, 1);  // 1 0
	
	addLaserSender("green", getTile(40, 31), 2, false, 3); // 3, 2
	addLaserSender("blue", getTile(34, 40), 1, false, 6);  // 6, 1
	addLaserSender("red", getTile(21, 24), 4, false, 1);   // 1, 4
	
	addNewObject("receiver", getTile(34, 37));
	
	/*
	fillContinent(char.x, char.y, 0, () => {
		placeFirstAxe();
	});
	*/
	
	centerToChar();
	requestAnimationFrame(frame);
	
	if(debug) {
		/*
		foundCarrot();
		setTimeout(() => foundCarrot(), 1010);
		setTimeout(() => foundCarrot(), 2020);
		radius = 15;
		*/
		setScreenSize(800);
		radius = 15;
	}
}

function changeTerraAt(x, y, terra)
{
	let tile = getTile(x, y);
	tile.classList.remove(tile.terra);
	tile.terra = terra;
	tile.classList.add(tile.terra);
	
	if(terra === "water" && tile.obj) {
		removeObjectAt(tile);
	}
	else if(terra === "sand" && tile.obj) {
		removeObjectAt(tile);
		addNewObject("sandStone", tile);
	}
}

function fillTerraCircle(x, y, r, terra)
{
	for(let dy=-r; dy<=+r; dy++) {
		for(let dx=-r; dx<=+r; dx++) {
			if(dx * dx + dy * dy <= r * r) {
				changeTerraAt(x + dx, y + dy, terra);
			}
		}
	}
}

function drawTerraLine(sx, sy, ex, ey, terra)
{
	let x = sx;
	let y = sy;
	
	while(x !== ex || y !== ey) {
		changeTerraAt(x, y, terra);
		
		if(ex - x > ey - y) {
			x ++;
		}
		else {
			y ++;
		}
	}
}


