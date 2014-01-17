//Original code by Inigo Quilez 2009 <http://www.iquilezles.org/apps/shadertoy/>

Components.utils.import("resource://brandingwebgl/effect.jsm");

BrandingWebGL = {

	startTime: false,
	mEffect: false,
	mGLContext: false,
	mCanvas: false,
	
	getContents: function(aURL){
	  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
	    .getService(Components.interfaces.nsIIOService);
	  var scriptableStream=Components
	    .classes["@mozilla.org/scriptableinputstream;1"]
	    .getService(Components.interfaces.nsIScriptableInputStream);
	
	  var channel=ioService.newChannel(aURL,null,null);
	  var input=channel.open();
	  scriptableStream.init(input);
	  var str=scriptableStream.read(input.available());
	  scriptableStream.close();
	  input.close();
	  return str;
	},
	
	// Utility function that synchronously reads local resource from the given
	// `uri` and returns content string.
	readURI: function(uri) {
	  let ioservice = Cc['@mozilla.org/network/io-service;1'].
	    getService(Ci.nsIIOService);
	  let channel = ioservice.newChannel(uri, 'UTF-8', null);
	  let stream = channel.open();
	
	  let cstream = Cc['@mozilla.org/intl/converter-input-stream;1'].
	    createInstance(Ci.nsIConverterInputStream);
	  cstream.init(stream, 'UTF-8', 0, 0);
	
	  let str = {};
	  let data = '';
	  let read = 0;
	  do {
	    read = cstream.readString(0xffffffff, str);
	    data += str.value;
	  } while (read != 0);
	
	  cstream.close();
	
	  return data;
	},

	createGLTexture: function(ctx, image, texture)
	{
	    ctx.bindTexture(ctx.TEXTURE_2D, texture);
	    //hack for chrome:// images
		ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		
	    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
	    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
	    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
	    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
	    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
	    ctx.generateMipmap(ctx.TEXTURE_2D)
	    ctx.bindTexture(ctx.TEXTURE_2D, null);
	},
	loadImageTexture: function(gl, url)
	{
	    var texture = gl.createTexture();
	    texture.image = new Image();
	    var oThis = this;
	    texture.image.onload = function() { oThis.createGLTexture(gl, texture.image, texture) }
	    texture.image.src = url;
	    return texture;
	},

	initGL: function(texture, shader, placeholder) {
		try
		{
			this.mCanvas = document.getElementById('glcanvas');
			this.mGLContext = this.mCanvas.getContext("experimental-webgl");
		}
		catch(e) {
			this.mGLContext = false;
		}
		if (this.mGLContext) {
			this.mEffect = new Effect(this, this.mGLContext, this.mCanvas.width, this.mCanvas.height);
			this.mEffect.NewTexture(0,texture);
			var value = this.readURI(shader);
			if (value) {
				this.mEffect.NewShader(value);
				this.startTime = (new Date()).getTime();
				this.renderLoop(this);
			}	
		}
		else {
			var imageObj = new Image();
			var context = this.mCanvas.getContext('2d');
			
			imageObj.onload = function() {
	        	context.drawImage(imageObj, 0, 0);
	      	};
			imageObj.src = placeholder;
		}
	},

	renderLoop: function(oThis)
	{
    var time = (new Date()).getTime();
		var ltime = time - oThis.startTime;
    oThis.mEffect.Paint(ltime/1000.0, 0, 0, 0, 0);
    oThis.mGLContext.flush();
    setTimeout(oThis.renderLoop, 20, oThis );
	}
};