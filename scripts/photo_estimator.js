var imageDisplay, imageCanvas, resolutionDisplay, aspectratioDisplay, colorratioDisplay, averagehexvalueDisplay; // document element variables
var context;

window.addEventListener('load', function()
{
	// declare all document element variables
	imageDisplay = document.getElementById('userimage');
	imageCanvas = document.getElementById('userimage-canvas');
	resolutionDisplay = document.getElementById('info-resolution');
	aspectratioDisplay = document.getElementById('info-aspectratio');
	colorratioDisplay = document.getElementById('info-colorratio');
	averagehexvalueDisplay = document.getElementById('info-averagehexvalue');
	context = imageCanvas.getContext('2d');
});

function gcd(a, b) // recursive greatest common divisor
{
	return (b == 0) ? a : gcd(b, a%b);
}

function processimage()
{
	img = loadimage();

	imageDisplay.src = img.src; // display the user's image loadimage().src
}

function loadimage()
{
	var file, img;

	if (file = event.target.files[0]) // check if file exists and is fine
	{
		img = new Image();
		
		img.onload = function()
		{
			resolutionDisplay.innerHTML = this.width + " x " + this.height;

			var r = gcd (this.width, this.height); // get highest divisible number of width and height

			if (r > 1) // display simplified aspect ratio
				aspectratioDisplay.innerHTML = (this.width / r) + ":" + (this.height / r);
			else  // display exact decimal aspect ratio if no simplification can be done
				aspectratioDisplay.innerHTML = this.width / this.height;

			// load canvas
			imageCanvas.width = this.width;
			imageCanvas.height = this.height;
			context = imageCanvas.getContext('2d');
			context.drawImage(img, 0, 0);
			var imageData = context.getImageData(0, 0, this.width-1, this.height-1);
			getColorData(imageData);
		};

		img.onerror = function()
		{
			alert("not a valid file: " + file.type);
		};

		img.src = URL.createObjectURL(file);
		return img;		
	}
}

function getColorData(imageData)
{
	var totalRed = 0, totalGreen = 0, totalBlue = 0;

	for (var i = 0; i < imageData.data.length; i += 4) // looping through each pixel's RGBA values in the data set
	{
		totalRed += imageData.data[i];
		totalGreen += imageData.data[i+1];
		totalBlue += imageData.data[i+2];
	}

	var pixels = imageData.data.length / 4;
	var averageRed = Math.round(totalRed/pixels);
	var averageBlue = Math.round(totalBlue/pixels);
	var averageGreen = Math.round(totalGreen/pixels);

	colorratioDisplay.innerHTML = "<font color=red>" + averageRed +
						"</font> : <font color=green>" + averageBlue +
						"</font> : <font color=blue>" + averageGreen + "</font>";

	averagehexvalueDisplay.innerHTML = rgbToHex(averageRed, averageBlue, averageGreen);
}

function componentToHex(c)
{
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b)
{
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}