var cropOverlay; // page elements
var isDown = false;
var currentPhotoSize = [6, 4];


window.addEventListener('load', function()
{
  // get needed page elements
  cropOverlay = document.getElementById('crop-selection-overlay');
  croppedImageDisplay = document.getElementById('cropped-image');

  // create events
  cropOverlay.addEventListener('pointerdown', function(e)
  {
    cropClick(e);
  }, true);

  document.addEventListener('pointermove', function(event)
  {
    cropMove();
  }, true);

  document.addEventListener('pointerup', function()
  {
    cropUnclick();
  }, true);

  window.addEventListener('resize', function()
  {
    setCropBoxSize(currentPhotoSize);
  }, true);


  // move crop selection box to correct default position
  checkCropBoxPosition();
});



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

  currentPhotoSize = [customHeight, customWidth];
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
  currentPhotoSize = photosize;

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
  var croppedResolution = getCroppedResolution(currentPhotoSize);

  // get the current data of the main image canvas
  // get the image data of the cropped portion of the main image canvas
  var ctx = imageCanvas.getContext('2d');
  var croppedImageData = ctx.getImageData(leftCrop, topCrop, croppedResolution.x, croppedResolution.y);

  // create image url from data amnd display it
  var croppedImage = new Image();
  croppedImage.src = getImageURL(croppedImageData, croppedResolution.x, croppedResolution.y);
  croppedImageDisplay.src = croppedImage.src;
}



function getCroppedResolution(photosize)
{
	// get crop resolution scaled to fit width
  var aspectratio = photosize[1]/photosize[0];
  var croppedWidth = aspectratio * image.height;
  var croppedHeight = croppedWidth / aspectratio;

  // if overflowing, get crop resolution scaled to fit height
  if (croppedWidth > image.width || croppedHeight > image.height)
  {
    var aspectratio = photosize[0]/photosize[1];
    croppedHeight = aspectratio * image.width;
    croppedWidth = croppedHeight / aspectratio;
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