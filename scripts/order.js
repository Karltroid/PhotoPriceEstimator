var photoOrders = [];

class PhotoOrder
{
  constructor(pixelData)
  {
    this.pixelData = pixelData;
  }
  rgb;
  transparentPixels;
  whitePixels;

  get width() { return this.pixelData.width; }

  get height() { return this.pixelData.height; }

  get totalPixels() { return this.width * this.height; }

  get megaPixels() { return (this.totalPixels / MEGAPIXEL).toFixed(2); }

  get aspectRatio() { return Math.max(this.width, this.height) / Math.min(this.width, this.height); }

  get orientation()
  {
    if (this.width > this.height)
      return "Landscape";
    else if (this.width < this.height)
      return "Portrait";
    else
      return "Square";
  }

  get transparentPixels() { return this.transparentPixels; }

  get whitePixels() { return this.whitePixels; }

  get printIgnoredPixels() { return this.transparentPixels + this.whitePixels; }

  get rgb() { return this.rgb; }

  get hex()
  {
    return colorToHex(this.rgb.r)+colorToHex(this.rgb.g)+colorToHex(this.rgb.b);
  }

  get cmyk()
  {
    var c, m, y, k;

  	if ((this.rgb.r == 0) && (this.rgb.g == 0) && (this.rgb.b == 0))
  	{
  		// set solid black value directly to avoid dividing by 0
  		c = 0;
  		m = 0;
  		y = 0;
  		k = 100;
  	}
  	else
  	{
  		// convert rgb to 0-1 deciamls
  		var calcR = 1 - (this.rgb.r / 255),
  		calcG = 1 - (this.rgb.g / 255),
  		calcB = 1 - (this.rgb.b / 255);

  		// formula for turning rgb to cmyk
  		k = Math.min(calcR, Math.min(calcG, calcB));
  		c = (calcR - k) / (1 - k);
  		m = (calcG - k) / (1 - k);
  		y = (calcB - k) / (1 - k);

  		// convert cmyk to percentage form
  		c = Math.round(c * 100);
  		m = Math.round(m * 100);
  		y = Math.round(y * 100);
  		k = Math.round(k * 100);
  	}

  	return {
      c: c,
      m: m,
      y: y,
      k: k
    };
  }

  get luminance()
  {
    return (((0.2126 * this.rgb.r) + (0.7152 * this.rgb.g) + (0.0722 * this.rgb.b)) / 255 * 100).toFixed(2) + "%";
  }
}
