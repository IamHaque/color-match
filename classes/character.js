export default class Character {
  constructor(p5, x, jump, fall, idle, dead) {
    this.frames = 0;
    this.radius = 60;
    this.x = x;

    this.floorYMin = p5.windowHeight / 2 - this.radius * 4;
    this.floorYMax = p5.windowHeight * 0.6 - this.radius / 2 - 3;
    this.y = this.getY(p5);

    this.isDead = false;
    this.character = {
      jump,
      fall,
      idle,
      dead,
      w: 170,
      h: 118,
      state: "IDLE",
    };
  }

  isOffscreen() {
    return this.x + this.width < 0;
  }

  changeState(state) {
    if (
      state !== "IDLE" &&
      state !== "DEAD" &&
      state !== "JUMPING" &&
      state !== "FALLING"
    )
      return;

    this.character.state = state;
  }

  changeCharacterColor({ jump, fall, idle, dead }) {
    this.character.jump = jump;
    this.character.fall = fall;
    this.character.idle = idle;
    this.character.dead = dead;
  }

  goingUp(p5) {
    return !(this.getY(p5, this.frames + 5) - this.y >= 0);
  }

  getY(p5, x) {
    const val = x ? x : this.frames;
    const sinVal = Math.abs(Math.sin(val / 30 + 1.5));
    return p5.map(sinVal, 0, 1, this.floorYMax, this.floorYMin);
  }

  update(p5) {
    // let start = p5.millis();

    this.frames++;
    this.y = this.isDead ? this.floorYMax : this.getY(p5);

    if (!this.isDead && this.goingUp(p5)) {
      this.changeState("JUMPING");
    }

    if (!this.isDead && !this.goingUp(p5)) {
      this.changeState("FALLING");
    }

    if (this.isDead) {
      this.changeState("DEAD");
    }

    return this.y + 6 >= this.floorYMax;
  }

  draw(p5) {
    const characterState = this.character.state;
    let characterImage = this.character.idle;
    switch (characterState) {
      case "DEAD":
        characterImage = this.character.dead;
        break;

      case "FALLING":
        characterImage = this.character.fall;
        break;

      case "JUMPING":
        characterImage = this.character.jump;
        break;
    }

    if (!characterImage) return;

    let offset = this.isDead ? 0.5 : 0.3;
    p5.image(
      characterImage,
      this.x - this.character.w * offset,
      this.y - this.character.h * 0.63,
      this.character.w,
      this.character.h
    );
  }
}
