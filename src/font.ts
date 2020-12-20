interface FontMetrics {
  charWidth: number,
  charHeight: number,
}

export class Font {
  image = new Image();

  metrics: {
    charWidth: number,
    charHeight: number,
  };

  private glyphOverrides = new Map<number, number>();

  get charsPerRow() {
    return this.image.width / this.metrics.charWidth;
  }

  constructor({
    src,
    metrics,
    glyphOverrides
  }: {
    src: string,
    metrics: FontMetrics,
    glyphOverrides?: Map<number, number>
  }) {
    this.image.src = src;
    this.metrics = metrics;

    if (glyphOverrides) {
      this.glyphOverrides = glyphOverrides;
    }
  }

  getGlyphIndex(char: string) {
    let code = char.charCodeAt(0);

    if (this.glyphOverrides.has(code)) {
      return this.glyphOverrides.get(code);
    } else {
      return code - 32;
    }
  }

  onReady(callback: () => any) {
    this.image.addEventListener("load", callback);
  }
}
