let ctx;

function initGfx()
{
	canvas.width = 512;
	canvas.height = 512;
	ctx = canvas.getContext("2d");
	requestAnimationFrame(render);
}

function render()
{
	requestAnimationFrame(render);
}

function renderTerra()
{
}
