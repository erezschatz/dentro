var ctx = document.getElementById('canvas').getContext('2d');
// Clear the canvas
ctx.clearRect(0, 0, 300, 350);

// Move to the bottom middle of the canvas, which is where we're going to start
ctx.translate(150, 350);
var degrees = 30;

function draw(childData) {
    var branches = childData.length;

    for (var i = 0; i < branches; i++) {
	ctx.save();
	// Work out the total number of degrees between all of the
        // branches at this depth and rotate left half that amount,
        // so that we don't just grow to the right
	var degreesBetween = (branches - 1) * degrees;
	ctx.rotate(-degreesBetween / 2 * (Math.PI / 180));

	// Go from a thick 'branch' to thin 'leaves'
	ctx.lineWidth = maxRecursion - recursion;
	// Go from brown to green
	ctx.strokeStyle = 'rgb(' + (125 - recursion * 25) + ', 80, 25)';

	// Draw our line
	ctx.beginPath();
	ctx.lineTo(0, 0);
	ctx.lineTo(0, -100);
	ctx.stroke();

	// Translate, scale, and then call ourselves recursively
	ctx.translate(0, -96);
	ctx.scale(0.75, 0.75);
	ctx.restore();
	ctx.rotate(degrees * (Math.PI / 180));
    }
}
