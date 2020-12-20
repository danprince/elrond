import { Renderer } from "./renderer";
import { Font } from "./font";
import { Display } from "./display";
import { SpriteEditor} from "./apps/sprite-editor";
import fontSrc from "./assets/font.png";

let font = new Font({
  src: fontSrc,
  metrics: {
    charWidth: 4,
    charHeight: 7,
  }
});

let renderer = new Renderer({ font });

export let display = new Display(renderer);

display.view = SpriteEditor;

font.onReady(() => {
  display.update();
});

renderer.canvas.style.cursor = "none";
document.body.appendChild(renderer.canvas);
document.body.style.backgroundColor = "black";
