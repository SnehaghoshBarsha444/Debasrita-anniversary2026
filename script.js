const musicIntro = document.getElementById("musicIntro");
const playSongBtn = document.getElementById("playSongBtn");
const mainPage = document.getElementById("mainPage");
const backgroundSong = document.getElementById("backgroundSong");

const questionContainer = document.querySelector(".question-container");
const yesBtn = document.querySelector(".js-yes-btn");
const noBtn = document.querySelector(".js-no-btn");
const heartLoader = document.querySelector(".cssload-main");

const SONG_START_TIME = 43.000;

let noMoving = false;
let lastNoMove = 0;
let yesClicked = false;


/* =========================================================
   SONG
========================================================= */

function seekTo43() {
  return new Promise((resolve) => {
    if (!backgroundSong || backgroundSong.readyState < 1) {
      resolve();
      return;
    }

    if (
      Math.abs(
        backgroundSong.currentTime - SONG_START_TIME
      ) < 0.01
    ) {
      resolve();
      return;
    }

    let done = false;

    const finish = () => {
      if (done) return;

      done = true;

      backgroundSong.removeEventListener(
        "seeked",
        finish
      );

      resolve();
    };

    backgroundSong.addEventListener(
      "seeked",
      finish,
      { once: true }
    );

    try {
      backgroundSong.currentTime =
        SONG_START_TIME;
    } catch (error) {
      console.warn(
        "Audio seek failed:",
        error
      );

      finish();
    }

    setTimeout(finish, 1500);
  });
}


async function startSong() {
  try {

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
     * Seek BEFORE play.
     */
    await seekTo43();

    await backgroundSong.play();

  } catch (error) {

    console.warn(
      "Audio playback failed:",
      error
    );

  }
}


/*
 * Restart from 00:43 after the song ends.
 */
backgroundSong.addEventListener(
  "ended",
  async () => {

    try {

      backgroundSong.pause();

      backgroundSong.currentTime =
        SONG_START_TIME;

      await seekTo43();

      await backgroundSong.play();

    } catch (error) {

      console.warn(
        "Audio restart failed:",
        error
      );

    }

  }
);


/* =========================================================
   PLAY SONG
========================================================= */

playSongBtn.addEventListener(
  "click",
  () => {

    if (playSongBtn.disabled) return;

    playSongBtn.disabled = true;

    /*
     * Audio cannot block the UI.
     */
    startSong();

    musicIntro.classList.add(
      "intro-hidden"
    );

    mainPage.classList.add(
      "main-visible"
    );

    mainPage.setAttribute(
      "aria-hidden",
      "false"
    );

    setTimeout(() => {

      musicIntro.style.display =
        "none";

    }, 650);

  }
);


/* =========================================================
   GET REAL VISIBLE VIEWPORT
========================================================= */

function getViewport() {

  if (window.visualViewport) {

    return {

      width:
        window.visualViewport.width,

      height:
        window.visualViewport.height

    };

  }

  return {

    width:
      document.documentElement.clientWidth ||
      window.innerWidth,

    height:
      document.documentElement.clientHeight ||
      window.innerHeight

  };

}


/* =========================================================
   MOVE NO BUTTON
========================================================= */

function moveNoButton(event) {

  if (event) {

    event.preventDefault();
    event.stopPropagation();

  }

  if (yesClicked || noMoving) {
    return;
  }

  const now = Date.now();

  /*
   * A phone touch can generate multiple events.
   */
  if (now - lastNoMove < 180) {
    return;
  }

  lastNoMove = now;

  noMoving = true;


  /* -------------------------------------------------------
     Current dimensions
  ------------------------------------------------------- */

  const noRect =
    noBtn.getBoundingClientRect();

  const yesRect =
    yesBtn.getBoundingClientRect();


  const buttonWidth =
    noRect.width;

  const buttonHeight =
    noRect.height;


  /* -------------------------------------------------------
     Viewport
  ------------------------------------------------------- */

  const viewport =
    getViewport();


  /*
   * Safe edge distance.
   */
  const edge =
    Math.max(
      12,
      Math.min(
        24,
        viewport.width * 0.04
      )
    );


  /*
   * These are the ONLY legal coordinates.
   */
  const minX =
    edge;

  const maxX =
    Math.max(
      minX,
      viewport.width -
      buttonWidth -
      edge
    );


  const minY =
    edge;

  const maxY =
    Math.max(
      minY,
      viewport.height -
      buttonHeight -
      edge
    );


  let x = minX;
  let y = minY;


  /* -------------------------------------------------------
     Find a position away from YES
  ------------------------------------------------------- */

  for (
    let attempt = 0;
    attempt < 100;
    attempt++
  ) {

    const candidateX =
      minX +
      Math.random() *
      Math.max(
        1,
        maxX - minX
      );


    const candidateY =
      minY +
      Math.random() *
      Math.max(
        1,
        maxY - minY
      );


    const candidateRight =
      candidateX +
      buttonWidth;


    const candidateBottom =
      candidateY +
      buttonHeight;


    const gap = 30;


    const overlapsYes =

      candidateX <
        yesRect.right + gap

      &&

      candidateRight >
        yesRect.left - gap

      &&

      candidateY <
        yesRect.bottom + gap

      &&

      candidateBottom >
        yesRect.top - gap;


    x = candidateX;
    y = candidateY;


    if (!overlapsYes) {
      break;
    }

  }


  /* -------------------------------------------------------
     HARD FINAL CLAMP
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
     FIXED VIEWPORT POSITION
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


  setTimeout(() => {

    noMoving = false;

  }, 220);

}


/* =========================================================
   DESKTOP
========================================================= */

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
   MOBILE + TABLET
========================================================= */

noBtn.addEventListener(
  "pointerdown",
  moveNoButton,
  {
    passive: false
  }
);


noBtn.addEventListener(
  "touchstart",
  moveNoButton,
  {
    passive: false
  }
);


/*
 * No NEVER redirects.
 * Clicking it only moves it.
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
   YES
   ONLY YES OPENS RESULT.HTML
========================================================= */

yesBtn.addEventListener(
  "click",
  () => {

    if (yesClicked) return;

    yesClicked = true;


    /*
     * No can no longer move.
     */
    noBtn.style.pointerEvents =
      "none";


    questionContainer.classList.add(
      "question-hidden"
    );


    heartLoader.classList.add(
      "show"
    );


    /*
     * ONLY this action navigates.
     */
    setTimeout(() => {

      window.location.href =
        "./result.html";

    }, 900);

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


if (window.visualViewport) {

  window.visualViewport.addEventListener(
    "resize",
    resetNoButton
  );

}


/* =========================================================
   VIDEO
========================================================= */

document
  .querySelectorAll("video")
  .forEach((video) => {

    video.play().catch(() => {});

  });


/* =========================================================
   KEEP SONG POSITION WHEN MOVING TO RESULT.HTML
========================================================= */

const MUSIC_POSITION_KEY = "debasrita_music_position_43";


/*
 * Save the current song position frequently so result.html
 * can continue from the same point instead of stopping.
 */
setInterval(() => {

  if (
    backgroundSong &&
    !backgroundSong.paused &&
    Number.isFinite(backgroundSong.currentTime)
  ) {

    try {

      localStorage.setItem(
        MUSIC_POSITION_KEY,
        String(backgroundSong.currentTime)
      );

    } catch (error) {
      console.warn("Could not save music position:", error);
    }

  }

}, 250);


/*
 * Save immediately when the page is being left.
 */
window.addEventListener("pagehide", () => {

  if (
    backgroundSong &&
    Number.isFinite(backgroundSong.currentTime)
  ) {

    try {

      localStorage.setItem(
        MUSIC_POSITION_KEY,
        String(backgroundSong.currentTime)
      );

    } catch (error) {
      console.warn("Could not save music position:", error);
    }

  }

});
