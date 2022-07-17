export default class Text {
  show(p5, text, x, y, w, h, align = "center") {
    p5.push();

    if (align === "left") p5.textAlign(p5.LEFT);
    else if (align === "right") p5.textAlign(p5.RIGHT);

    p5.textFont("Courier New");
    p5.textStyle(p5.BOLD);
    p5.textSize(32);
    p5.noStroke();
    p5.fill(0);

    p5.text(text, x, y, w, h);

    p5.pop();
  }
}
