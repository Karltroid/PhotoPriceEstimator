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

var cropOverlay; // page elements
var isDown = false;


function cropClick(e)
{
  isDown = true;

  offset =
  {
    x: cropOverlay.offsetLeft - e.clientX,
    y: cropOverlay.offsetTop - e.clientY
  };
}



function cropMove(x = event.clientX, y = event.clientY)
{
  if (!isDown)
    return;

  event.preventDefault();

  cropOverlay.style.left = (x + offset.x) + 'px';
  cropOverlay.style.top  = (y + offset.y) + 'px';
  checkCropBoxPosition();
}



function cropUnclick()
{
  isDown = false;
}



function setCustomCropBoxSize()
{
  var customHeight = document.getElementById("custom-height").value;
  var customWidth = document.getElementById("custom-width").value;

  var croppedResolution = getCroppedResolution([customHeight, customWidth]);
  var ppi = getPixelsPerInch(croppedResolution.x, croppedResolution.y, customHeight, customWidth);

  document.getElementById("custom-ppi").innerHTML = "(" + ppi + "ppi)";

  newPhotoOrder.photoSize = [customHeight, customWidth];
  setCropBoxSize([customHeight, customWidth]);
}



function setCropBoxSize(photosize)
{
  var aspectratio;
  var adjustedWidth, adjustedHeight;

  // display crop selection box
  cropOverlay.style.display = "block";

  // scale to fit width
  aspectratio = photosize[1]/photosize[0];
  adjustedWidth = aspectratio * imageCanvas.offsetHeight;
  adjustedHeight = adjustedWidth / aspectratio;

  // if overflowing, scale to fit height
  if (adjustedWidth > imageCanvas.offsetWidth || adjustedHeight > imageCanvas.offsetHeight)
  {
    aspectratio = photosize[0]/photosize[1];
    adjustedHeight = aspectratio * imageCanvas.offsetWidth;
    adjustedWidth = adjustedHeight / aspectratio;

    // if still overflowing, change canvas size to fit crop selection instead and fill image to newly sized canvas
    if (adjustedWidth > imageCanvas.offsetWidth || adjustedHeight > imageCanvas.offsetHeight)
    {
      console.log("CANT FIT");
    }
  }


  // set crop overlay to the calculated width and height
  cropOverlay.style.width = adjustedWidth + "px";
  cropOverlay.style.height = adjustedHeight + "px";

  // save current photo size for if the page resizes and this function needs to be run again
  newPhotoOrder.photoSize = photosize;

  // move resized crop box if it is now overflowing past the canvas
  checkCropBoxPosition();
}



function checkCropBoxPosition()
{
  // set box to correct x pos if it is past the canvas left/right x pos
  if (cropOverlay.offsetLeft < imageCanvas.offsetLeft)
    cropOverlay.style.left = imageCanvas.offsetLeft;
  else if (cropOverlay.offsetLeft + cropOverlay.offsetWidth > imageCanvas.offsetLeft + imageCanvas.offsetWidth)
    cropOverlay.style.left = imageCanvas.offsetLeft + imageCanvas.offsetWidth - cropOverlay.offsetWidth + "px";

  // set box to correct y pos if it is past the canvas top/bottom y pos
  if (cropOverlay.offsetTop < imageCanvas.offsetTop)
    cropOverlay.style.top = imageCanvas.offsetTop;
  else if (cropOverlay.offsetTop + cropOverlay.offsetHeight > imageCanvas.offsetTop + imageCanvas.offsetHeight)
    cropOverlay.style.top = imageCanvas.offsetTop + imageCanvas.offsetHeight - cropOverlay.offsetHeight + "px";
}



function createCroppedImage()
{
  // get crop image data (left point, top point, resolution)
  var leftCrop = cropOverlay.offsetLeft / imageCanvas.offsetWidth * imageCanvas.width;
  var topCrop = cropOverlay.offsetTop / imageCanvas.offsetHeight * imageCanvas.height;
  var croppedResolution = getCroppedResolution(newPhotoOrder.photoSize);

  // get the current data of the main image canvas
  // get the image data of the cropped portion of the main image canvas
  var ctx = imageCanvas.getContext('2d');
  var croppedImageData = ctx.getImageData(leftCrop, topCrop, croppedResolution.x, croppedResolution.y);

  // create image url from data amnd display it
  var croppedImage = new Image();
  croppedImage.src = getImageURL(croppedImageData, croppedResolution.x, croppedResolution.y);
  croppedImageDisplay.src = croppedImage.src;
	newPhotoOrder.finalImageUrl = croppedImage.src;
}



function rotateCrop()
{
  newPhotoOrder.photoSize = [newPhotoOrder.photoSize[1], newPhotoOrder.photoSize[0]];
  setCropBoxSize(newPhotoOrder.photoSize);
}



function getCroppedResolution(photosize)
{
  var aspectRatio, croppedWidth, croppedHeight;

  if (newPhotoOrder.orientation == "Landscape")
  {
    // get crop resolution scaled to fit width
    aspectRatio = photosize[1] / photosize[0];
    croppedWidth = aspectRatio * newPhotoOrder.height;
    croppedHeight = croppedWidth / aspectRatio;
  }
  else if (newPhotoOrder.orientation == "Portrait")
  {
    // get crop resolution scaled to fit height
    aspectRatio = photosize[0] / photosize[1];
    croppedHeight = aspectRatio * newPhotoOrder.width;
    croppedWidth = croppedHeight / aspectRatio;
  }
  else
  {
    // set crop resolution to the same resolution since no crop is needed
    croppedWidth = newPhotoOrder.width;
    croppedHeight = newPhotoOrder.height;
  }

  // return cropped height and width
  return {
		x: croppedWidth,
		y: croppedHeight
	};
}



function getImageURL(imgData, width, height)
{
   var canvas = document.createElement('canvas');
   var ctx = canvas.getContext('2d');
   canvas.width = width;
   canvas.height = height;
   ctx.putImageData(imgData, 0, 0);
   return canvas.toDataURL(); //image URL
}
