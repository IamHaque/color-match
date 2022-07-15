export default class Floor {
  constructor(p5, floorNumber) {
    this.floorNumber = floorNumber;

    this.speed = 1.5;
    this.width = p5.windowWidth;
    this.y = p5.windowHeight * 0.6;
    this.x = this.floorNumber * this.width;
    this.height = p5.windowHeight * 0.4 + 10;

    this.color = p5.color(76, 70, 96);
    this.outlineColor = p5.color(54, 49, 68);

    this.floor = p5.loadImage("/floor.png");
  }

  glow(p5) {
    this.color = p5.color(255, 209, 69);
  }

  fade(p5) {
    this.color = p5.color(76, 70, 96);
  }

  update() {
    this.x -= this.speed;

    if (this.x + this.width < 0) {
      this.x = this.width;
    }
  }

  draw(p5) {
    p5.noStroke();

    p5.fill(this.color);
    p5.rect(this.x, this.y, this.width, this.height);

    p5.fill(this.outlineColor);
    p5.rect(this.x, this.y, this.width, 5);
  }
}
