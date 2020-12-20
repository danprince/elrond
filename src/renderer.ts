import { Font } from "./font";
import uiSpriteAtlas from "./assets/ui.atlas";
import uiSpriteSrc from "./assets/ui.png";

let uiSprites = new Image();
uiSprites.src = uiSpriteSrc;

export class Renderer {
  width: number;
  height: number;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  font: Font;

  constructor({ font }: { font: Font }) {
    this.font = font;
    this.canvas = document.createElement("canvas");
    this.canvas.style.imageRendering = "pixelated";
    this.ctx = this.canvas.getContext("2d");
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.imageSmoothingEnabled = false;
  }

  clear(color?: string) {
    if (color) {
      this.ctx.save();
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  drawImage(
    image: HTMLImageElement | HTMLCanvasElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    flipX = false,
    flipY = false
  ) {
    // TODO: flipX, flipY
    this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  drawText(
    text: string,
    x: number,
    y: number,
    color: string,
    backgroundColor?: string,
  ) {
    this.ctx.save();

    // TODO: Tint the font image

    let sw = this.font.metrics.charWidth;
    let sh = this.font.metrics.charHeight;

    for (let i = 0; i < text.length; i++) {
      let index = this.font.getGlyphIndex(text[i]);
      let col = index % this.font.charsPerRow;
      let row = Math.floor(index / this.font.charsPerRow);
      let sx = col * sw;
      let sy = row * sh;
      let dx = x + (i * sw);
      let dy = y;
      let dw = sw;
      let dh = sh;

      if (backgroundColor) {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(dx, dy, dw, dh);
      }

      let image = this.tint(this.font.image, color);

      this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    this.ctx.restore();
  }

  drawUISprite(name: string, x: number, y: number, color?: string) {
    if (uiSpriteAtlas[name] == null) {
      throw new Error(`Missing sprite: ${name}`)
    }

    let sprite = uiSpriteAtlas[name];
    let { x: sx, y: sy, w: sw, h: sh } = sprite.bounds;
    let dx = x;
    let dy = y;
    let dw = sw;
    let dh = sh;

    if (sprite.pivot) {
      dx -= sprite.pivot.x;
      dy -= sprite.pivot.y;
    }

    let image: HTMLImageElement | HTMLCanvasElement = uiSprites;

    if (color) {
      image = this.tint(uiSprites, color);
    }

    this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  strokeRect(x0: number, y0: number, x1: number, y1: number, color: string) {
    this.ctx.save();
    // Prevents antialiasing
    this.ctx.translate(0.5, 0.5);
    this.ctx.strokeStyle = color;
    this.ctx.strokeRect(x0, y0, x1 - 1, y1 - 1);
    this.ctx.restore();
  }

  fillRect(x0: number, y0: number, x1: number, y1: number, color: string) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x0, y0, x1, y1);
    this.ctx.restore();
  }

  drawLine(x0: number, y0: number, x1: number, y1: number, color: string) {
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.translate(0.5, 0.5);
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private _tintCache = new Map<string, HTMLCanvasElement>();

  private tint(image: HTMLImageElement, color: string) {
    let key = `${image.src}-${color}`;

    if (!this._tintCache.has(key)) {
      this._tintCache.set(key, this._tint(image, color))
    }

    return this._tintCache.get(key);
  }

  private _tint(image: HTMLImageElement, color: string) {
    let canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }
}
