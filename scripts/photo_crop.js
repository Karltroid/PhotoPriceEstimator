var cropOverlay; // page elements
var isDown = false;
var currentPhotoSize = [6, 4];


window.addEventListener('load', function()
{
  // get needed page elements
  cropOverlay = document.getElementById('crop-selection-overlay');


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


function setCropBoxSize(photosize)
{
  var aspectratio;
  var adjustedWidth, adjustedHeight;

  // display crop selection box
  cropOverlay.style.display = "block";

  aspectratio = photosize[1]/photosize[0];

  // scale to fit width
  adjustedWidth = aspectratio * imageCanvas.offsetHeight;
  adjustedHeight = adjustedWidth / aspectratio;

  // if overflowing, scale to fit height
  if (adjustedWidth > imageCanvas.offsetWidth || adjustedHeight > imageCanvas.offsetHeight)
  {
    adjustedHeight = aspectratio * imageCanvas.offsetWidth;
    adjustedWidth = adjustedHeight / aspectratio;
  }
  else if (adjustedWidth == imageCanvas.offsetWidth && adjustedHeight == imageCanvas.offsetHeight)
  {
    cropOverlay.style.display = "hidden";
  }

  cropOverlay.style.width = adjustedWidth + "px";
  cropOverlay.style.height = adjustedHeight + "px";

  currentPhotoSize = photosize;

  checkCropBoxPosition();
}


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



function setSelectedOption()
{

}
