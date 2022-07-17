export default class Tree {
  constructor(p5, image, windowWidth) {
    this.speed = 3;
    this.width = 90;
    this.y = p5.windowHeight * 0.6;
    this.height = p5.windowHeight * 0.4 + 10;
    this.x = windowWidth * 0.5 + Math.floor((windowWidth * 0.5) / 94) * 94 * 2;

    this.image = image;
    this.colorIndex = -1;
    this.fillColor = p5.color(76, 70, 96);
    this.outlineColor = p5.color(54, 49, 68);
  }

  changeTreeColor(newImage) {
    this.image = newImage;
  }

  isOffscreen() {
    return this.x + this.width < 0;
  }

  update() {
    this.x -= this.speed;
  }

  draw(p5) {
    p5.image(
      this.image,
      this.x - this.width / 2,
      this.y - 8,
      this.width * 2,
      this.height + 15
    );
  }
}
