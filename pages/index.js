import dynamic from "next/dynamic";

import { useState, useEffect, useRef } from "react";

import {
  GAME_MODE,
  ALL_COLORS,
  HSL_COLOR_PAIRS,
  DIFFICULTY_MULTIPLIER,
  MIN_DISTANCE_TO_START_GAME,
} from "../utils/GAME_CONSTANTS";
import * as API from "../utils/API";
import { getRandomArrayIndex } from "../utils/GAME_FUNCTIONS";

import HomeScreen from "../components/Home/home";
import GameOver from "../components/GameOver/gameOver";

import Text from "../classes/text";
import Tree from "../classes/tree";
import Backdrop from "../classes/backdrop";
import Character from "../classes/character";

import styles from "../styles/home.module.scss";

const Sketch = dynamic(
  () =>
    import("react-p5").then((mod) => {
      return mod.default;
    }),
  {
    ssr: false,
  }
);

export default function Home({ leaderboardData }) {
  // Game variables
  // ["blue", "cyan", "green", "lime", "orange", "pink", "purple", "red"]
  let REMAINING_COLORS = ["cyan", "lime", "orange", "pink", "purple"];
  let AVAILABLE_COLORS = ["red", "green", "blue"];
  let selectedColorIndex = 1;

  const P5_HSL_COLORS = [];

  const BACKDROPS = [];
  const TREES = [];

  let GHOST_DINO;
  let DINO;

  let score = 0;
  let difficultyIncrementAtScore = 20 + Math.floor(Math.random() * 10);

  let firstTreeHasCrossed = false;
  let isGameStarted = false;
  let isGameOver = false;
  let updateGame = true;

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

  let GAME_OVER_TIMEOUT;

  // Game states
  const [isBusy, setIsBusy] = useState(false);
  const [username, setUsername] = useState("");
  const [userExists, setUserExists] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [response, setResponse] = useState(undefined);
  const [gameState, setGameState] = useState("homeScreen");
  const [leaderboard, setLeaderboard] = useState(leaderboardData);

  // Game static references
  const CANVAS_WIDTH_REF = useRef(100);
  const CANVAS_HEIGHT_REF = useRef(100);

  const JUMP_SOUND_REF = useRef();
  const DEATH_SOUND_REF = useRef();
  const SCORE_INCREASE_SOUND_REF = useRef();

  useEffect(() => {
    JUMP_SOUND_REF.current = new Audio("/land.mp3");
    DEATH_SOUND_REF.current = new Audio("/death.mp3");
    SCORE_INCREASE_SOUND_REF.current = new Audio("/score.mp3");

    CANVAS_HEIGHT_REF.current = window.innerHeight;
    CANVAS_WIDTH_REF.current =
      window.innerWidth > 720 ? 720 : window.innerWidth;

    let localUsername = JSON.parse(localStorage.getItem("jumpyDinoUsername"));
    if (localUsername) {
      setUserExists(true);
      setUsername(localUsername);
    }
  }, []);

  const stopAllSounds = () => {
    JUMP_SOUND_REF.current.pause();
    DEATH_SOUND_REF.current.pause();
    SCORE_INCREASE_SOUND_REF.current.pause();

    JUMP_SOUND_REF.current.currentTime = 0;
    DEATH_SOUND_REF.current.currentTime = 0;
    SCORE_INCREASE_SOUND_REF.current.currentTime = 0;
  };

  const playDeathSound = () => {
    JUMP_SOUND_REF.current.pause();
    SCORE_INCREASE_SOUND_REF.current.pause();

    JUMP_SOUND_REF.current.currentTime = 0;
    SCORE_INCREASE_SOUND_REF.current.currentTime = 0;

    if (DEATH_SOUND_REF.current.currentTime <= 0)
      DEATH_SOUND_REF.current.play();
  };

  const playJumpSound = () => {
    stopAllSounds();
    JUMP_SOUND_REF.current.play();
  };

  const playScoreSound = () => {
    stopAllSounds();
    SCORE_INCREASE_SOUND_REF.current.play();
  };

  const handleInput = (e) => {
    setUsername(e.target.value.trim());
  };

  const registerUser = async () => {
    const data = await API.createNewUser(username);
    setResponse(data);

    if (data.status && data.status === "success") {
      localStorage.setItem("jumpyDinoUsername", JSON.stringify(username));
      setUserExists(true);
    }
  };

  const startGame = () => {
    if (isBusy) return;

    setIsBusy(true);
    setCurrentScore(0);
    setGameState("playing");
    setIsBusy(false);
  };

  const goToHome = () => {
    if (isBusy) return;

    setIsBusy(true);
    setCurrentScore(0);
    setGameState("homeScreen");
    setIsBusy(false);
  };

  const redirectTOGameOver = async () => {
    // Get updated leaderboard
    const data = await API.getLeaderboardData();

    setLeaderboard(data);

    setCurrentScore(score);
    setGameState("gameOver");

    clearTimeout(GAME_OVER_TIMEOUT);
  };

  const handleGameOver = async () => {
    if (GAME_OVER_TIMEOUT) return;

    playDeathSound();

    DINO.isDead = true;
    updateGame = false;

    // Save score in local storage
    localStorage.setItem("jumpyDinoLastScore", JSON.stringify(score));

    // Save score in database if score greater than highscore
    const userLeaderboardData = leaderboard.find(
      (user) => user.username === username
    );

    if (!userLeaderboardData || userLeaderboardData.highscore < score) {
      await API.updateLeaderboard(username, score);
    }

    GAME_OVER_TIMEOUT = setTimeout(() => {
      isGameOver = true;
      redirectTOGameOver();
    }, 1000);
  };

  const increaseGameDifficulty = () => {
    if (REMAINING_COLORS.length <= 0) return;

    if (score === difficultyIncrementAtScore) {
      difficultyIncrementAtScore = Math.floor(
        difficultyIncrementAtScore * DIFFICULTY_MULTIPLIER
      );

      const nextColorIndex = getRandomArrayIndex(REMAINING_COLORS);
      const nextColor = REMAINING_COLORS.splice(nextColorIndex, 1)[0];
      AVAILABLE_COLORS.push(nextColor);
    }
  };

  const showTopColorBars = (p5) => {
    const colorBarHeight = 15;
    const colorBarWidth = CANVAS_WIDTH_REF.current / AVAILABLE_COLORS.length;

    for (let index = 0; index < AVAILABLE_COLORS.length; index++) {
      p5.noStroke();
      p5.fill(P5_HSL_COLORS[AVAILABLE_COLORS[index]]);
      p5.rect(index * colorBarWidth, 0, colorBarWidth, colorBarHeight);

      if (
        nextTreeIndex !== undefined &&
        TREES.length > 0 &&
        TREES[nextTreeIndex].colorIndex === index
      ) {
        p5.push();
        p5.strokeWeight(3);
        p5.drawingContext.setLineDash([8, 8, 8]);
        p5.stroke(255);
        p5.rect(
          index * colorBarWidth + 1.5,
          0 + 1.5,
          colorBarWidth - 3,
          colorBarHeight - 3
        );
        p5.pop();
      }
    }

    p5.strokeWeight(2);
    p5.stroke(0);
    p5.line(
      0,
      colorBarHeight + 1,
      CANVAS_WIDTH_REF.current,
      colorBarHeight + 1
    );
  };

  const drawGameGraphics = (p5) => {
    for (let backdrop of BACKDROPS) {
      backdrop.draw(p5);
    }

    for (let tree of TREES) {
      tree.draw(p5);
    }

    showTopColorBars(p5);

    DINO.draw(p5);

    if (showSmokeParticles) {
      let imageIndex = Math.floor(p5.frameCount * 0.125) % SMOKE_IMAGES.length;

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
      35,
      CANVAS_WIDTH_REF.current - 20,
      32,
      "right"
    );
  };

  const showGameInfo = (p5) => {
    p5.push();

    let textSize = 20;

    if (CANVAS_WIDTH_REF.current < 380) {
      textSize = 16;
    } else if (CANVAS_WIDTH_REF.current < 480) {
      textSize = 18;
    }

    p5.textSize(textSize);
    p5.textAlign(p5.CENTER);
    p5.textFont("Helvetica");
    p5.stroke(0, 123);
    p5.fill(255, 127);

    p5.text(
      "Tap on left or right side of the screen\nto change the tree color.\nMatch the tree color with the color of\nthe dino!\n\nTAP ANYWHERE TO START",
      CANVAS_WIDTH_REF.current / 2,
      CANVAS_HEIGHT_REF.current / 2 - textSize * 2.5
    );

    textSize *= 2;
    p5.textSize(textSize);

    p5.text(
      "LEFT",
      0,
      CANVAS_HEIGHT_REF.current - textSize * 1.5,
      CANVAS_WIDTH_REF.current / 2,
      textSize
    );

    p5.text(
      "RIGHT",
      CANVAS_WIDTH_REF.current / 2,
      CANVAS_HEIGHT_REF.current - textSize * 1.5,
      CANVAS_WIDTH_REF.current / 2,
      textSize
    );

    p5.pop();
  };

  const showOverlay = (p5) => {
    p5.push();
    p5.fill(0);
    p5.noStroke();
    p5.rect(0, 0, CANVAS_WIDTH_REF.current, CANVAS_HEIGHT_REF.current);

    p5.fill(255, 50);
    p5.rect(0, 0, CANVAS_WIDTH_REF.current / 2 - 1, CANVAS_HEIGHT_REF.current);
    p5.rect(
      CANVAS_WIDTH_REF.current / 2 + 1,
      0,
      CANVAS_WIDTH_REF.current,
      CANVAS_HEIGHT_REF.current
    );

    showGameInfo(p5);
    DINO.draw(p5);
    p5.pop();
  };

  // P5 Preload
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

  // P5 Setup
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

    selectedColorIndex = getRandomArrayIndex(AVAILABLE_COLORS);
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
  };

  // P5 Draw
  const draw = (p5) => {
    if (!isGameOver) {
      // DRAW
      p5.clear();

      drawGameGraphics(p5);

      // Display game instructions
      !isGameStarted && showOverlay(p5);

      // UPDATE
      if (isGameStarted && updateGame) {
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
          !firstTreeHasCrossed &&
          nextTreeCenter - DINO.x < MIN_DISTANCE_TO_START_GAME
        ) {
          firstTreeHasCrossed = true;
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

      if (isGameStarted && firstTreeHasCrossed) {
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
                handleGameOver();
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

  // P5 MouseClicked
  const mouseClicked = ({ _setupDone, pmouseX }) => {
    if (isGameOver) return;
    if (!_setupDone) return;

    if (!isGameStarted) {
      isGameStarted = true;
      return;
    }

    if (updateGame && TREES.length > 0 && nextTreeIndex !== undefined) {
      const minX = 0;
      const maxX = CANVAS_WIDTH_REF.current;
      const midX = maxX / 2;

      let nextColorIndex = TREES[nextTreeIndex].colorIndex;
      if (pmouseX >= minX && pmouseX < midX) nextColorIndex -= 1;
      if (pmouseX <= maxX && pmouseX > midX) nextColorIndex += 1;

      nextColorIndex =
        nextColorIndex < 0
          ? AVAILABLE_COLORS.length - 1
          : nextColorIndex % AVAILABLE_COLORS.length;

      TREES[nextTreeIndex].colorIndex = nextColorIndex;
      TREES[nextTreeIndex].changeTreeColor(
        TREE_IMAGES[AVAILABLE_COLORS[nextColorIndex]]
      );
    }
  };

  if (gameState === "gameOver") {
    return (
      <GameOver
        isBusy={isBusy}
        minDataLength={-1}
        data={leaderboard}
        score={currentScore}
        currentUser={username}
        minLeaderboardUsers={5}
        homepageClickHandler={goToHome}
        startGameClickHandler={startGame}
      />
    );
  }

  if (gameState === "playing") {
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

  return (
    <HomeScreen
      errorMessage={
        response && response.status && response.status === "failed"
          ? response.message
          : ""
      }
      username={username}
      userExists={userExists}
      inputHandler={handleInput}
      submitHandler={registerUser}
      startGameClickHandler={startGame}
    />
  );
}

export async function getServerSideProps() {
  const dev = process.env.NODE_ENV !== "production";
  const hostname = dev
    ? "http://localhost:3000"
    : "https://jumpy-dino-guy.herokuapp.com";

  const leaderboardData = await API.getLeaderboardData(hostname);

  return {
    props: { leaderboardData }, // will be passed to the page component as props
  };
}
