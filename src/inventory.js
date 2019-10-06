let itemTypes = {
	axe: {
		hasDur: true,
		maxDur: 16,
	},
	pickaxe: {
		hasDur: true,
		maxDur: 16,
	},
	wood: {
		hasDur: false,
	},
	brick: {
		hasDur: false,
	},
	sandBrick: {
		hasDur: false,
	},
	redDiamond: {
		hasDur: false,
	},
	blueDiamond: {
		hasDur: false,
	},
	greenDiamond: {
		hasDur: false,
	},
};

function getToolFor(objType)
{
	if(objType === "tree") {
		console.log("return axe");
		return getItemOf("axe");
	}
	if(objType === "rock" || objType === "mossRock") {
		console.log("return pickaxe");
		return getItemOf("pickaxe");
	}
	if(objType === "sandStone") {
		console.log("return pickaxe");
		return getItemOf("pickaxe");
	}
}

function getItemOf(type)
{
	for(let i=0; i<sidebar.children.length; i++) {
		let item = sidebar.children[i];
		
		if(item.type === type) {
			return item;
		}
	}
}

function addInventoryItem(type)
{
	let hasDur = itemTypes[type].hasDur;
	let durMaxVal = itemTypes[type].maxDur;
	let item = getItemOf(type);
	
	if(item) {
		item.count ++;
		
		if(item.count === 2) {
			item.countElm = newElm("item-count");
			item.append(item.countElm);
		}
		
		item.countElm.textContent = item.count;
	}
	else {
		let item = newElm("inv-item " + type);
		item.type = type;
		item.count = 1;
		
		if(hasDur) {
			item.durability = newElm("durability");
			item.durability.val = durMaxVal;
			item.durability.maxval = durMaxVal;
			item.append(item.durability);
		}
		
		sidebar.append(item);
	}
	
	return item;
}
