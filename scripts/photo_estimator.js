var imageDisplay, imageCanvas, resolutionDisplay, aspectratioDisplay, colorratioDisplay; // document element variables
var context;

window.addEventListener('load', function()
{
	// declare all document element variables
	imageDisplay = document.getElementById('userimage');
	imageCanvas = document.getElementById('userimage-canvas');
	resolutionDisplay = document.getElementById('info-resolution');
	aspectratioDisplay = document.getElementById('info-aspectratio');
	colorratioDisplay = document.getElementById('info-colorratio');
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
	var totalRed = 0, totalGreen = 0, totalBlue = 0, totalColor;

	for (var i = 0; i < imageData.data.length; i += 4) // looping through each pixel's RGBA values in the data set
	{
		totalRed += imageData.data[i];
		totalGreen += imageData.data[i+1];
		totalBlue += imageData.data[i+2];
		//console.log("R:" + imageData.data[i] + " G:" + imageData.data[i+1] + " B:" + imageData.data[i+2]);
	}

	totalColor = totalRed + totalGreen + totalBlue;

	//console.log("R:" + totalRed + " G:" + totalGreen + " B:" + totalBlue);
	colorratioDisplay.innerHTML = "<font color=red>" + (totalRed/totalColor).toFixed(2) * 100 +
						"</font> : <font color=green>" + (totalGreen/totalColor).toFixed(2) * 100 +
						"</font> : <font color=blue>" + (totalBlue/totalColor).toFixed(2) * 100 + "</font>";
}