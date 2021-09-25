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

function getImageData()
{
	var file, image;

	if (file = event.target.files[0]) // check if file exists and is fine
	{
		image = new Image();

		image.onerror = function()
		{
			alert("not a valid file: " + file.type);
			return;
		};

		image.onload = function()
		{
			// load canvas
			imageCanvas.width = this.width;
			imageCanvas.height = this.height;

			// get color data
			context = imageCanvas.getContext('2d');
			context.drawImage(image, 0, 0);
			var colorData = context.getImageData(0, 0, this.width-1, this.height-1);

			// calculate and display image data (resolution, aspectratio, color data, ...)
			displayImageData(image, colorData);
		};

		image.src = URL.createObjectURL(file);
	}
}

function displayImageData(image, colorData)
{
	// display image
	imageDisplay.src = image.src;

	// display resolution
	resolutionDisplay.innerHTML = image.width + " x " + image.height;

	// display aspect ratio
	var aspectDivisor = gcd(image.width, image.height);
	if (aspectDivisor > 1) // display simplified aspect ratio
		aspectratioDisplay.innerHTML = (image.width / aspectDivisor) + ":" + (image.height / aspectDivisor);
	else
		aspectratioDisplay.innerHTML = ("<font color=#823333>Nonstandard Ratio </font>" + (image.width / image.height).toFixed(3));

	// add up all RGB values and count white/transparent pixels that won't be printed
	var totalRed = 0, totalGreen = 0, totalBlue = 0, ignoredPixels = 0;
	for (var i = 0; i < colorData.data.length; i += 4)
	{
		if (colorData.data[i+3] == 0)
		{
			ignoredPixels++;
			continue;
		}
		else if (colorData.data[i] == 255 &&colorData.data[i+1] == 255 && colorData.data[i+2] == 255)
			ignoredPixels++;

		totalRed += colorData.data[i];
		totalGreen += colorData.data[i+1];
		totalBlue += colorData.data[i+2];
	}

	// get average rgb color of the image
	var pixelAmount = colorData.data.length / 4;
	var countedPixels = pixelAmount - ignoredPixels;
	var averageRed = Math.round(totalRed/countedPixels);
	var averageBlue = Math.round(totalBlue/countedPixels);
	var averageGreen = Math.round(totalGreen/countedPixels);

	// display average rgb color of the image
	colorratioDisplay.innerHTML = "<font color=red>" + averageRed +
						"</font> : <font color=green>" + averageBlue +
						"</font> : <font color=blue>" + averageGreen + "</font>";

	// convert rgb value to hex and display it
	averagehexvalueDisplay.innerHTML = rgbToHex(averageRed, averageBlue, averageGreen);

	// calculate and display the % of pixels that will be ignored during printing
	ignoredpixelsDisplay.innerHTML = (ignoredPixels/pixelAmount * 100).toFixed(2) + "%";

	// convert rgb to luminance and display it
	luminanceDisplay.innerHTML = (((0.2126 * averageRed) + (0.7152 * averageGreen) + (0.0722 * averageBlue)) / 255 * 100).toFixed(2) + "%";
}

function gcd(a, b)
{
	return (b == 0) ? a : gcd(b, a%b);
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
