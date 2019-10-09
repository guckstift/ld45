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
let imgsGray100 = {};
let imgsGray75 = {};
let imgsGray66 = {};
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
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawMap(ctx);
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
						
						if(driftingSequence) {
							ctx.globalAlpha = Math.max(0, 1 - drift * 0.0025);
						}
						else {
							ctx.globalAlpha = tile.opacity;
						}
						
						let img = imgs[name];
						
						if(diamondsFound === 0) {
							img = imgsGray100[name];
						}
						else if(diamondsFound === 1) {
							if(terra === "water") {
								img = imgsGray75[name];
							}
							else {
								img = imgsGray100[name];
							}
						}
						else if(diamondsFound === 2) {
							img = imgsGray66[name];
						}
						
						ctx.drawImage(
							img,
							x * tileSize - Math.floor(offsX) - 8
								+ (drift ? Math.random() * drift * drift * 0.00125 : 0),
							y * tileSize - Math.floor(offsY) - 8
								+ (drift ? Math.random() * drift * drift * 0.00125 : 0),
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
	
	if(imgsToLoad === 0) {
		createGrayTiles();
	}
}

function createGrayTiles()
{
	srcs.forEach(src => {
		let img = imgs[src];
		let canv100 = imgsGray100[src] = document.createElement("canvas");
		let canv75  = imgsGray75[src]  = document.createElement("canvas");
		let canv66  = imgsGray66[src]  = document.createElement("canvas");
		canv100.width  = canv75.width  = canv66.width  = img.width;
		canv100.height = canv75.height = canv66.height = img.height;
		let ctx100 = canv100.getContext("2d");
		let ctx75 = canv75.getContext("2d");
		let ctx66 = canv66.getContext("2d");
		ctx100.drawImage(img, 0, 0);
		grayScale(ctx100, 1, true);
		ctx75.drawImage(img, 0, 0);
		grayScale(ctx75, 0.75, true);
		ctx66.drawImage(img, 0, 0);
		grayScale(ctx66, 0.66, true);
	});
}
