export default class Ball {
  constructor(p5, x, colors, outlineColors) {
    this.frames = 0;
    this.radius = 60;
    this.x = x;

    this.floorYMin = p5.windowHeight / 2 - this.radius * 4;
    this.floorYMax = p5.windowHeight * 0.6 - this.radius / 2 - 3;
    this.y = this.getY(p5);

    this.colors = colors;
    this.selectedColorIndex = 0;
    this.outlineColors = outlineColors;
  }

  isOffscreen() {
    return this.x + this.width < 0;
  }

  changeColor() {
    this.selectedColorIndex = Math.floor(Math.random() * 3);
  }

  getY(p5) {
    const sinVal = Math.abs(Math.sin(this.frames / 30 + 1.5));
    return p5.map(sinVal, 0, 1, this.floorYMax, this.floorYMin);
  }

  update(p5) {
    this.frames++;
    this.y = this.getY(p5);

    return this.y + 6 >= this.floorYMax;
  }

  draw(p5) {
    if (this.selectedColorIndex >= 0) {
      this.color = this.colors[this.selectedColorIndex];
      this.outlineColor = this.outlineColors[this.selectedColorIndex];
    }

    p5.strokeWeight(3);
    p5.fill(this.color);
    p5.stroke(this.outlineColor);
    p5.ellipse(this.x, this.y, this.radius);
  }
}
