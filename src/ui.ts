import type { Display } from "./display";

interface BoundingBox {
  x: number,
  y: number,
  w: number,
  h: number,
}

export class UI {
  static current: UI = null;

  display: Display;
  box: BoundingBox = { x: 0, y: 0, w: 0, h: 0 };
  boundingBoxes: BoundingBox[] = [{ x: 0, y: 0, w: Infinity, h: Infinity }];
  nodeIds: string[] = [];
  currentId: string | null = null;
  focusId: string | null = null;
  hoverId: string | null = null;
  focusableIds: string[];
  focusIndex = 0;
  valid = false;

  begin() {
    UI.current = this;
    this.focusableIds = [];
  }

  end() {
    UI.current = null;

    if (this.display.wasButtonPressed("Tab")) {

      if (this.display.isButtonDown("Shift")) {
        this.focusIndex -= 1;
      } else {
        this.focusIndex += 1;
      }

      this.focusId = this.focusableIds[this.focusId];
    }
  }

  hasFocus() {
    return this.currentId === this.focusId;
  }

  hasHover() {
    return this.isMouseOver();
  }

  isMouseOver(x = this.box.x, y = this.box.y, w = this.box.w, h = this.box.h) {
    let mouse = this.display.mouse;

    return (
      mouse.x >= x &&
      mouse.y >= y &&
      mouse.x < (x + w) &&
      mouse.y < (y + w)
    );
  }

  pushId(id: string) {
    this.nodeIds.push(id);
    this.currentId = this.nodeIds.join("/");

    return {
      focus: this.focusId === this.currentId,
      hover: this.hasHover(),
    };
  }

  popId() {
    this.nodeIds.pop();
    this.currentId = this.nodeIds.join("/");
  }

  pushBoundingBox(x: number, y: number, w: number, h: number) {
    let box = {
      x: this.box.x + x,
      y: this.box.y + y,
      w: w,
      h: h,
    };

    this.boundingBoxes.push(this.box = box);
  }

  popBoundingBox() {
    this.boundingBoxes.pop();
    let box = this.boundingBoxes[this.boundingBoxes.length - 1];
    this.box = box;
  }

  invalidate() {
    this.valid = false;
  }

  makeFocusable() {
    this.focusableIds.push(this.currentId);
  }
}
