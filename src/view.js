function frame()
{
	requestAnimationFrame(frame);
	scrollToChar();
}

function setScreenSize(n, cb)
{
	document.body.style.setProperty("--screenSize", n + "px");
	
	setTimeout(() => {
		screenSize = n;
		screenW = screenSize;
		screenH = screenSize;
		cb && cb();
	}, 1000);
}

function updateViewRange()
{
	for(let dy=-radius; dy<=+radius; dy++) {
		for(let dx=-radius; dx<=+radius; dx++) {
			if(dx * dx + dy * dy <= radius * radius) {
				let tile = getTile(char.x + dx, char.y + dy);
				tile &&
					tile.classList.remove("nodisplay");
				setTimeout(() => tile &&
					tile.classList.remove("invis"));
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
