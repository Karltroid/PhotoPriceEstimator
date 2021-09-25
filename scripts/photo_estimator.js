window.addEventListener('load', function()
{
	// declare all document element variables
	imageDisplay = document.getElementById('userimage');
	imageCanvas = document.getElementById('userimage-canvas');
	resolutionDisplay = document.getElementById('info-resolution');
	aspectratioDisplay = document.getElementById('info-aspectratio');
	colorratioDisplay = document.getElementById('info-colorratio');
	averagehexvalueDisplay = document.getElementById('info-averagehexvalue');
	ignoredpixelsDisplay = document.getElementById('info-ignoredpixels');
	luminanceDisplay = document.getElementById('info-luminance');
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
				aspectratioDisplay.innerHTML = ("<font color=#823333>Nonstandard Ratio </font>" + (this.width / this.height).toFixed(3));

			// load canvas
			imageCanvas.width = this.width;
			imageCanvas.height = this.height;
			context = imageCanvas.getContext('2d');
			context.drawImage(img, 0, 0);
			var imageData = context.getImageData(0, 0, this.width-1, this.height-1);
			displayImageData(imageData);
		};

		img.onerror = function()
		{
			alert("not a valid file: " + file.type);
		};

		img.src = URL.createObjectURL(file);
		return img;
	}
}

function displayImageData(imageData)
{
	var totalRed = 0, totalGreen = 0, totalBlue = 0, ignoredPixels = 0, luminance;

	for (var i = 0; i < imageData.data.length; i += 4) // looping through each pixel's RGBA values in the data set
	{
		if (imageData.data[i+3] == 0)
		{
			ignoredPixels++;
			continue;
		}
		else if (imageData.data[i] == 255 &&imageData.data[i+1] == 255 && imageData.data[i+2] == 255)
			ignoredPixels++;

		totalRed += imageData.data[i];
		totalGreen += imageData.data[i+1];
		totalBlue += imageData.data[i+2];
	}

	var pixels = imageData.data.length / 4;
	var countedPixels = pixels - ignoredPixels;
	var averageRed = Math.round(totalRed/countedPixels);
	var averageBlue = Math.round(totalBlue/countedPixels);
	var averageGreen = Math.round(totalGreen/countedPixels);

	colorratioDisplay.innerHTML = "<font color=red>" + averageRed +
						"</font> : <font color=green>" + averageBlue +
						"</font> : <font color=blue>" + averageGreen + "</font>";

	averagehexvalueDisplay.innerHTML = rgbToHex(averageRed, averageBlue, averageGreen);

	ignoredpixelsDisplay.innerHTML = (ignoredPixels/pixels * 100).toFixed(2) + "%";

	luminanceDisplay.innerHTML = (((0.2126 * averageRed) + (0.7152 * averageGreen) + (0.0722 * averageBlue)) / 255 * 100).toFixed(2) + "%";
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
