import { Display, Buttons } from "../display";
import { UI } from "../ui";

interface SpriteEditor {
  color: number,
  tool: "pen" | "fill" | "eyedropper" | "select",
  selection: Selection,
  width: number,
  height: number,
  data: Uint8Array,
}

interface Selection {
  x: number,
  y: number,
  width: number,
  height: number,
  data: Uint8Array
}

let editor: SpriteEditor = {
  width: 8,
  height: 8,
  data: new Uint8Array(8 * 8),
  color: 0,
  tool: "pen",
  selection: null,
};

function setPixel(x: number, y: number, color: number) {
  let i = x + y * editor.width;
  editor.data[i] = color;
}

function getPixel(x: number, y: number): number {
  let i = x + y * editor.width;
  return editor.data[i];
}

function fill(x: number, y: number, color: number) {
  let existingColor = getPixel(x, y);

  if (color === existingColor) {
    return;
  }

  let stack = [{ x, y }];

  while (stack.length) {
    let point = stack.pop();

    if (getPixel(point.x, point.y) === existingColor) {
      setPixel(point.x, point.y, color);

      for (let i = point.x - 1; i <= point.x + 1; i++) {
        for (let j = point.y - 1; j <= point.y + 1; j++) {
          // Skip the cell we just filled
          if (i === point.x && j === point.y) {
            continue;
          }

          // Skip any cells outside of the editor
          if (i < 0 || j < 0 || i >= editor.width || j >= editor.height) {
            continue;
          }

          // Skip cells outside the current selection
          if (editor.selection && (
            i < editor.selection.x ||
            j < editor.selection.y ||
            i > editor.selection.x + editor.selection.width - 1 ||
            j > editor.selection.y + editor.selection.height - 1
          )) {
            continue;
          }

          if (getPixel(i, j) === existingColor) {
            stack.push({ x: i, y: j });
          }
        }
      }
    }
  }
}

function setColor(color: number) {
  editor.color = color;
}

function setSelection(x: number, y: number, w: number, h: number) {
  let selection: Selection = {
    x,
    y,
    width: w,
    height: h,
    data: new Uint8Array(w * h),
  };

  editor.selection = selection;
}

function editSelection(x: number, y: number) {
  let sx = editor.selection.x;
  let sy = editor.selection.y;
  let x0 = Math.max(Math.min(sx, x), 0);
  let y0 = Math.max(Math.min(sy, y), 0);
  let x1 = Math.min(Math.max(sx, x), editor.width - 1);
  let y1 = Math.min(Math.max(sy, y), editor.height - 1);
  editor.selection.x = x0;
  editor.selection.y = y0;
  editor.selection.width = x1 - x0 + 1;
  editor.selection.height = y1 - y0 + 1;
}

export function SpriteEditor(display: Display) {
  let { renderer } = display;

  if (display.wasButtonPressed("b")) editor.tool = "pen";
  if (display.wasButtonPressed("g")) editor.tool = "fill";
  if (display.wasButtonPressed("i")) editor.tool = "eyedropper";
  if (display.wasButtonPressed("m")) editor.tool = "select";
  if (display.wasButtonPressed("Escape")) editor.selection = null;

  renderer.clear("#0c0c29");

  renderer.fillRect(0, 0, display.width, 9, "#226");
  renderer.drawUISprite("icon_sprite", 2, 2, "red");
  renderer.drawUISprite("icon_code", 10, 2, "white");
  renderer.drawUISprite("icon_note", 17, 2, "white");

  let activeToolColor = "red";
  let toolColor = "white";

  renderer.drawUISprite("icon_pen", 104, 2, editor.tool === "pen" ? activeToolColor : toolColor);
  renderer.drawUISprite("icon_fill", 112, 2, editor.tool === "fill" ? activeToolColor : toolColor);
  renderer.drawUISprite("icon_select", 121, 2, editor.tool === "select" ? activeToolColor : toolColor);

  Palette({ x: 2, y: 11 });
  Canvas({ x: 21, y: 11, w: 64, h: 64 });

  renderer.fillRect(0, display.height - 9, display.width, 9, "#226");
}

function Canvas({
  ui = UI.current,
  id = "canvas",
  x,
  y,
  w,
  h,
}: {
  ui?: UI,
  id?: string,
  x: number,
  y: number,
  w: number,
  h: number,
  onClick?(x: number, y: number): any,
}) {
  let { renderer, palette, mouse } = ui.display;

  // Pixel width/height
  let pw = w / editor.width;
  let ph = h / editor.height;

  // Mouse cursor in pixel coords
  let mouseX = Math.floor((mouse.x - x) / pw);
  let mouseY = Math.floor((mouse.y - y) / ph);

  ui.pushId(id);
  ui.pushBoundingBox(x, y, w, h);

  if (ui.isMouseOver()) {
    switch (editor.tool) {
      case "eyedropper":
        ui.display.setCursor("eyedropper");
        break;

      case "select":
        ui.display.setCursor("select");
        break;

      default:
        ui.display.setCursor("crosshair");
        break;
    }
  }

  let clicking = ui.isMouseOver() && ui.display.wasButtonPressed(Buttons.MouseLeft);
  let mouseDown = ui.isMouseOver() && ui.display.isButtonDown(Buttons.MouseLeft);

  if (editor.tool === "pen") {
    if (mouseDown) {
      setPixel(mouseX, mouseY, editor.color);
    }
  }

  else if (editor.tool === "fill") {
    if (mouseDown) {
      fill(mouseX, mouseY, editor.color);
    }
  }

  else if (editor.tool === "eyedropper") {
    if (mouseDown) {
      let color = getPixel(mouseX, mouseY);
      setColor(color);
    }
  }

  else if (editor.tool === "select") {
    if (clicking) {
      setSelection(mouseX, mouseY, 1, 1);
    } else if (editor.selection && mouseDown) {
      editSelection(mouseX, mouseY);
    }
  }

  // Bottom border
  renderer.strokeRect(x, y, w, h + 1, "black");

  for (let i = 0; i < editor.width; i++) {
    for (let j = 0; j < editor.height; j++) {
      let index = editor.data[i + j * editor.width];
      let color = palette[index];

      renderer.fillRect(
        x + i * pw,
        y + j * ph,
        pw,
        ph,
        color
      );
    }
  }

  let color = palette[editor.color];

  if (
    (editor.tool === "pen" || editor.tool === "fill") &&
    mouseX >= 0 &&
    mouseY >= 0 &&
    mouseX < editor.width &&
    mouseY < editor.height
  ) {
    renderer.fillRect(
      x + mouseX * pw,
      y + mouseY * ph,
      pw,
      ph,
      color
    );
  }

  if (editor.selection) {
    renderer.strokeRect(
      x + editor.selection.x * pw,
      y + editor.selection.y * ph,
      editor.selection.width * pw,
      editor.selection.height * ph,
      "white"
    );
  }

  ui.popBoundingBox();
  ui.popId();
}

function Palette({
  ui = UI.current,
  id = "palette",
  x,
  y,
  colorsPerRow = 2,
  swatchSize = 8,
}) {
  let { palette, renderer } = ui.display;

  let w = colorsPerRow * swatchSize;
  let h = Math.ceil(palette.length / colorsPerRow) * swatchSize;

  ui.pushId(id);
  ui.pushBoundingBox(x, y, w, h);

  renderer.strokeRect(x + 1, y + 1, w, h, "black");

  for (let i = 0; i < palette.length; i++) {
    let x = (i % colorsPerRow) * swatchSize;
    let y = Math.floor(i / colorsPerRow) * swatchSize;

    ui.pushBoundingBox(x, y, swatchSize, swatchSize);
    ui.pushId(i.toString());
    ui.makeFocusable();

    let color = palette[i];
    let hover = ui.isMouseOver();
    let active = editor.color === i;

    if (!active && hover && ui.display.isButtonDown(Buttons.MouseLeft)) {
      editor.color = i;
      ui.invalidate();
    }

    renderer.fillRect(
      ui.box.x,
      ui.box.y,
      swatchSize,
      swatchSize,
      color,
    );

    if (hover) {
      renderer.fillRect(
        ui.box.x,
        ui.box.y,
        swatchSize,
        swatchSize,
        color,
      );
    }

    if (active) {
      renderer.strokeRect(
        ui.box.x,
        ui.box.y,
        swatchSize,
        swatchSize,
        "white",
      );

      renderer.strokeRect(
        ui.box.x + 1,
        ui.box.y + 1,
        swatchSize - 2,
        swatchSize - 2,
        "black",
      );
    }

    ui.popId();
    ui.popBoundingBox();
  }

  ui.popBoundingBox();
  ui.popId();
}

function Button({ ui = UI.current, name, color, x, y }) {
  ui.display.renderer.drawUISprite(name, x, y, color);
}
