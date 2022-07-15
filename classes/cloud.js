export default class Cloud {
  constructor(p5, cloudNumber, velocity = 1, y = 0, x = 0) {
    this.cloudNumber = cloudNumber;

    this.y = y;
    this.gap = 150;
    this.width = 1001;
    this.height = 151;
    this.velocity = velocity;
    this.cloud = p5.loadImage("/clouds.svg");
    this.x = x
      ? x
      : this.cloudNumber * this.width + this.cloudNumber * this.gap;
  }

  update() {
    this.x -= this.velocity;

    if (this.x + this.width + this.gap < 0) {
      this.x = this.width + this.gap;
    }
  }

  draw(p5) {
    p5.image(this.cloud, this.x, this.y);
  }
}
