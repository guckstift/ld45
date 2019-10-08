let srcs = [
	"grass", "soil", "stone", "sand", "way", "water1", "water2", "water3", "water4"
];

let terraOrder = [
	"water", "way", "grass", "soil", "stone", "sand"
];

/*
let objs = [
	"tree", "rock", "
];
*/

let ctx = null;
let imgsToLoad = 0;
let imgs = {};
let waterPhase = 0;

srcs.forEach(name => imgs[name] = loadImg(`gfx/${name}.png`, imgLoaded));

function initCanvas()
{
	resizeCanvas();
	requestAnimationFrame(render);
}

function resizeCanvas()
{
	canvasBG.width = canvas.width = screenW;
	canvasBG.height = canvas.height = screenH;
	ctx = canvas.getContext("2d");
	ctxBG = canvasBG.getContext("2d");
}

function render()
{
	requestAnimationFrame(render);
	
	if(diamondsFound === 0) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawMap(ctx);
		grayScale(ctx, 1, true);
	}
	else if(diamondsFound === 1) {
		ctxBG.clearRect(0, 0, canvas.width, canvas.height);
		drawMap(ctxBG, ["water"]);
		grayScale(ctxBG, 0.75, true);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawMap(ctx, null, ["water"]);
		grayScale(ctx, 1, true);
	}
	else if(diamondsFound === 2) {
		ctxBG.clearRect(0, 0, canvas.width, canvas.height);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawMap(ctx);
		grayScale(ctx, 0.66, true);
	}
	else if(diamondsFound >= 3) {
		ctxBG.clearRect(0, 0, canvas.width, canvas.height);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawMap(ctx);
	}
	
	waterPhase = (waterPhase + 0.125) % 4;
}

function grayScale(ctx, amp, putback = false)
{
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let pixels = imgData.data;
	
	for(let i = 0; i < pixels.length; i += 4) {
		let value = (pixels[i] + pixels[i + 1] + pixels[i + 2]) * 0.3333333333333333333;
		pixels[i + 0] = linearMix(pixels[i + 0], value, amp);
		pixels[i + 1] = linearMix(pixels[i + 1], value, amp);
		pixels[i + 2] = linearMix(pixels[i + 2], value, amp);
	}
	
	if(putback) {
		ctx.putImageData(imgData, 0, 0);
	}
	
	return imgData;
}

function drawMap(ctx, only, without = [])
{
	let viewRect = viewport.getBoundingClientRect();
	let worldRect = world.getBoundingClientRect();
	let offsX = -worldRect.left + viewRect.left;
	let offsY = -worldRect.top + viewRect.top;
	let firstX = Math.floor(offsX / tileSize);
	let lastX = firstX + Math.ceil(canvas.width / tileSize);
	let firstY = Math.floor(offsY / tileSize);
	let lastY = firstY + Math.ceil(canvas.height / tileSize);
	let terraList = only ? only : terraOrder;
	
	terraList.forEach(terra => {
		if(!without.includes(terra)) {
			for(let y = firstY; y <= lastY; y++) {
				for(let x = firstX; x <= lastX; x++) {
					let tile = getTile(x, y);
					
					if(tile && tile.terra === terra && tile.opacity) {
						let name = terra;
						
						if(terra === "water") {
							name += (Math.floor(waterPhase + x + y) % 4) + 1;
						}
						
						ctx.globalAlpha = tile.opacity;
						
						ctx.drawImage(
							imgs[name],
							x * tileSize - Math.floor(offsX) - 8,
							y * tileSize - Math.floor(offsY) - 8,
						);
						
						ctx.globalAlpha = 1;
					}
				}
			}
		}
	});
}

function loadImg(src, cb)
{
	let img = document.createElement("img");
	img.src = src;
	img.onload = cb;
	imgsToLoad++;
	return img;
}

function imgLoaded()
{
	imgsToLoad--;
}
