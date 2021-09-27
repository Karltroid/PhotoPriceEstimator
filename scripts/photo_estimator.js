const PRINTSIZES =
[
	[[4,4], [8,8]], // 1.00
	[[4,6], [12,18], [24, 36]], // 1.50
	[[5,7]], // 1.40
	[[18,24]], // 1.33
	[[8.5,11]], // 1.29
	[[8,10]] // 1.25
];

const PRINTSIZES_RATIO =
[
	1.00, // 4x4, 8x8
	1.50, // 4x6, 12x18, 24x36
	1.40, // 5x7
	1.33, // 18x24
	1.29, // 8.5x11
	1.25  // 8x10
];



window.addEventListener('load', function()
{
	// declare all document element variables
	imageDisplay = document.getElementById('userimage');
	imageCanvas = document.getElementById('userimage-canvas');
	resolutionDisplay = document.getElementById('info-resolution');
	printSizeDisplay = document.getElementById('info-printsize');
	orientationDisplay = document.getElementById('info-orientation');
	averageRgbDisplay = document.getElementById('info-averagergb');
	averageHexValueDisplay = document.getElementById('info-averagehexvalue');
	averageCmykDisplay = document.getElementById('info-averagecmyk');
	ignoredPixelsDisplay = document.getElementById('info-ignoredpixels');
	luminanceDisplay = document.getElementById('info-luminance');
});



function getImageData()
{
	var file, image;

	if (file = event.target.files[0]) // check if file exists and is fine
	{
		image = new Image();

		image.onerror = function()
		{
			// alert the user that their image file is not supported
			alert("not a valid file: " + file.type);
			return;
		};

		image.onload = function()
		{
			// prepare canvas for drawing
			imageCanvas.width = this.width;
			imageCanvas.height = this.height;

			// draw image to canvas and get color data
			var context = imageCanvas.getContext('2d');
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
	// display image and resolution
	imageDisplay.src = image.src;
	displayData(resolutionDisplay, image.width + " x " + image.height);


	// get image orientation and all print sizes for the image's aspect ratio
	// and display both
	var imageAspectRatio = image.width / image.height, printSizes, orientation;

	if (imageAspectRatio > 1)
	{
		orientation = "Landscape";
		printSizes = getRecommendedPrintSizes(imageAspectRatio);
	}
	else if (imageAspectRatio < 1)
	{
		orientation = "Portrait";
		printSizes = getRecommendedPrintSizes(image.height / image.width);
	}
	else
	{
		orientation = "Square";
		printSizes = getRecommendedPrintSizes(1);
	}

	displayData(orientationDisplay, orientation);

	displayData(printSizeDisplay, "");
	for (var i = 0; i < printSizes.length; i++)
	{
		var ppi = getPixelsPerInch(image.width, image.height, printSizes[i][0], printSizes[i][1]);

		displayDataAppend(printSizeDisplay,
			"<span>" + printSizes[i][0] + "\" x " + printSizes[i][1] + "\" (" + ppi + "ppi)</span>"
		);
	}


	// add up all value
	// count white/transparent pixels that won't be printed
	// get average rgb value (not including transparent pixels)
	var rgb = [0, 0, 0], transparentPixels = 0, whitePixels = 0;

	for (var i = 0; i < colorData.data.length; i += 4)
	{
		if (colorData.data[i+3] == 0)
		{
			transparentPixels++;
			continue;
		}
		else if (colorData.data[i] == 255 && colorData.data[i+1] == 255 && colorData.data[i+2] == 255)
			whitePixels++;

		rgb[0] += colorData.data[i];
		rgb[1] += colorData.data[i+1];
		rgb[2] += colorData.data[i+2];
	}

	var pixelAmount = colorData.data.length / 4;
	var countedPixels = pixelAmount - transparentPixels;

	rgb = [ Math.round(rgb[0] / countedPixels),
					Math.round(rgb[1] / countedPixels),
					Math.round(rgb[2] / countedPixels) ];

	displayData(averageRgbDisplay,
		"<font color=red>" + rgb[0] + "</font> : \
		<font color=green>" + rgb[1] + "</font> : \
		<font color=blue>" + rgb[2] + "</font>"
	);


	// convert rgb to cmyk and display it
	var cmyk = rgbToCmyk(rgb[0], rgb[1], rgb[2]);
	displayData(averageCmykDisplay,
		"<font color=#0093d3>" + cmyk[0] + "</font>, \
		<font color=#cc006b>" + cmyk[1] + "</font>, \
		<font color=#bab109>" + cmyk[2] + "</font>, " + cmyk[3]
	);


	// convert rgb value to hex and display it
	var hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
	displayData(averageHexValueDisplay, hex);


	// calculate and display the % of pixels that will be ignored during printing
	var ignoredPixels = ((whitePixels + transparentPixels) / pixelAmount * 100).toFixed(2) + "%";
	displayData(ignoredPixelsDisplay, ignoredPixels);


	// convert rgb to luminance and display it
	var luminance = (((0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2])) / 255 * 100).toFixed(2) + "%";
	displayData(luminanceDisplay, luminance);
}



// find the closest supported aspect ratio to the image's exact aspect ratio
// return the array of print sizes for that aspect ratio
function getRecommendedPrintSizes(imageDecimalAspect)
{
	var closestAspectIndex = 0, closestAspectDifference = null;

	for (var i = 0; i < PRINTSIZES_RATIO.length; i++)
	{
		var aspectDifference = Math.abs(PRINTSIZES_RATIO[i] - imageDecimalAspect);

		if (closestAspectDifference == null || aspectDifference < closestAspectDifference)
		{
			closestAspectDifference = aspectDifference;
			closestAspectIndex = i;
		}
	}

	return PRINTSIZES[closestAspectIndex];
}



// gets the amount of pixels there are per inch of the given physical print size
function getPixelsPerInch(imageWidth, imageHeight, physicalWidth, physicalHeight)
{
	console.log(imageWidth^2);
	var pixelsHypotenuse = Math.sqrt(Math.pow(imageWidth, 2) + Math.pow(imageHeight, 2));
	var physicalHypotenuse = Math.sqrt(Math.pow(physicalWidth, 2) + Math.pow(physicalHeight, 2));
	var ppi = Math.round(pixelsHypotenuse / physicalHypotenuse);

	console.log(pixelsHypotenuse);
	console.log(physicalHypotenuse);

	return ppi;
}



// recursively find the largest number that divides into the two numbers
function gcd(a, b)
{
	return (b == 0) ? a : gcd(b, a%b);
}



// convert an individual component of an rgb value to hex
function colorToHex(c)
{
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}



// convert r, g, and b into hex and stich them together for the full hex value
function rgbToHex(r, g, b)
{
	return "#<font color=red>" + colorToHex(r) +"</font\
					><font color=green>" + colorToHex(g) + "</font\
					><font color=blue>" + colorToHex(b) + "</font>";
}



// convert the rgb value into cmyk
function rgbToCmyk(r, g, b)
{
	var c, m, y, k;

	if ((r == 0) && (g == 0) && (b == 0))
	{
		// set solid black value directly to avoid dividing by 0
		c = "0%";
		m = "0%";
		y = "0%";
		k = "100%";
	}
	else
	{
		// convert rgb to 0-1 deciamls
		var calcR = 1 - (r / 255),
		calcG = 1 - (g / 255),
		calcB = 1 - (b / 255);

		// formula for turning rgb to cmyk
		k = Math.min(calcR, Math.min(calcG, calcB));
		c = (calcR - k) / (1 - k);
		m = (calcG - k) / (1 - k);
		y = (calcB - k) / (1 - k);

		// convert cmyk to percentage form
		c = Math.round(c * 100) + "%";
		m = Math.round(m * 100) + "%";
		y = Math.round(y * 100) + "%";
		k = Math.round(k * 100) + "%";
	}

	return [c, m, y, k];
}



// display's data into element's inner html
function displayData(element, data)
{
	element.innerHTML = data;
}



// display's data into element's inner html while keeping the previous data
function displayDataAppend(element, data)
{
	element.innerHTML += data;
}
