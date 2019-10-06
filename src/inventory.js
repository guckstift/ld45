let itemTypes = {
	axe: {
		hasDur: true,
		maxDur: 160,
	},
	pickaxe: {
		hasDur: true,
		maxDur: 160,
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

function consumeItem(type, count)
{
	let item = getItemOf(type);
	
	if(item && item.count >= count) {
		item.count -= count;
		item.countElm.textContent = item.count;
		
		if(item.count < 2) {
			item.countElm.style.display = "none";
		}
		
		if(item.count === 0) {
			item.remove();
		}
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
		item.countElm.textContent = item.count;
		
		if(item.count > 1) {
			item.countElm.style.display = "";
		}
	}
	else {
		let item = newElm("inv-item " + type);
		item.type = type;
		item.count = 1;
		item.countElm = newElm("item-count");
		item.append(item.countElm);
		item.countElm.textContent = item.count;
		item.countElm.style.display = "none";
		
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
