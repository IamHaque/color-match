export default class Bar {
  constructor(p5, colors, outlineColors) {
    this.speed = 3;
    this.width = 90;
    this.y = p5.windowHeight * 0.6;
    this.height = p5.windowHeight * 0.4 + 10;
    this.x =
      p5.windowWidth * 0.5 + Math.floor((p5.windowWidth * 0.5) / 94) * 94;

    this.selectedColorIndex = -1;
    this.color = p5.color(76, 70, 96);
    this.outlineColor = p5.color(54, 49, 68);

    this.colors = colors;
    this.outlineColors = outlineColors;
  }

  cycleColor() {
    this.selectedColorIndex += 1;

    if (this.selectedColorIndex >= this.colors.length) {
      this.selectedColorIndex = 0;
    }
  }

  glow(p5) {
    this.color = p5.color(255, 209, 69);
  }

  fade(p5) {
    this.color = p5.color(76, 70, 96);
  }

  isOffscreen() {
    return this.x + this.width < 0;
  }

  update() {
    this.x -= this.speed;
  }

  draw(p5) {
    if (this.selectedColorIndex >= 0) {
      this.color = this.colors[this.selectedColorIndex];
      this.outlineColor = this.outlineColors[this.selectedColorIndex];
    }

    p5.strokeWeight(5);
    p5.fill(this.color);
    p5.stroke(this.outlineColor);
    p5.rect(this.x, this.y, this.width, this.height);
  }
}
