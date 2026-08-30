/* =========================================================
   ELEMENTS
========================================================= */

const musicIntro = document.getElementById("musicIntro");
const playSongBtn = document.getElementById("playSongBtn");
const mainPage = document.getElementById("mainPage");
const backgroundSong = document.getElementById("backgroundSong");

const questionContainer =
  document.querySelector(".question-container");

const yesBtn =
  document.querySelector(".js-yes-btn");

const noBtn =
  document.querySelector(".js-no-btn");

const heartLoader =
  document.querySelector(".cssload-main");


/* =========================================================
   SETTINGS
========================================================= */

const SONG_START_TIME = 43.000;

let noMoving = false;
let lastNoMove = 0;
let yesClicked = false;


/* =========================================================
   SONG
   Start exactly from 00:00:43.000
========================================================= */

function seekTo43() {
  return new Promise((resolve) => {

    if (!backgroundSong) {
      resolve();
      return;
    }

    const finish = () => {
      cleanup();
      resolve();
    };

    const cleanup = () => {
      backgroundSong.removeEventListener("seeked", finish);
    };

    /*
     * If already at 43 seconds, no need to seek again.
     */
    if (
      Math.abs(
        backgroundSong.currentTime - SONG_START_TIME
      ) < 0.01
    ) {
      resolve();
      return;
    }

    backgroundSong.addEventListener(
      "seeked",
      finish,
      { once: true }
    );

    backgroundSong.currentTime = SONG_START_TIME;

    /*
     * Safety fallback.
     * Some browsers can fail to emit seeked in unusual
     * situations. Never block the website because of audio.
     */
    setTimeout(() => {
      cleanup();
      resolve();
    }, 1500);
  });
}


async function startSong() {

  try {

    /*
     * Wait only for metadata.
     * Do NOT let audio prevent the page from working.
     */
    if (backgroundSong.readyState < 1) {

      await new Promise((resolve) => {

        if (backgroundSong.readyState >= 1) {
          resolve();
          return;
        }

        backgroundSong.addEventListener(
          "loadedmetadata",
          resolve,
          { once: true }
        );

        setTimeout(resolve, 2000);
      });
    }

    /*
     * Seek to exactly 43 seconds BEFORE play.
     */
    await seekTo43();

    /*
     * User has explicitly clicked Play,
     * so browser autoplay restrictions are satisfied.
     */
    await backgroundSong.play();

  } catch (error) {

    console.warn(
      "Audio could not start:",
      error
    );

  }
}


/* =========================================================
   LOOP FROM 00:43
========================================================= */

backgroundSong.addEventListener(
  "ended",
  async () => {

    try {

      await seekTo43();

      await backgroundSong.play();

    } catch (error) {

      console.warn(
        "Audio loop could not restart:",
        error
      );

    }
  }
);


/* =========================================================
   PLAY THE SONG
========================================================= */

playSongBtn.addEventListener(
  "click",
  async () => {

    if (playSongBtn.disabled) return;

    playSongBtn.disabled = true;

    /*
     * Start the audio.
     * Audio failure must NEVER stop the page transition.
     */
    startSong();

    /*
     * Immediately reveal the main page.
     */
    musicIntro.classList.add("intro-hidden");

    mainPage.classList.add("main-visible");

    mainPage.setAttribute(
      "aria-hidden",
      "false"
    );

    setTimeout(() => {
      musicIntro.style.display = "none";
    }, 650);

  }
);


/* =========================================================
   VIEWPORT
   Use the actual CSS viewport.
========================================================= */

function getViewportSize() {

  const width =
    document.documentElement.clientWidth ||
    window.innerWidth;

  const height =
    document.documentElement.clientHeight ||
    window.innerHeight;

  return {
    width,
    height
  };
}


/* =========================================================
   MOVE NO BUTTON
   IMPORTANT:
   The button is positioned relative to the viewport.
   It is NEVER allowed outside the frame.
========================================================= */

function moveNoButton(event) {

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const now = Date.now();

  /*
   * Ignore duplicate pointer/touch/click events.
   */
  if (now - lastNoMove < 180) {
    return;
  }

  lastNoMove = now;

  if (noMoving || yesClicked) {
    return;
  }

  noMoving = true;


  /* -------------------------------------------------------
     Get actual button dimensions
  ------------------------------------------------------- */

  const rect =
    noBtn.getBoundingClientRect();

  const buttonWidth =
    rect.width;

  const buttonHeight =
    rect.height;


  /* -------------------------------------------------------
     Get actual viewport
  ------------------------------------------------------- */

  const viewport =
    getViewportSize();

  const screenWidth =
    viewport.width;

  const screenHeight =
    viewport.height;


  /* -------------------------------------------------------
     Safe padding
  ------------------------------------------------------- */

  const padding =
    Math.max(
      12,
      Math.min(
        24,
        screenWidth * 0.035
      )
    );


  /*
   * HARD boundaries.
   *
   * The button's complete rectangle must remain
   * inside these coordinates.
   */
  const minX =
    padding;

  const maxX =
    Math.max(
      minX,
      screenWidth -
      buttonWidth -
      padding
    );


  const minY =
    padding;

  const maxY =
    Math.max(
      minY,
      screenHeight -
      buttonHeight -
      padding
    );


  /* -------------------------------------------------------
     YES button bounds
  ------------------------------------------------------- */

  const yesRect =
    yesBtn.getBoundingClientRect();


  let x = minX;
  let y = minY;

  let foundPosition = false;


  /* -------------------------------------------------------
     Find random position
  ------------------------------------------------------- */

  for (
    let attempt = 0;
    attempt < 100;
    attempt++
  ) {

    x =
      minX +
      Math.random() *
      Math.max(
        1,
        maxX - minX
      );


    y =
      minY +
      Math.random() *
      Math.max(
        1,
        maxY - minY
      );


    const noRight =
      x + buttonWidth;

    const noBottom =
      y + buttonHeight;


    /*
     * Keep No away from Yes.
     */
    const gap = 35;


    const overlapsYes =

      x <
        yesRect.right + gap

      &&

      noRight >
        yesRect.left - gap

      &&

      y <
        yesRect.bottom + gap

      &&

      noBottom >
        yesRect.top - gap;


    if (!overlapsYes) {

      foundPosition = true;

      break;

    }

  }


  /*
   * If no random position was found,
   * still use a valid position.
   */
  if (!foundPosition) {

    x = minX;
    y = minY;

  }


  /* -------------------------------------------------------
     FINAL ABSOLUTE CLAMP
  ------------------------------------------------------- */

  x =
    Math.max(
      minX,
      Math.min(
        x,
        maxX
      )
    );


  y =
    Math.max(
      minY,
      Math.min(
        y,
        maxY
      )
    );


  /* -------------------------------------------------------
     Move button
  ------------------------------------------------------- */

  noBtn.style.position =
    "fixed";

  noBtn.style.left =
    `${Math.round(x)}px`;

  noBtn.style.top =
    `${Math.round(y)}px`;

  noBtn.style.right =
    "auto";

  noBtn.style.bottom =
    "auto";

  noBtn.style.margin =
    "0";

  noBtn.style.transform =
    "scale(1.05)";


  /*
   * Release movement lock.
   */
  setTimeout(() => {
    noMoving = false;
  }, 220);

}


/* =========================================================
   DESKTOP
========================================================= */

/*
 * Move BEFORE the mouse can click No.
 */
noBtn.addEventListener(
  "pointerenter",
  (event) => {

    if (
      event.pointerType === "mouse"
    ) {

      moveNoButton(event);

    }

  }
);


/* =========================================================
   MOBILE
========================================================= */

/*
 * On touch, move immediately.
 */
noBtn.addEventListener(
  "pointerdown",
  moveNoButton,
  { passive: false }
);


/*
 * Compatibility fallback.
 */
noBtn.addEventListener(
  "touchstart",
  moveNoButton,
  { passive: false }
);


/*
 * If click somehow reaches No,
 * move it instead of doing anything.
 */
noBtn.addEventListener(
  "click",
  (event) => {

    event.preventDefault();
    event.stopPropagation();

    moveNoButton(event);

  }
);


/* =========================================================
   RESIZE / ROTATION
========================================================= */

function resetNoButton() {

  if (yesClicked) return;

  noBtn.style.position = "";
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.right = "";
  noBtn.style.bottom = "";
  noBtn.style.margin = "";
  noBtn.style.transform = "";

  noMoving = false;

}


window.addEventListener(
  "resize",
  resetNoButton
);


/* =========================================================
   YES
========================================================= */

yesBtn.addEventListener(
  "click",
  () => {

    if (yesClicked) return;

    yesClicked = true;

    /*
     * Stop No from moving.
     */
    noBtn.style.pointerEvents = "none";

    /*
     * Hide question.
     */
    questionContainer.classList.add(
      "question-hidden"
    );

    /*
     * Show heart loader.
     */
    heartLoader.classList.add("show");

    /*
     * Go to next page.
     */
    setTimeout(() => {

      window.location.assign(
        "result.html"
      );

    }, 900);

  }
);


/* =========================================================
   VIDEO AUTOPLAY
========================================================= */

document
  .querySelectorAll("video")
  .forEach((video) => {

    video.play().catch(() => {
      // Browser may wait for interaction.
    });

  });
