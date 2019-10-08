function frame()
{
	if(driftingSequence) {
		drift++;
	}
	
	requestAnimationFrame(frame);
	scrollToChar();
}

function setScreenSize(n, cb)
{
	document.body.style.setProperty("--screenSize", n + "px");
	screenSize = n;
	screenW = screenSize;
	screenH = screenSize;
	resizeCanvas();
	cb && cb();
}

function updateViewRange()
{
	for(let dy=-radius; dy<=+radius; dy++) {
		for(let dx=-radius; dx<=+radius; dx++) {
			if(dx * dx + dy * dy <= radius * radius) {
				let tile = getTile(char.x + dx, char.y + dy);
				
				if(tile && tile.opacity === 0) {
					fadeInTile(tile);
				}
				
				tile &&
					tile.obj &&
					tile.obj.classList.remove("nodisplay");
				setTimeout(() => tile &&
					tile.obj &&
					tile.obj.classList.remove("invis"));
				tile &&
					tile.obj &&
					tile.obj.beam &&
					tile.obj.beam.classList.remove("nodisplay");
				setTimeout(() => tile &&
					tile.obj &&
					tile.obj.beam &&
					tile.obj.beam.classList.remove("invis"));
			}
		}
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

function rollToTile(tile)
{
	let startX = world.offsX;
	let startY = world.offsY;
	let endX = tile.x * tileSize - screenW / 2;
	let endY = tile.y * tileSize - screenW / 2;
	
	world.offsX = endX;
	world.offsY = endY;
	world.style.left = -world.offsX + "px";
	world.style.top = -world.offsY + "px";
	
	/*
	animate(
		world,
		{offsX: startX, offsY: startY},
		{offsX: endX, offsY: endY},
		5000, false,
		() => {
			world.style.left = -world.offsX + "px";
			world.style.top = -world.offsY + "px";
		}
	);
	/*
	let charRect = char.getBoundingClientRect();
	world.offsX = char.xpx - screenW / 2;
	world.offsY = char.ypx - screenH / 2;
	world.style.left = -world.offsX + "px";
	world.style.top = -world.offsY + "px";
	updateCullRows();
	*/
}

function scrollToChar()
{
	if(!finalSequence) {
		let charRect = char.getBoundingClientRect();
		let viewRect = viewport.getBoundingClientRect();
		let delta;
		let oldoffsY = world.offsY;
		
		world.offsX = char.xpx - screenW / 2;
		world.offsY = char.ypx - screenH / 2;
		world.style.left = -world.offsX + "px";
		world.style.top = -world.offsY + "px";
		
		if(oldoffsY !== world.offsY) {
			updateCullRows();
		}
	}
}

function updateCullRows()
{
	/* probably useless now
	
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
	*/
}
