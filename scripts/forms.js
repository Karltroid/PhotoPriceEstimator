var formAddPrintBtns, formContainer, formHome, imageCanvas, resolutionDisplay, printSizeDisplay, orientationDisplay, averageRgbDisplay, averageHexValueDisplay, averageCmykDisplay, ignoredPixelsDisplay, luminanceDisplay, printSizeOption, quantityOption, cropOverlay, croppedImageDisplay;



window.addEventListener('load', function()
{
	formContainer = document.getElementById('form-container');
  formHome = document.getElementById('form-home');
});



function readyNewForm()
{
	// declare all document element variables
	imageCanvas = document.getElementById('userimage');
	resolutionDisplay = document.getElementById('info-resolution');
	printSizeDisplay = document.getElementById('info-printsize');
	orientationDisplay = document.getElementById('info-orientation');
	averageRgbDisplay = document.getElementById('info-averagergb');
	averageHexValueDisplay = document.getElementById('info-averagehexvalue');
	averageCmykDisplay = document.getElementById('info-averagecmyk');
	ignoredPixelsDisplay = document.getElementById('info-ignoredpixels');
	luminanceDisplay = document.getElementById('info-luminance');

	cropOverlay = document.getElementById('crop-selection-overlay');
  croppedImageDisplay = document.getElementById('cropped-image');

	printSizeOption = document.getElementById('option-printsize');
	quantityOption = document.getElementById('option-quantity');

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
    setCropBoxSize(newPhotoOrder.photoSize);
  }, true);


  // move crop selection box to correct default position
  checkCropBoxPosition();
}


var currentNewPrintButton;


function createNewPrintOrder()
{
  var formAddPrintBtns = document.getElementById('form-addbuttons');
  formHome.style.display = "none";

  formContainer.innerHTML += "\
  <div id=\"new-order\">\
    <h2>Step 1: Select an image</h2>\
    <input id=\"user-input\" type=\"file\" class=\"pushdown\" onchange=\"getImage(this)\" />\
    \
    <div id=\"printsize\" class=\"pushdown\">\
      <h2>Step 2: Choose a photo size</h2>\
      <div id=\"option-printsize\">\
        <font color=gray>Select an image first</font>\
      </div>\
    </div>\
    \
    <h2>Step 3: Adjust crop</h2>\
    <div id=\"image-display-container\">\
      <div id=\"crop-selection-overlay\" class=\"hide\">\
        <button id=\"crop-rotate-button\" type=\"button\" onclick=\"rotateCrop()\"><img src=\"images/rotate.png\" alt=\"Rotate Crop\"/></button>\
      </div>\
      <canvas id=\"userimage\"></canvas>\
    </div>\
    <button type=\"button\" style=\"margin: 12px 8px;\"onclick=\"createCroppedImage()\">Preview Cropped Image</button>\
    <img id=\"cropped-image\" class=\"pushdown\" src=\"\" />\
    \
    <div id=\"quantity\" class=\"pushdown\">\
      <h2>Step 4: Submit Order</h2>\
      <input id=\"option-quantity\" type=\"number\" min=\"1\" step=\"1\" pattern=\"\d+\" value=\"1\" />\
      <button type=\"button\" onclick=\"submit()\">Add to Cart</button>\
    </div>\
    \
    <h2 style=\"text-align: center;\">Original Image information</h2>\
    <table id=\"photo-information\" class=\"pushdown\">\
      <tr>\
        <td>Orientation</td>\
        <td id=\"info-orientation\">...</td>\
      </tr>\
      <tr>\
        <td>Resolution</td>\
        <td id=\"info-resolution\">...</td>\
      </tr>\
      <tr>\
        <td>Average RGB Value</td>\
        <td id=\"info-averagergb\">...</td>\
      </tr>\
      <tr>\
        <td>Average CMYK</td>\
        <td id=\"info-averagecmyk\">...</td>\
      </tr>\
      <tr>\
        <td>Average Hex Value</td>\
        <td id=\"info-averagehexvalue\">...</td>\
      </tr>\
      <tr>\
        <td>Average Luminance</td>\
        <td id=\"info-luminance\">...</td>\
      </tr>\
      <tr>\
        <td>White / Transparent</td>\
        <td id=\"info-ignoredpixels\">...</td>\
      </tr>\
    </table>\
  </div>\
  ";

  readyNewForm();
}



function submit()
{
  createCroppedImage();
  newPhotoOrder.quantity = quantityOption.value;
	photoOrders.push(newPhotoOrder);

  var formAddPrintBtns = document.getElementById('form-addbuttons');
  formAddPrintBtns.innerHTML = "<button id=\"print-" + (photoOrders.length - 1) + "\" type=\"button\" onclick=\"\"> <img src=\"" + newPhotoOrder.finalImageUrl + "\" width=100/><br/><span>x" + newPhotoOrder.quantity + "</span></button>"  + formAddPrintBtns.innerHTML;

	formHome = document.getElementById('form-home');
  formHome.style.display = "block";
  document.getElementById('new-order').remove();
	console.log(photoOrders);
}
