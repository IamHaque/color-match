import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { useEffect, useRef } from "react";

import Text from "../classes/text";
import Tree from "../classes/tree";
import Backdrop from "../classes/backdrop";
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
  const router = useRouter();

  const CANVAS_WIDTH_REF = useRef(100);
  const CANVAS_HEIGHT_REF = useRef(100);

  const JUMP_SOUND_REF = useRef();
  const DEATH_SOUND_REF = useRef();
  const SCORE_INCREASE_SOUND_REF = useRef();

  const USERNAME_REF = useRef();

  useEffect(() => {
    JUMP_SOUND_REF.current = new Audio("/land.mp3");
    DEATH_SOUND_REF.current = new Audio("/death.mp3");
    SCORE_INCREASE_SOUND_REF.current = new Audio("/score.mp3");

    CANVAS_HEIGHT_REF.current = window.innerHeight;
    CANVAS_WIDTH_REF.current =
      window.innerWidth > 720 ? 720 : window.innerWidth;

    let localUsername = JSON.parse(localStorage.getItem("jumpyDinoUsername"));
    if (localUsername) {
      USERNAME_REF.current = localUsername;
    }
  }, []);

  const redirectTOGameOver = (score) => {
    router.push({
      pathname: "/gameOver",
      query: { score, username: USERNAME_REF.current },
    });
  };

  const saveScore = async () => {
    saveScoreLocally();
    await saveScoreRemotely();
  };

  const saveScoreLocally = () => {
    localStorage.setItem("jumpyDinoLastScore", JSON.stringify(score));
  };

  const saveScoreRemotely = async () => {
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ username: USERNAME_REF.current, score }),
      headers: { "Content-Type": "application/json" },
    };

    const response = await fetch("/api/updateHighscore", requestOptions);
    await response.json();
  };

  const stopAllSounds = () => {
    JUMP_SOUND_REF.current.pause();
    DEATH_SOUND_REF.current.pause();
    SCORE_INCREASE_SOUND_REF.current.pause();

    JUMP_SOUND_REF.current.currentTime = 0;
    DEATH_SOUND_REF.current.currentTime = 0;
    SCORE_INCREASE_SOUND_REF.current.currentTime = 0;
  };

  const playJumpSound = () => {
    stopAllSounds();
    JUMP_SOUND_REF.current.play();
  };

  const playScoreSound = () => {
    stopAllSounds();
    SCORE_INCREASE_SOUND_REF.current.play();
  };

  const playDeathSound = () => {
    JUMP_SOUND_REF.current.pause();
    SCORE_INCREASE_SOUND_REF.current.pause();

    JUMP_SOUND_REF.current.currentTime = 0;
    SCORE_INCREASE_SOUND_REF.current.currentTime = 0;

    if (DEATH_SOUND_REF.current.currentTime <= 0)
      DEATH_SOUND_REF.current.play();
  };

  const ALL_COLORS = ["blue", "cyan", "lime", "pink", "purple", "red"];
  let REMAINING_COLORS = ["cyan", "pink", "purple"];
  let AVAILABLE_COLORS = ["blue", "red", "lime"];
  let selectedColorIndex = 1;

  const HSL_COLOR_PAIRS = {
    blue: "hsl(194, 91%, 68%)",
    cyan: "hsl(172, 70%, 59%)",
    green: "hsl(72, 59%, 57%)",
    lime: "hsl(146, 71%, 60%)",
    orange: "hsl(22, 92%, 74%)",
    pink: "hsl(309, 92%, 81%)",
    purple: "hsl(262, 90%, 84%)",
    red: "hsl(356, 78%, 70%)",
  };
  const P5_HSL_COLORS = [];

  const BACKDROPS = [];
  const TREES = [];

  let GHOST_DINO;
  let DINO;

  let score = 0;
  let difficultyIncrementAtScore = 15;

  let isGameStarted = false;
  let isGameOver = false;
  let updateGame = true;

  const GAME_MODE = "PROD";
  const MIN_DISTANCE_TO_START_GAME = 150;

  let lastGhostTreeAddedAtFrame;
  let lastTreeAddedAtFrame;
  let nextTreeCenter;
  let nextTreeIndex;

  let showSmokeParticles = false;
  const SMOKE_IMAGES = [];

  let BACKDROP_SCALE = 1;
  let ROCKS_IMAGE;
  let CLOUD_IMAGE;

  let TEXT;

  let TREE_IMAGES = {};
  let CHARACTER_IDLE_IMAGES = {};
  let CHARACTER_DEAD_IMAGES = {};
  let CHARACTER_JUMPING_IMAGES = {};
  let CHARACTER_FALLING_IMAGES = {};

  const preload = (p5) => {
    if (Object.keys(TREE_IMAGES).length <= 0) {
      for (let color of ALL_COLORS) {
        TREE_IMAGES[color] = p5.loadImage(`/Tree/${color}.png`);
      }
      TREE_IMAGES["default"] = p5.loadImage(`/Tree/default.png`);
    }

    if (Object.keys(CHARACTER_IDLE_IMAGES).length <= 0) {
      for (let color of ALL_COLORS) {
        CHARACTER_IDLE_IMAGES[color] = p5.loadImage(
          `/Dino/${color}_dino_idle.png`
        );
      }
    }

    if (Object.keys(CHARACTER_DEAD_IMAGES).length <= 0) {
      for (let color of ALL_COLORS) {
        CHARACTER_DEAD_IMAGES[color] = p5.loadImage(
          `/Dino/${color}_dino_dead.png`
        );
      }
    }

    if (Object.keys(CHARACTER_JUMPING_IMAGES).length <= 0) {
      for (let color of ALL_COLORS) {
        CHARACTER_JUMPING_IMAGES[color] = p5.loadImage(
          `/Dino/${color}_dino_jump.png`
        );
      }
    }

    if (Object.keys(CHARACTER_FALLING_IMAGES).length <= 0) {
      for (let color of ALL_COLORS) {
        CHARACTER_FALLING_IMAGES[color] = p5.loadImage(
          `/Dino/${color}_dino_fall.png`
        );
      }
    }

    if (SMOKE_IMAGES.length <= 0) {
      for (let index = 1; index <= 4; index++) {
        SMOKE_IMAGES.push(p5.loadImage(`/Smoke/FX052_0${index}.png`));
      }
    }

    if (!ROCKS_IMAGE) {
      ROCKS_IMAGE = p5.loadImage(`/BG/rocks_2.png`);
    }

    if (!CLOUD_IMAGE) {
      CLOUD_IMAGE = p5.loadImage(`/BG/clouds_1.png`);
    }
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(CANVAS_WIDTH_REF.current, CANVAS_HEIGHT_REF.current).parent(
      canvasParentRef
    );

    for (let color of ALL_COLORS) {
      P5_HSL_COLORS[color] = p5.color(HSL_COLOR_PAIRS[color]);
    }

    BACKDROP_SCALE = CANVAS_HEIGHT_REF.current / 540;

    for (let index = 0; index <= 2; index++) {
      BACKDROPS.push(
        new Backdrop(index, 1, 0, 0, BACKDROP_SCALE, ROCKS_IMAGE, CLOUD_IMAGE)
      );
    }

    DINO = new Character(
      p5,
      CANVAS_WIDTH_REF.current / 3,
      CHARACTER_JUMPING_IMAGES[AVAILABLE_COLORS[selectedColorIndex]],
      CHARACTER_FALLING_IMAGES[AVAILABLE_COLORS[selectedColorIndex]],
      CHARACTER_IDLE_IMAGES[AVAILABLE_COLORS[selectedColorIndex]],
      CHARACTER_DEAD_IMAGES[AVAILABLE_COLORS[selectedColorIndex]]
    );

    GHOST_DINO = new Character(p5, CANVAS_WIDTH_REF.current + 100);

    TEXT = new Text();

    p5.frameRate(45);
  };

  const draw = (p5) => {
    // DRAW
    p5.clear();

    if (!isGameOver) {
      for (let backdrop of BACKDROPS) {
        backdrop.draw(p5);
      }

      for (let tree of TREES) {
        tree.draw(p5);
      }

      DINO.draw(p5);

      if (showSmokeParticles) {
        let imageIndex =
          Math.floor(p5.frameCount * 0.125) % SMOKE_IMAGES.length;

        imageIndex >= 0 &&
          p5.image(
            SMOKE_IMAGES[imageIndex],
            DINO.x - 48 - (p5.frameCount % 20),
            DINO.floorYMax - 64,
            32 * 3,
            32 * 3
          );
      }

      // Show Score
      TEXT.show(
        p5,
        `Score: ${score}`,
        0,
        10,
        CANVAS_WIDTH_REF.current,
        32,
        "right"
      );

      // UPDATE
      if (updateGame) {
        for (let backdrop of BACKDROPS) {
          backdrop.update();
        }

        for (let treeIndex = TREES.length - 1; treeIndex >= 0; treeIndex--) {
          TREES[treeIndex].update();

          if (TREES[treeIndex].isOffscreen()) {
            TREES.splice(treeIndex, 1);
          }
        }

        // Finding next tree to bounce on
        nextTreeIndex = undefined;
        nextTreeCenter = undefined;

        for (let treeIndex = 0; treeIndex < TREES.length; treeIndex++) {
          const characterCenter = DINO.x;
          const treeCenter = TREES[treeIndex].x + TREES[treeIndex].width / 2;

          if (treeCenter - characterCenter < 0) {
            continue;
          }

          if (!nextTreeCenter) {
            nextTreeCenter = treeCenter;
            nextTreeIndex = treeIndex;
            continue;
          }

          if (nextTreeCenter > treeCenter) {
            nextTreeCenter = treeCenter;
            nextTreeIndex = treeIndex;
            break;
          }
        }

        if (
          !isGameStarted &&
          nextTreeCenter - DINO.x < MIN_DISTANCE_TO_START_GAME
        ) {
          isGameStarted = true;
          DINO.changeState("JUMPING");
        }

        const isGhostCharacterAtFloor = GHOST_DINO.update(p5, nextTreeCenter);
        if (isGhostCharacterAtFloor) {
          if (!lastGhostTreeAddedAtFrame)
            lastGhostTreeAddedAtFrame = p5.frameCount;

          if (
            p5.frameCount - lastGhostTreeAddedAtFrame <= 0 ||
            p5.frameCount - lastGhostTreeAddedAtFrame >= 10
          ) {
            TREES.push(
              new Tree(p5, TREE_IMAGES["default"], CANVAS_WIDTH_REF.current)
            );
          }

          lastGhostTreeAddedAtFrame = p5.frameCount;
        }
      }

      if (isGameStarted) {
        const isCharacterAtFloor = DINO.update(p5, nextTreeCenter);

        if (isCharacterAtFloor) {
          if (updateGame) {
            showSmokeParticles = true;

            setTimeout(() => {
              showSmokeParticles = false;
            }, 200);
          }

          if (!lastTreeAddedAtFrame) lastTreeAddedAtFrame = p5.frameCount;

          if (
            p5.frameCount - lastTreeAddedAtFrame <= 0 ||
            p5.frameCount - lastTreeAddedAtFrame >= 10
          ) {
            if (
              nextTreeIndex != undefined &&
              TREES.length > 0 &&
              selectedColorIndex !== TREES[nextTreeIndex].colorIndex
            ) {
              if (GAME_MODE !== "DEV") {
                saveScore();

                DINO.isDead = true;
                updateGame = false;

                playDeathSound();

                setTimeout(() => {
                  isGameOver = true;
                  redirectTOGameOver(score);
                }, 1000);
              }
            } else {
              playJumpSound();

              setTimeout(() => {
                score += 1;
                playScoreSound();
                increaseGameDifficulty();
              }, 500);

              selectedColorIndex = getRandomArrayIndex(AVAILABLE_COLORS);
              DINO.changeCharacterColor({
                jump: CHARACTER_JUMPING_IMAGES[
                  AVAILABLE_COLORS[selectedColorIndex]
                ],
                fall: CHARACTER_FALLING_IMAGES[
                  AVAILABLE_COLORS[selectedColorIndex]
                ],
                idle: CHARACTER_IDLE_IMAGES[
                  AVAILABLE_COLORS[selectedColorIndex]
                ],
                dead: CHARACTER_DEAD_IMAGES[
                  AVAILABLE_COLORS[selectedColorIndex]
                ],
              });
            }

            lastTreeAddedAtFrame = p5.frameCount;
          }
        }
      }
    }
  };

  const mouseClicked = () => {
    if (isGameOver) return;

    if (updateGame && nextTreeIndex !== undefined && TREES.length > 0) {
      TREES[nextTreeIndex].colorIndex =
        (TREES[nextTreeIndex].colorIndex + 1) % AVAILABLE_COLORS.length;

      TREES[nextTreeIndex].changeTreeColor(
        TREE_IMAGES[AVAILABLE_COLORS[TREES[nextTreeIndex].colorIndex]]
      );
    }
  };

  const increaseGameDifficulty = () => {
    if (REMAINING_COLORS.length <= 0) return;

    if (score === difficultyIncrementAtScore) {
      difficultyIncrementAtScore = Math.floor(difficultyIncrementAtScore * 2.1);

      const nextColorIndex = getRandomArrayIndex(REMAINING_COLORS);
      const nextColor = REMAINING_COLORS.splice(nextColorIndex, 1)[0];
      AVAILABLE_COLORS.push(nextColor);
    }
  };

  const getRandomArrayIndex = (arr) => Math.floor(Math.random() * arr.length);

  return (
    <Sketch
      draw={draw}
      setup={setup}
      preload={preload}
      className={styles.canvas}
      mouseClicked={mouseClicked}
      disableFriendlyErrors={true}
    />
  );
}
