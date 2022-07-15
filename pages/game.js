import dynamic from "next/dynamic";

import { useEffect } from "react";

import Bar from "../classes/bar";
import Ball from "../classes/ball";
import Cloud from "../classes/cloud";

import styles from "../styles/game.module.scss";

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});

export default function Game() {
  let CANVAS_WIDTH = 100;
  let CANVAS_HEIGHT = 100;

  useEffect(() => {
    CANVAS_WIDTH = window.innerWidth;
    CANVAS_HEIGHT = window.innerHeight;
  }, []);

  const COLORS = [];
  const OUTLINE_COLORS = [];

  let BALL;
  let GHOST_BALL;
  const BARS = [];
  const CLOUDS = [];
  const TOTAL_CLOUDS = 2;
  let isGameStarted = false;
  let lastGhostBarAddedAtFrame;
  let lastBarAddedAtFrame;
  let nextBarIndex;
  let nextBarCenter;

  let SCORE = 0;
  let isGameOver = false;

  const preload = (p5) => {
    for (let cloudNumber = 0; cloudNumber <= TOTAL_CLOUDS; cloudNumber++) {
      // new Cloud(p5, cloudNumber, Speed, Y position)
      const CLOUD = new Cloud(p5, cloudNumber, 0.8, CANVAS_HEIGHT * 0.05);
      CLOUDS.push(CLOUD);
    }
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).parent(canvasParentRef);

    COLORS.push(p5.color(255, 20, 75));
    COLORS.push(p5.color(255, 209, 69));
    COLORS.push(p5.color(130, 96, 246));

    OUTLINE_COLORS.push(p5.color(224, 0, 52));
    OUTLINE_COLORS.push(p5.color(255, 196, 20));
    OUTLINE_COLORS.push(p5.color(93, 48, 243));

    BALL = new Ball(p5, p5.windowWidth / 2, COLORS, OUTLINE_COLORS);
    GHOST_BALL = new Ball(p5, p5.windowWidth + 100);
  };

  const draw = (p5) => {
    p5.background(102, 51, 153);

    // DRAW
    p5.textFont("Courier New");
    p5.textStyle(p5.BOLD);
    p5.textSize(64);
    p5.noStroke();
    p5.fill(0);

    if (isGameOver) {
      p5.textAlign(p5.CENTER);
      p5.text(`Game Over`, 0, p5.windowHeight / 2 - 64, p5.windowWidth, 64);

      p5.textSize(48);
      p5.text(
        `Score: ${SCORE}`,
        0,
        p5.windowHeight / 2 + 48,
        p5.windowWidth,
        48
      );
    }

    if (!isGameOver) {
      p5.textSize(48);
      p5.textAlign(p5.RIGHT);
      p5.text(`Score: ${SCORE}`, 0, 10, p5.windowWidth, 48);

      for (let cloud of CLOUDS) {
        cloud.draw(p5);
      }

      for (let bar of BARS) {
        bar.draw(p5);
      }

      BALL.draw(p5);

      // UPDATE
      for (let cloud of CLOUDS) {
        cloud.update();
      }

      for (let barIndex = BARS.length - 1; barIndex >= 0; barIndex--) {
        BARS[barIndex].update();

        if (BARS[barIndex].isOffscreen()) {
          BARS.splice(barIndex, 1);
          // console.log(BARS);
        }
      }

      // Finding next bar to bounce on
      nextBarIndex = undefined;
      nextBarCenter = undefined;
      for (let barIndex = BARS.length - 1; barIndex >= 0; barIndex--) {
        const ballCenter = BALL.x;
        const barCenter = BARS[barIndex].x + BARS[barIndex].width / 2;

        if (barCenter - ballCenter < 0) {
          BARS[barIndex].fade(p5);
          continue;
        }

        if (!nextBarCenter) {
          nextBarCenter = barCenter;
          nextBarIndex = barIndex;
          continue;
        }

        if (nextBarCenter > barCenter) {
          nextBarCenter = barCenter;
          nextBarIndex = barIndex;
        }
      }

      // nextBarIndex != undefined && BARS.length > 0 && BARS[nextBarIndex].glow(p5);

      if (!isGameStarted && nextBarCenter - BALL.x < 150) {
        isGameStarted = true;
      }

      if (isGameStarted) {
        const isBallAtFloor = BALL.update(p5, nextBarCenter);
        if (isBallAtFloor) {
          if (!lastBarAddedAtFrame) lastBarAddedAtFrame = p5.frameCount;

          if (
            p5.frameCount - lastBarAddedAtFrame <= 0 ||
            p5.frameCount - lastBarAddedAtFrame >= 10
          ) {
            if (
              nextBarIndex != undefined &&
              BARS.length > 0 &&
              BALL.selectedColorIndex !== BARS[nextBarIndex].selectedColorIndex
            ) {
              isGameOver = true;
            } else {
              SCORE += 1;
            }

            BALL.changeColor();
          }

          lastBarAddedAtFrame = p5.frameCount;
        }
      }

      const isGhostBallAtFloor = GHOST_BALL.update(p5, nextBarCenter);
      if (isGhostBallAtFloor) {
        if (!lastGhostBarAddedAtFrame) lastGhostBarAddedAtFrame = p5.frameCount;

        if (
          p5.frameCount - lastGhostBarAddedAtFrame <= 0 ||
          p5.frameCount - lastGhostBarAddedAtFrame >= 10
        ) {
          BARS.push(new Bar(p5, COLORS, OUTLINE_COLORS));
        }

        lastGhostBarAddedAtFrame = p5.frameCount;
      }
    }
  };

  const mouseClicked = (p5) => {
    if (isGameOver) {
      BALL = new Ball(p5, p5.windowWidth / 2, COLORS, OUTLINE_COLORS);
      GHOST_BALL = new Ball(p5, p5.windowWidth + 100);
      lastBarAddedAtFrame = undefined;
      nextBarIndex = undefined;
      nextBarCenter = undefined;
      isGameStarted = false;
      isGameOver = false;
      SCORE = 0;
      BARS = [];
    }

    if (!isGameOver) {
      nextBarIndex != undefined &&
        BARS.length > 0 &&
        BARS[nextBarIndex].cycleColor();
    }
  };

  return (
    <Sketch
      draw={draw}
      setup={setup}
      preload={preload}
      className={styles.canvas}
      mouseClicked={mouseClicked}
    />
  );
}
