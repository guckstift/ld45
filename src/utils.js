function noise1d(x, s)
{
	x *= 15485863; // mult with 1000000. prime
	x *= s || 1;
	x ^= x >> 2;   // xor with r-shift with 1. prime
	x ^= x << 5;   // xor with l-shift with 3. prime
	x ^= x >> 11;  // xor with r-shift with 5. prime
	x ^= x << 17;  // xor with l-shift with 7. prime
	x ^= x >> 23;  // xor with r-shift with 9. prime
	x ^= x << 31;  // xor with l-shift with 11. prime
	
	return (x + 0x80000000) / 0xFFffFFff;
}

function noise2d(x, y, s)
{
	x *= 15485863;  // mult with 1000000. prime
	y *= 285058399; // mult with 15485863. prime
	x += y;
	x *= s || 1;
	x ^= x >> 2;   // xor with r-shift with 1. prime
	x ^= x << 5;   // xor with l-shift with 3. prime
	x ^= x >> 11;  // xor with r-shift with 5. prime
	x ^= x << 17;  // xor with l-shift with 7. prime
	x ^= x >> 23;  // xor with r-shift with 9. prime
	x ^= x << 31;  // xor with l-shift with 11. prime
	
	return (x + 0x80000000) / 0xFFffFFff;
}

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

function realRandInt(n)
{
	return Math.floor(Math.random() * n);
}

function randInt(n)
{
	return Math.floor(noise1d(++rndcnt, rndseed) * n);
}

function randChoice(arr)
{
	return arr[randInt(arr.length)];
}

function pointInRect(x, y, rect)
{
	return x >= rect.left && y >= rect.top && x < rect.right && y < rect.bottom;
}
