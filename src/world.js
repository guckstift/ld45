let terras = ["grass", "soil", "stone", "sand", "water"];
let mapSize = 256;
let tileSize = 32;

let map = null;

function initMap()
{
	map = [];
	
	for(let y=0; y<mapSize; y++) {
		let row = [];
		
		for(let x=0; x<mapSize; x++) {
			let terra = randChoice(terras);
			let tile = {terra, x, y};
			row.append(tile);
			
			if(tile.terra === "grass" && randInt(2) === 0) {
				//let tree = newElm("sprite nodisplay invis tree");
				let tree = newElm("sprite tree");
				tile.obj = tree;
				setSpritePos(tree, x, y);
				world.append(tree);
			}
		}
		
		map.append(row);
	}
}
