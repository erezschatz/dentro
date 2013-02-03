//Based on code from
//http://www.coderholic.com/recursively-drawing-trees-with-javascript-and-canvas/
//license unknown

var degrees = 30;

function draw(ctx, childData) {
    var branches = childData.length;

    for (var i = 0; i < branches; i++) {
	ctx.save();
	// Work out the total number of degrees between all of the
        // branches at this depth and rotate left half that amount,
        // so that we don't just grow to the right
	var degreesBetween = (branches - 1) * degrees;
	ctx.rotate(-degreesBetween / 2 * (Math.PI / 180));

	// Go from a thick 'branch' to thin 'leaves'
	ctx.lineWidth = 10 - branches;
	// Go from brown to green
	ctx.strokeStyle = 'rgb(' + (125 - branches * 25) + ', 80, 25)';

	// Draw our line
	ctx.beginPath();
	ctx.lineTo(0, 0);
	ctx.lineTo(0, -100);
	ctx.stroke();

	// Translate, scale, and then call ourselves recursively
	ctx.translate(0, -96);
	ctx.scale(0.75, 0.75);
        for (var b = 0; b < childData.length; b++) {
            draw(ctx, childData[b].childs);
        }
	ctx.restore();
	ctx.rotate(degrees * (Math.PI / 180));
    }
}
