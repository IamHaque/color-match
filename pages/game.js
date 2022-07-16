import dynamic from "next/dynamic";

import { useEffect } from "react";

import Bar from "../classes/bar";
import Cloud from "../classes/cloud";
import Character from "../classes/character";

import styles from "../styles/game.module.scss";

const Sketch = dynamic(
  () =>
    import("react-p5").then((mod) => {
      return mod.default;
    }),
  {
    ssr: false,
  }
);

export default function Game() {
  let CANVAS_WIDTH = 100;
  let CANVAS_HEIGHT = 100;

  let JUMP_SOUND;
  let DEATH_SOUND;
  let SCORE_INCREASE_SOUND;

  useEffect(() => {
    JUMP_SOUND = new Audio("/land.mp3");
    DEATH_SOUND = new Audio("/death.mp3");
    SCORE_INCREASE_SOUND = new Audio("/score.mp3");

    CANVAS_HEIGHT = window.innerHeight;
    CANVAS_WIDTH = window.innerWidth > 720 ? 720 : window.innerWidth;
  }, []);

  const stopAllSounds = () => {
    JUMP_SOUND.pause();
    DEATH_SOUND.pause();
    SCORE_INCREASE_SOUND.pause();

    JUMP_SOUND.currentTime = 0;
    DEATH_SOUND.currentTime = 0;
    SCORE_INCREASE_SOUND.currentTime = 0;
  };

  const playJumpSound = () => {
    stopAllSounds();
    JUMP_SOUND.play();
  };

  const playDeathSound = () => {
    stopAllSounds();
    DEATH_SOUND.play();
  };

  const playScoreSound = () => {
    stopAllSounds();
    SCORE_INCREASE_SOUND.play();
  };

  let availableColors = ["red", "lime", "blue"];
  let selectedColorIndex = 1;

  const COLORS = [];
  const OUTLINE_COLORS = [];

  let BALL;
  let GHOST_BALL;
  const BARS = [];
  const BACKGROUND = [];
  const TOTAL_BACKGROUNDS = 2;
  let isGameStarted = false;
  let lastGhostBarAddedAtFrame;
  let lastBarAddedAtFrame;
  let nextBarIndex;
  let nextBarCenter;

  let SCORE = 0;
  let updateGame = true;
  let isGameOver = false;

  let TREE_IMAGES = {};
  let CHARACTER_IDLE_IMAGES = {};
  let CHARACTER_DEAD_IMAGES = {};
  let CHARACTER_JUMPING_IMAGES = {};
  let CHARACTER_FALLING_IMAGES = {};

  const SMOKE_IMAGES = [];
  let showSmoke = false;

  let BG_SCALE = 1;
  let BG_IMAGE;
  let ROCKS_IMAGE;
  let CLOUD_IMAGE;

  const preload = (p5) => {
    if (Object.keys(TREE_IMAGES).length <= 0) {
      TREE_IMAGES["blue"] = p5.loadImage(`/Tree/blue.png`);
      TREE_IMAGES["cyan"] = p5.loadImage(`/Tree/cyan.png`);
      TREE_IMAGES["green"] = p5.loadImage(`/Tree/green.png`);
      TREE_IMAGES["lime"] = p5.loadImage(`/Tree/lime.png`);
      TREE_IMAGES["orange"] = p5.loadImage(`/Tree/orange.png`);
      TREE_IMAGES["pink"] = p5.loadImage(`/Tree/pink.png`);
      TREE_IMAGES["purple"] = p5.loadImage(`/Tree/purple.png`);
      TREE_IMAGES["red"] = p5.loadImage(`/Tree/red.png`);
      TREE_IMAGES["default"] = p5.loadImage(`/Tree/default.png`);
    }

    if (Object.keys(CHARACTER_IDLE_IMAGES).length <= 0) {
      CHARACTER_IDLE_IMAGES["blue"] = p5.loadImage(`/Dino/blue/Idle.png`);
      CHARACTER_IDLE_IMAGES["cyan"] = p5.loadImage(`/Dino/cyan/Idle.png`);
      CHARACTER_IDLE_IMAGES["green"] = p5.loadImage(`/Dino/green/Idle.png`);
      CHARACTER_IDLE_IMAGES["lime"] = p5.loadImage(`/Dino/lime/Idle.png`);
      CHARACTER_IDLE_IMAGES["orange"] = p5.loadImage(`/Dino/orange/Idle.png`);
      CHARACTER_IDLE_IMAGES["pink"] = p5.loadImage(`/Dino/pink/Idle.png`);
      CHARACTER_IDLE_IMAGES["purple"] = p5.loadImage(`/Dino/purple/Idle.png`);
      CHARACTER_IDLE_IMAGES["red"] = p5.loadImage(`/Dino/red/Idle.png`);
    }

    if (Object.keys(CHARACTER_DEAD_IMAGES).length <= 0) {
      CHARACTER_DEAD_IMAGES["blue"] = p5.loadImage(`/Dino/blue/Dead.png`);
      CHARACTER_DEAD_IMAGES["cyan"] = p5.loadImage(`/Dino/cyan/Dead.png`);
      CHARACTER_DEAD_IMAGES["green"] = p5.loadImage(`/Dino/green/Dead.png`);
      CHARACTER_DEAD_IMAGES["lime"] = p5.loadImage(`/Dino/lime/Dead.png`);
      CHARACTER_DEAD_IMAGES["orange"] = p5.loadImage(`/Dino/orange/Dead.png`);
      CHARACTER_DEAD_IMAGES["pink"] = p5.loadImage(`/Dino/pink/Dead.png`);
      CHARACTER_DEAD_IMAGES["purple"] = p5.loadImage(`/Dino/purple/Dead.png`);
      CHARACTER_DEAD_IMAGES["red"] = p5.loadImage(`/Dino/red/Dead.png`);
    }

    if (Object.keys(CHARACTER_JUMPING_IMAGES).length <= 0) {
      CHARACTER_JUMPING_IMAGES["blue"] = p5.loadImage(`/Dino/blue/jumpUp.png`);
      CHARACTER_JUMPING_IMAGES["cyan"] = p5.loadImage(`/Dino/cyan/jumpUp.png`);
      CHARACTER_JUMPING_IMAGES["green"] = p5.loadImage(
        `/Dino/green/jumpUp.png`
      );
      CHARACTER_JUMPING_IMAGES["lime"] = p5.loadImage(`/Dino/lime/jumpUp.png`);
      CHARACTER_JUMPING_IMAGES["orange"] = p5.loadImage(
        `/Dino/orange/jumpUp.png`
      );
      CHARACTER_JUMPING_IMAGES["pink"] = p5.loadImage(`/Dino/pink/jumpUp.png`);
      CHARACTER_JUMPING_IMAGES["purple"] = p5.loadImage(
        `/Dino/purple/jumpUp.png`
      );
      CHARACTER_JUMPING_IMAGES["red"] = p5.loadImage(`/Dino/red/jumpUp.png`);
    }

    if (Object.keys(CHARACTER_FALLING_IMAGES).length <= 0) {
      CHARACTER_FALLING_IMAGES["blue"] = p5.loadImage(
        `/Dino/blue/fallDown.png`
      );
      CHARACTER_FALLING_IMAGES["cyan"] = p5.loadImage(
        `/Dino/cyan/fallDown.png`
      );
      CHARACTER_FALLING_IMAGES["green"] = p5.loadImage(
        `/Dino/green/fallDown.png`
      );
      CHARACTER_FALLING_IMAGES["lime"] = p5.loadImage(
        `/Dino/lime/fallDown.png`
      );
      CHARACTER_FALLING_IMAGES["orange"] = p5.loadImage(
        `/Dino/orange/fallDown.png`
      );
      CHARACTER_FALLING_IMAGES["pink"] = p5.loadImage(
        `/Dino/pink/fallDown.png`
      );
      CHARACTER_FALLING_IMAGES["purple"] = p5.loadImage(
        `/Dino/purple/fallDown.png`
      );
      CHARACTER_FALLING_IMAGES["red"] = p5.loadImage(`/Dino/red/fallDown.png`);
    }

    if (SMOKE_IMAGES.length <= 0) {
      for (let index = 1; index <= 4; index++) {
        SMOKE_IMAGES.push(p5.loadImage(`/Smoke/FX052_0${index}.png`));
      }
    }

    if (!BG_IMAGE) {
      BG_IMAGE = p5.loadImage(`/BG/sky.png`);
    }

    if (!ROCKS_IMAGE) {
      ROCKS_IMAGE = p5.loadImage(`/BG/rocks_2.png`);
    }

    if (!CLOUD_IMAGE) {
      CLOUD_IMAGE = p5.loadImage(`/BG/Clouds_1.png`);
    }
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).parent(canvasParentRef);
    BG_SCALE = CANVAS_HEIGHT / 1080;

    for (let cloudNumber = 0; cloudNumber <= TOTAL_BACKGROUNDS; cloudNumber++) {
      const CLOUD = new Cloud(
        p5,
        cloudNumber,
        1,
        0,
        0,
        BG_SCALE,
        ROCKS_IMAGE,
        CLOUD_IMAGE
      );
      BACKGROUND.push(CLOUD);
    }

    COLORS["blue"] = p5.color("hsl(194, 91%, 68%)");
    COLORS["cyan"] = p5.color("hsl(172, 70%, 59%)");
    COLORS["green"] = p5.color("hsl(72, 59%, 57%)");
    COLORS["lime"] = p5.color("hsl(146, 71%, 60%)");
    COLORS["orange"] = p5.color("hsl(22, 92%, 74%)");
    COLORS["pink"] = p5.color("hsl(309, 92%, 81%)");
    COLORS["purple"] = p5.color("hsl(262, 90%, 84%)");
    COLORS["red"] = p5.color("hsl(356, 78%, 70%)");

    OUTLINE_COLORS.push(p5.color(224, 0, 52));
    OUTLINE_COLORS.push(p5.color(255, 196, 20));
    OUTLINE_COLORS.push(p5.color(93, 48, 243));

    BALL = new Character(
      p5,
      CANVAS_WIDTH / 2,
      COLORS,
      OUTLINE_COLORS,
      CHARACTER_JUMPING_IMAGES[availableColors[selectedColorIndex]],
      CHARACTER_FALLING_IMAGES[availableColors[selectedColorIndex]],
      CHARACTER_IDLE_IMAGES[availableColors[selectedColorIndex]],
      CHARACTER_DEAD_IMAGES[availableColors[selectedColorIndex]]
    );
    GHOST_BALL = new Character(p5, CANVAS_WIDTH + 100);

    // p5.frameRate(30);
  };

  const draw = (p5) => {
    p5.image(BG_IMAGE, 0, 0, 1920 * BG_SCALE, 1080 * BG_SCALE);

    // DRAW
    p5.textFont("Courier New");
    p5.textStyle(p5.BOLD);
    p5.textSize(64);
    p5.noStroke();
    p5.fill(0);

    if (isGameOver) {
      p5.textAlign(p5.CENTER);
      p5.text(`Game Over`, 0, p5.windowHeight / 2 - 64, CANVAS_WIDTH, 64);

      p5.textSize(48);
      p5.text(`Score: ${SCORE}`, 0, p5.windowHeight / 2 + 48, CANVAS_WIDTH, 48);
    }

    if (!isGameOver) {
      p5.textSize(48);
      p5.textAlign(p5.RIGHT);
      p5.text(`Score: ${SCORE}`, 0, 10, CANVAS_WIDTH, 48);

      for (let cloud of BACKGROUND) {
        cloud.draw(p5);
      }

      for (let bar of BARS) {
        bar.draw(p5);
      }

      BALL.draw(p5);

      let imageIndex = Math.floor(p5.frameCount * 0.125) % SMOKE_IMAGES.length;
      if (showSmoke && imageIndex >= 0) {
        p5.image(
          SMOKE_IMAGES[imageIndex],
          BALL.x - 48 - (p5.frameCount % 20),
          BALL.floorYMax - 64,
          32 * 3,
          32 * 3
        );
      }

      // UPDATE
      if (updateGame) {
        for (let cloud of BACKGROUND) {
          cloud.update();
        }

        for (let barIndex = BARS.length - 1; barIndex >= 0; barIndex--) {
          BARS[barIndex].update();

          if (BARS[barIndex].isOffscreen()) {
            BARS.splice(barIndex, 1);
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
          BALL.changeState("JUMPING");
        }
      }

      if (isGameStarted) {
        const isBallAtFloor = BALL.update(p5, nextBarCenter);

        if (isBallAtFloor) {
          if (updateGame) {
            showSmoke = true;

            setTimeout(() => {
              showSmoke = false;
            }, 200);
          }

          if (!lastBarAddedAtFrame) lastBarAddedAtFrame = p5.frameCount;

          if (
            p5.frameCount - lastBarAddedAtFrame <= 0 ||
            p5.frameCount - lastBarAddedAtFrame >= 10
          ) {
            if (
              nextBarIndex != undefined &&
              BARS.length > 0 &&
              selectedColorIndex !== BARS[nextBarIndex].selectedBarColorIndex
            ) {
              setTimeout(() => {
                isGameOver = true;
              }, 2000);

              BALL.isDead = true;
              updateGame = false;
              playDeathSound();
            } else {
              playJumpSound();

              setTimeout(() => {
                SCORE += 1;
                playScoreSound();
              }, 500);

              selectedColorIndex = Math.floor(
                Math.random() * availableColors.length
              );
              BALL.changeCharacterColor({
                jump: CHARACTER_JUMPING_IMAGES[
                  availableColors[selectedColorIndex]
                ],
                fall: CHARACTER_FALLING_IMAGES[
                  availableColors[selectedColorIndex]
                ],
                idle: CHARACTER_IDLE_IMAGES[
                  availableColors[selectedColorIndex]
                ],
                dead: CHARACTER_DEAD_IMAGES[
                  availableColors[selectedColorIndex]
                ],
              });
            }
          }

          lastBarAddedAtFrame = p5.frameCount;
        }
      }

      if (updateGame) {
        const isGhostBallAtFloor = GHOST_BALL.update(p5, nextBarCenter);
        if (isGhostBallAtFloor) {
          if (!lastGhostBarAddedAtFrame)
            lastGhostBarAddedAtFrame = p5.frameCount;

          if (
            p5.frameCount - lastGhostBarAddedAtFrame <= 0 ||
            p5.frameCount - lastGhostBarAddedAtFrame >= 10
          ) {
            BARS.push(new Bar(p5, TREE_IMAGES["default"], CANVAS_WIDTH));
          }

          lastGhostBarAddedAtFrame = p5.frameCount;
        }
      }
    }
  };

  const mouseClicked = (p5) => {
    if (isGameOver) {
      BALL = new Character(
        p5,
        CANVAS_WIDTH / 2,
        COLORS,
        OUTLINE_COLORS,
        CHARACTER_JUMPING_IMAGES[availableColors[selectedColorIndex]],
        CHARACTER_FALLING_IMAGES[availableColors[selectedColorIndex]],
        CHARACTER_IDLE_IMAGES[availableColors[selectedColorIndex]],
        CHARACTER_DEAD_IMAGES[availableColors[selectedColorIndex]]
      );
      GHOST_BALL = new Character(p5, CANVAS_WIDTH + 100);
      lastBarAddedAtFrame = undefined;
      nextBarIndex = undefined;
      nextBarCenter = undefined;
      isGameStarted = false;
      isGameOver = false;
      updateGame = true;
      SCORE = 0;
      BARS = [];
    }

    if (!isGameOver && updateGame) {
      if (nextBarIndex != undefined && BARS.length > 0) {
        BARS[nextBarIndex].selectedBarColorIndex =
          (BARS[nextBarIndex].selectedBarColorIndex + 1) %
          availableColors.length;

        BARS[nextBarIndex].changeTreeColor(
          TREE_IMAGES[availableColors[BARS[nextBarIndex].selectedBarColorIndex]]
        );
      }
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
