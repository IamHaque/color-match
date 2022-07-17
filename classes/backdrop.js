export default class Backdrop {
  constructor(
    index,
    velocity = 1,
    y = 0,
    x = 0,
    scale = 1,
    ROCKS_IMAGE,
    CLOUDS_IMAGE
  ) {
    this.ROCKS_IMAGE = ROCKS_IMAGE;
    this.CLOUDS_IMAGE = CLOUDS_IMAGE;

    this.y = y;
    this.scale = scale;
    this.width = 960;
    this.index = index;
    this.height = 540;
    this.velocity = velocity;
    this.x = x ? x : this.index * this.width * this.scale;
  }

  update() {
    this.x -= this.velocity;

    if (this.x + this.width * this.scale < 0) {
      this.x = this.width * this.scale;
    }
  }

  draw(p5) {
    p5.image(
      this.ROCKS_IMAGE,
      this.x,
      this.y,
      this.width * this.scale,
      this.height * this.scale
    );

    p5.image(
      this.CLOUDS_IMAGE,
      this.x,
      this.y,
      this.width * this.scale,
      this.height * this.scale
    );
  }
}
