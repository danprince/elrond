import { Renderer } from "./renderer";
import { UI } from "./ui";

export interface Mouse {
  x: number,
  y: number,
}

export interface Buttons {
  [key: string]: boolean
}

interface Camera {
  x: number,
  y: number,
}

interface Cursor {
  x: number,
  y: number,
}

export class Display {
  scale = 3;
  view: (display: Display) => any;
  ui: UI;
  readonly width = 128;
  readonly height = 128;
  renderer: Renderer;
  mouse: Mouse = { x: -1, y: -1 };
  buttons: Buttons = {};
  private buttonsPrevFrame: Buttons = {};
  color: string = "white";
  camera: Camera = { x: 0, y: 0 };
  printCursor: Cursor = { x: 0, y: 0 };
  cursor = "default";

  palette = [
    "#000000", "#1D2B53", "#7E2553", "#008751", "#AB5236", "#5F574F",
    "#C2C3C7", "#FFF1E8", "#FF004D", "#FFA300", "#FFEC27", "#00E436",
    "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"
  ];

  constructor(renderer: Renderer) {
    this.ui = new UI();
    this.ui.display = this;

    this.renderer = renderer;
    this.renderer.resize(this.width, this.height);

    renderer.canvas.style.transformOrigin = "0 0";
    renderer.canvas.style.transform = `scale(${this.scale}, ${this.scale})`;

    window.addEventListener("mousedown", this._handleMouseEvent);
    window.addEventListener("mouseup", this._handleMouseEvent);
    window.addEventListener("mousemove", this._handleMouseEvent);
    window.addEventListener("keydown", this._handleKeyboardEvent);
    window.addEventListener("keyup", this._handleKeyboardEvent);
  }

  private _handleMouseEvent = (event: MouseEvent) => {
    let rect = this.renderer.canvas.getBoundingClientRect();
    let x = (event.clientX - rect.left) / this.scale;
    let y = (event.clientY - rect.top) / this.scale;
    this.mouse.x = Math.round(x);
    this.mouse.y = Math.round(y);

    switch (event.type) {
      case "mousedown":
        this.buttons[`mouse-${event.button}`] = true;
        break;
      case "mouseup":
        this.buttons[`mouse-${event.button}`] = false;
        break;
    }

    this.update();
  }

  private _handleKeyboardEvent = (event: KeyboardEvent) => {
    switch (event.type) {
      case "keydown":
        this.buttons[event.key] = true;
        break;
      case "keyup":
        this.buttons[event.key] = false;
        break;
    }

    this.update();
  }

  clear() {
    this.renderer.clear();
  }

  fillRect(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color = this.color,
  ) {
    this.renderer.fillRect(x0, y0, x1, y1, color);
  }

  strokeRect(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color = this.color,
  ) {
    this.renderer.strokeRect(x0, y0, x1, y1, color);
  }

  update() {
    let rerenders = 0;
    this.cursor = "default";

    while (rerenders < 5) {
      this.ui.valid = true;
      this.ui.begin();
      this.ui.pushBoundingBox(0, 0, this.width, this.height);

      if (this.view) {
        this.view(this);
      }

      this.ui.popBoundingBox();
      this.ui.end();
      if (this.ui.valid) break;
      rerenders++;
    }

    if (rerenders >= 5) {
      console.warn(`max ui invalidations`);
    }

    this.renderer.drawUISprite(
      `cursor_${this.cursor}`,
      this.mouse.x,
      this.mouse.y
    );

    this.buttonsPrevFrame = { ...this.buttons };
  }

  isButtonDown(button: string) {
    return this.buttons[button];
  }

  wasButtonPressed(button: string) {
    return this.buttons[button] && !this.buttonsPrevFrame[button];
  }

  wasButtonReleased(button: string) {
    return !this.buttons[button] && this.buttonsPrevFrame[button];
  }

  setPrintCursor(x: number, y: number) {
    this.printCursor.x = x;
    this.printCursor.y = y;
  }

  setCamera(x: number, y: number) {
    this.camera.x = x;
    this.camera.y = y;
  }

  setColor(color: string) {
    this.color = color;
  }

  setCursor(cursor: string) {
    this.cursor = cursor;
  }
}

export const Buttons = {
  MouseLeft: "mouse-0",
  MouseMiddle: "mouse-1",
  MouseRight: "mouse-2",
}
