let terras = ["grass", "soil", "stone", "sand", "water"];
let mapSize = 32;

let char = newElm("char");

for(let y=0; y<mapSize; y++) {
	let row = newElm("row");
	
	for(let x=0; x<mapSize; x++) {
		let tile = newElm("tile " + randChoice(terras));
		row.append(tile);
	}
	
	ground.append(row);
}

world.append(char);

function newElm(cls)
{
	let elm = document.createElement("div");
	elm.className = cls;
	return elm;
}

function hexColor(r, g, b)
{
	return (
		"#"
		+ Math.floor(255 * r).toString(16).padStart(2, "0")
		+ Math.floor(255 * g).toString(16).padStart(2, "0")
		+ Math.floor(255 * b).toString(16).padStart(2, "0")
	);
}

function randInt(n)
{
	return Math.floor(Math.random() * n);
}

function randChoice(arr)
{
	return arr[randInt(arr.length)];
}
