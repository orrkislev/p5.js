/**
 * @module Lights, Camera
 * @submodule Material
 * @for p5
 * @requires core
 */

'use strict';

var p5 = require('../core/core');
//require('./p5.Texture');

/**
 * Normal material for geometry
 * @method normalMaterial
 * @return {p5}                the p5 object
 * @example
 * <div>
 * <code>
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 * }
 *
 * function draw(){
 *  background(0);
 *  normalMaterial();
 *  sphere(200);
 * }
 * </code>
 * </div>
 */
p5.prototype.normalMaterial = function(){
  this._renderer._getShader('normalVert', 'normalFrag');
  return this;
};

/**
 * Texture for geometry
 * @method texture
 * @param {p5.Image | p5.MediaElement | p5.Graphics} tex 2-dimensional graphics
 *                    to render as texture
 * @return {p5}                the p5 object
 * @example
 * <div>
 * <code>
 * var img;
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 *   img = loadImage("assets/laDefense.jpg");
 * }
 *
 * function draw(){
 *   background(0);
 *   rotateZ(frameCount * 0.01);
 *   rotateX(frameCount * 0.01);
 *   rotateY(frameCount * 0.01);
 *   //pass image as texture
 *   texture(img);
 *   box(200, 200, 200);
 * }
 * </code>
 * </div>
 */
p5.prototype.texture = function(){
  var args = new Array(arguments.length);
  for (var i = 0; i < args.length; ++i) {
    args[i] = arguments[i];
  }
  var gl = this._renderer.GL;
  var shaderProgram = this._renderer._getShader('lightVert',
    'lightTextureFrag');
  gl.useProgram(shaderProgram);
  //check if image is already used as texture
  if(!args[0].isTexture){
    var textureData;
    if (args[0] instanceof p5.Image) {
      args[0].loadPixels();
      textureData = new Uint8Array(args[0].pixels);
    }
    //if param is a video
    else if (args[0] instanceof p5.MediaElement){
      if(!args[0].loadedmetadata) {return;}
      textureData = args[0].elt;
    }
    else if(args[0] instanceof p5.Graphics){
      //@TODO handle following cases:
      //- textured text fonts
    }
    var tex = gl.createTexture();
    args[0]._setProperty('tex', tex);
    args[0]._setProperty('isTexture', true);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D,
    gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0,
      gl.RGBA, args[0].width, args[0].height,
      0, gl.RGBA, gl.UNSIGNED_BYTE, textureData);
  }

  //this is where we'd activate multi textures
  //eg. gl.activeTexture(gl.TEXTURE0 + (unit || 0));
  //but for now we just have a single texture.
  //@TODO need to extend this functionality
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, args[0].tex);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, 'isTexture'), true);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uSampler'), 0);
  return this;
};

/**
 * Helper functions; Checks whether val is a pot
 * more info on power of 2 here:
 * https://www.opengl.org/wiki/NPOT_Texture
 * @param  {Number}  value
 * @return {Boolean}
 */
// function _isPowerOf2 (value){
//   return (value & (value - 1)) === 0;
// }

/**
 * returns the next highest power of 2 value
 * @param  {Number} value [description]
 * @return {Number}       [description]
 */
// function _nextHighestPOT (value){
//   --value;
//   for (var i = 1; i < 32; i <<= 1) {
//     value = value | value >> i;
//   }
//   return value + 1;

/**
 * Ambient material for geometry with a given color
 * @method  ambientMaterial
 * @param  {Number|Array|String|p5.Color} v1  gray value,
 * red or hue value (depending on the current color mode),
 * or color Array, or CSS color string
 * @param  {Number}            [v2] optional: green or saturation value
 * @param  {Number}            [v3] optional: blue or brightness value
 * @param  {Number}            [a]  optional: opacity
* @return {p5}                 the p5 object
 * @example
 * <div>
 * <code>
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 * }
 * function draw(){
 *  background(0);
 *  ambientLight(100);
 *  pointLight(250, 250, 250, 100, 100, 0);
 *  ambientMaterial(250);
 *  sphere(200);
 * }
 * </code>
 * </div>
 */
p5.prototype.ambientMaterial = function(v1, v2, v3, a) {
  var gl = this._renderer.GL;
  var shaderProgram =
    this._renderer._getShader('lightVert', 'lightTextureFrag');

  gl.useProgram(shaderProgram);
  shaderProgram.uMaterialColor = gl.getUniformLocation(
    shaderProgram, 'uMaterialColor' );
  var colors = this._renderer._applyColorBlend(v1,v2,v3,a);

  gl.uniform4f(shaderProgram.uMaterialColor,
    colors[0], colors[1], colors[2], colors[3]);

  shaderProgram.uSpecular = gl.getUniformLocation(
    shaderProgram, 'uSpecular' );
  gl.uniform1i(shaderProgram.uSpecular, false);

  gl.uniform1i(gl.getUniformLocation(shaderProgram, 'isTexture'), false);

  return this;
};

/**
 * Specular material for geometry with a given color
 * @method specularMaterial
 * @param  {Number|Array|String|p5.Color} v1  gray value,
 * red or hue value (depending on the current color mode),
 * or color Array, or CSS color string
 * @param  {Number}            [v2] optional: green or saturation value
 * @param  {Number}            [v3] optional: blue or brightness value
 * @param  {Number}            [a]  optional: opacity
 * @return {p5}                the p5 object
 * @example
 * <div>
 * <code>
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 * }
 * function draw(){
 *  background(0);
 *  ambientLight(100);
 *  pointLight(250, 250, 250, 100, 100, 0);
 *  specularMaterial(250);
 *  sphere(200);
 * }
 * </code>
 * </div>
 */
p5.prototype.specularMaterial = function(v1, v2, v3, a) {
  var gl = this._renderer.GL;
  var shaderProgram =
    this._renderer._getShader('lightVert', 'lightTextureFrag');
  gl.useProgram(shaderProgram);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, 'isTexture'), false);
  shaderProgram.uMaterialColor = gl.getUniformLocation(
    shaderProgram, 'uMaterialColor' );
  var colors = this._renderer._applyColorBlend(v1,v2,v3,a);
  gl.uniform4f(shaderProgram.uMaterialColor,
    colors[0], colors[1], colors[2], colors[3]);
  shaderProgram.uSpecular = gl.getUniformLocation(
    shaderProgram, 'uSpecular' );
  gl.uniform1i(shaderProgram.uSpecular, true);

  return this;
};

/**
 * @private blends colors according to color components.
 * If alpha value is less than 1, we need to enable blending
 * on our gl context.  Otherwise opaque objects need to a depthMask.
 * @param  {Number} v1 [description]
 * @param  {Number} v2 [description]
 * @param  {Number} v3 [description]
 * @param  {Number} a  [description]
 * @return {[Number]}  Normalized numbers array
 */
p5.RendererGL.prototype._applyColorBlend = function(v1,v2,v3,a){
  var gl = this.GL;
  var color = this._pInst.color.apply(
    this._pInst, arguments);
  var colors = color._array;
  if(colors[colors.length-1] < 1.0){
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendEquation( gl.FUNC_ADD );
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
  } else {
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }
  return colors;
};

module.exports = p5;
