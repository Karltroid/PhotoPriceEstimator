const MEGAPIXEL = 1000000; // 1MP = 1,000,000 pixels

var newPhotoOrder;



function getImage(input)
{
	let file;

	// get file, return if error getting file
	if (!(file = event.target.files[0]))
	{
		alert("Error loading file");
		return;
	}

	// using https://github.com/seikichi/tiff.js to load unsupported tiff files into canvas
	if (file.type == "image/tiff")
	{
		var reader = new FileReader();

		reader.onload = (function (theFile)
		{
			return function (e)
			{
				var buffer = e.target.result;
				var tiff = new Tiff({buffer: buffer});
				if (tiffImage = tiff.toCanvas())
				{
					newPhotoOrder = new PhotoOrder(getPixelData(imageCanvas, tiffImage));
					getPhotoSizes();
					evaluatePixelColors();
					displayImageData(newPhotoOrder);
					newPhotoOrder.ogImageUrl = image.src;
				}
			};
		})(file);

		reader.readAsArrayBuffer(file);
	}

	// for regular/supported images, load normally
	else
	{
		var image = new Image();

		image.onerror = function()
		{
			// alert the user that their image file is not supported
			alert("not a valid file: " + file.type);
			return;
		};

		image.onload = function()
		{
			newPhotoOrder = new PhotoOrder(getPixelData(imageCanvas, image));
			getPhotoSizes();
			evaluatePixelColors();
			displayImageData(newPhotoOrder);
			newPhotoOrder.ogImageUrl = image.src;
		};


		image.src = URL.createObjectURL(file);
	}
}



function getPhotoSizes()
{
	// get image orientation and all print sizes for the image's aspect ratio
	// and display both
	var printSizes = getRecommendedPrintSizes(newPhotoOrder.aspectRatio);


	displayData(printSizeOption, "");
	for (var i = 0; i < PRINTSIZES.length; i++)
	{
		for(var x = 0; x < PRINTSIZES[i].length; x++)
		{
			var croppedResolution = getCroppedResolution(PRINTSIZES[i][x]);

			var ppi = getPixelsPerInch(croppedResolution.x, croppedResolution.y, PRINTSIZES[i][x][0], PRINTSIZES[i][x][1]);

			if (PRINTSIZES[i] == printSizes)
			{
				if (ppi >= 300)
				{
					displayDataAppend(printSizeOption,
						"<button class=\"very-recommended-option\" type=\"button\" onclick=\"setCropBoxSize([" + PRINTSIZES[i][x] + "])\">" + PRINTSIZES[i][x][0] + "\" x " + PRINTSIZES[i][x][1] + "\" (" + ppi + "ppi)</button>"
					);
				}
				else
				{
					displayDataAppend(printSizeOption,
						"<button class=\"recommended-option\" type=\"button\" onclick=\"setCropBoxSize([" + PRINTSIZES[i][x] + "])\">" + PRINTSIZES[i][x][0] + "\" x " + PRINTSIZES[i][x][1] + "\" (" + ppi + "ppi)</button>"
					);
				}
			}
			else {
				displayDataAppend(printSizeOption,
					"<button type=\"button\" onclick=\"setCropBoxSize([" + PRINTSIZES[i][x] + "])\">" + PRINTSIZES[i][x][0] + "\" x " + PRINTSIZES[i][x][1] + "\" (" + ppi + "ppi)</button>"
				);
			}

		}
	}
	displayDataAppend(printSizeOption,
		"<button type=\"button\" onclick=\"setCustomCropBoxSize()\">Custom: \
			<input id=\"custom-height\" type=\"number\" min=\"1\" max=\"1000\" step=\"0.5\"/><font size=4>\"</font> x \
			<input id=\"custom-width\" type=\"number\" min=\"1\" max=\"1000\" step=\"0.5\"/><font size=4>\"</font>\
			<span id=\"custom-ppi\">(? ppi)</span>\
		</button>"
	);
}



function getPixelData(canvas, image)
{
	// prepare canvas for drawing
	imageCanvas.width = image.width;
	imageCanvas.height = image.height;

	// draw image to canvas
	var context = canvas.getContext('2d');
	context.drawImage(image, 0, 0);

	// return the entire canvas pixel data
	var pixelData = context.getImageData(0, 0, image.width, image.height);
	return pixelData;
}



function evaluatePixelColors()
{
	var r = 0, g = 0, b = 0, transparentPixels = 0, whitePixels = 0;
	for (var i = 0; i < newPhotoOrder.pixelData.data.length; i += 4)
	{
		if (newPhotoOrder.pixelData.data[i+3] == 0)
		{
			transparentPixels++;
			continue;
		}
		else if (newPhotoOrder.pixelData.data[i] == 255 && newPhotoOrder.pixelData.data[i+1] == 255 && newPhotoOrder.pixelData.data[i+2] == 255)
			whitePixels++;

		r += newPhotoOrder.pixelData.data[i];
		g += newPhotoOrder.pixelData.data[i+1];
		b += newPhotoOrder.pixelData.data[i+2];
	}

	newPhotoOrder.transparentPixels = transparentPixels;
	newPhotoOrder.whitePixels = whitePixels;

	var countedPixels = newPhotoOrder.totalPixels - transparentPixels;

	newPhotoOrder.rgb = {
		r: Math.round(r / countedPixels),
		g: Math.round(g / countedPixels),
		b: Math.round(b / countedPixels)
	};
}



function displayImageData(photoOrder)
{
	displayData(orientationDisplay, photoOrder.orientation);
	displayData(resolutionDisplay, photoOrder.width + " x " + photoOrder.height + " (" + photoOrder.megaPixels + "MP)");
	displayData(averageRgbDisplay,
		"<font color=red>" + photoOrder.rgb.r + "</font> : \
		<font color=green>" + photoOrder.rgb.g + "</font> : \
		<font color=blue>" + photoOrder.rgb.b + "</font>"
	);
	displayData(averageCmykDisplay,
		"<font color=#0093d3>" + photoOrder.cmyk.c + "%</font>, \
		<font color=#cc006b>" + photoOrder.cmyk.m + "%</font>, \
		<font color=#bab109>" + photoOrder.cmyk.y + "%</font>, " + photoOrder.cmyk.k + "%"
	);
	displayData(averageHexValueDisplay, "#" + photoOrder.hex);
	displayData(luminanceDisplay, photoOrder.luminance);
	displayData(ignoredPixelsDisplay, (photoOrder.printIgnoredPixels / photoOrder.totalPixels * 100).toFixed(2) + "%");
}



// convert an individual component of an rgb value to hex
function colorToHex(c)
{
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
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
	var pixelsHypotenuse = Math.sqrt(Math.pow(imageWidth, 2) + Math.pow(imageHeight, 2));
	var physicalHypotenuse = Math.sqrt(Math.pow(physicalWidth, 2) + Math.pow(physicalHeight, 2));
	var ppi = Math.round(pixelsHypotenuse / physicalHypotenuse);

	return ppi;
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
