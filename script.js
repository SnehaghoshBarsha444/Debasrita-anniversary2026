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

/*
 * EXACT song starting point:
 * 00:00:43.000
 */
const SONG_START_TIME = 43.000;

let moving = false;
let lastMoveTime = 0;


/* =========================================================
   PRECISE AUDIO SEEK
========================================================= */

/*
 * IMPORTANT:
 * We do NOT simply set currentTime and immediately call play().
 *
 * Browser audio seeking is asynchronous. We first pause,
 * request 43.000 seconds, WAIT for the seek to complete,
 * then start playback.
 */
function seekSongToStart() {

  return new Promise((resolve, reject) => {

    const audio = backgroundSong;

    if (!audio) {
      reject(new Error("Audio element not found."));
      return;
    }

    const finish = () => {
      cleanup();
      resolve();
    };

    const fail = () => {
      cleanup();
      reject(new Error("Audio seek failed."));
    };

    const cleanup = () => {
      audio.removeEventListener("seeked", finish);
      audio.removeEventListener("error", fail);
    };

    /*
     * If the browser reports that the desired position
     * has already been reached, accept it.
     */
    if (
      Math.abs(
        audio.currentTime - SONG_START_TIME
      ) < 0.01
    ) {
      finish();
      return;
    }

    audio.addEventListener("seeked", finish, {
      once: true
    });

    audio.addEventListener("error", fail, {
      once: true
    });

    /*
     * Pause BEFORE seeking.
     */
    audio.pause();

    /*
     * Set the exact requested timestamp.
     */
    audio.currentTime = SONG_START_TIME;
  });

}


/* =========================================================
   START SONG FROM EXACT 00:43
========================================================= */

async function startSong() {

  try {

    /*
     * Make sure metadata is available.
     */
    if (backgroundSong.readyState < 1) {

      await new Promise((resolve, reject) => {

        const onMetadata = () => {
          cleanup();
          resolve();
        };

        const onError = () => {
          cleanup();
          reject(
            new Error("Could not load audio metadata.")
          );
        };

        const cleanup = () => {
          backgroundSong.removeEventListener(
            "loadedmetadata",
            onMetadata
          );

          backgroundSong.removeEventListener(
            "error",
            onError
          );
        };

        backgroundSong.addEventListener(
          "loadedmetadata",
          onMetadata,
          { once: true }
        );

        backgroundSong.addEventListener(
          "error",
          onError,
          { once: true }
        );

      });

    }


    /*
     * Seek FIRST.
     * Do not play before seek completes.
     */
    await seekSongToStart();


    /*
     * Start playback only AFTER the browser
     * has completed the seek.
     */
    await backgroundSong.play();

  } catch (error) {

    console.error(
      "Could not start song from 00:43:",
      error
    );

  }

}


/* =========================================================
   LOOP FROM 00:43
========================================================= */

/*
 * Native audio loop is intentionally NOT used.
 *
 * When the song ends, seek back to 43.000 seconds,
 * wait for seek completion, then play again.
 */
backgroundSong.addEventListener("ended", async () => {

  try {

    await seekSongToStart();

    await backgroundSong.play();

  } catch (error) {

    console.error(
      "Could not restart song from 00:43:",
      error
    );

  }

});


/* =========================================================
   PLAY BUTTON
========================================================= */

playSongBtn.addEventListener("click", async () => {

  /*
   * Disable the button temporarily so a double tap
   * cannot create multiple playback requests.
   */
  playSongBtn.disabled = true;

  playSongBtn.style.pointerEvents = "none";


  /*
   * Start exactly at 00:43.
   */
  await startSong();


  /*
   * Only after the audio playback request has succeeded,
   * transition to the main page.
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

});


/* =========================================================
   VIEWPORT
========================================================= */

function getViewport() {

  if (window.visualViewport) {

    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height,
      left:
        window.visualViewport.offsetLeft || 0,
      top:
        window.visualViewport.offsetTop || 0
    };

  }

  return {
    width:
      document.documentElement.clientWidth,
    height:
      document.documentElement.clientHeight,
    left: 0,
    top: 0
  };

}


/* =========================================================
   NO BUTTON
========================================================= */

function moveNoButton(event) {

  if (event) {

    event.preventDefault();
    event.stopPropagation();

  }


  const now = Date.now();

  if (now - lastMoveTime < 180) {
    return;
  }

  lastMoveTime = now;


  if (moving) {
    return;
  }

  moving = true;


  const buttonRect =
    noBtn.getBoundingClientRect();

  const yesRect =
    yesBtn.getBoundingClientRect();

  const viewport =
    getViewport();


  const buttonWidth =
    buttonRect.width;

  const buttonHeight =
    buttonRect.height;


  const padding =
    Math.max(
      12,
      Math.min(
        24,
        viewport.width * 0.04
      )
    );


  const minLeft =
    viewport.left + padding;

  const maxLeft =
    viewport.left +
    viewport.width -
    buttonWidth -
    padding;


  const minTop =
    viewport.top + padding;

  const maxTop =
    viewport.top +
    viewport.height -
    buttonHeight -
    padding;


  const safeMinLeft =
    Math.min(minLeft, maxLeft);

  const safeMaxLeft =
    Math.max(minLeft, maxLeft);

  const safeMinTop =
    Math.min(minTop, maxTop);

  const safeMaxTop =
    Math.max(minTop, maxTop);


  let newLeft =
    safeMinLeft;

  let newTop =
    safeMinTop;


  let attempts = 0;


  while (attempts < 60) {

    newLeft =
      safeMinLeft +
      Math.random() *
      Math.max(
        1,
        safeMaxLeft - safeMinLeft
      );


    newTop =
      safeMinTop +
      Math.random() *
      Math.max(
        1,
        safeMaxTop - safeMinTop
      );


    const noRight =
      newLeft + buttonWidth;

    const noBottom =
      newTop + buttonHeight;


    const gap = 25;


    const overlapsYes =
      newLeft <
        yesRect.right + gap
      &&
      noRight >
        yesRect.left - gap
      &&
      newTop <
        yesRect.bottom + gap
      &&
      noBottom >
        yesRect.top - gap;


    if (!overlapsYes) {
      break;
    }


    attempts++;

  }


  /*
   * Final hard boundary protection.
   */
  newLeft =
    Math.max(
      safeMinLeft,
      Math.min(
        newLeft,
        safeMaxLeft
      )
    );


  newTop =
    Math.max(
      safeMinTop,
      Math.min(
        newTop,
        safeMaxTop
      )
    );


  noBtn.style.position =
    "fixed";

  noBtn.style.left =
    `${Math.round(newLeft)}px`;

  noBtn.style.top =
    `${Math.round(newTop)}px`;

  noBtn.style.right =
    "auto";

  noBtn.style.bottom =
    "auto";

  noBtn.style.transform =
    "scale(1.05)";


  setTimeout(() => {

    moving = false;

  }, 220);

}


/* =========================================================
   DESKTOP
========================================================= */

noBtn.addEventListener(
  "pointerenter",
  (event) => {

    if (event.pointerType === "mouse") {
      moveNoButton(event);
    }

  }
);


/* =========================================================
   MOBILE / TABLET
========================================================= */

noBtn.addEventListener(
  "pointerdown",
  moveNoButton
);


noBtn.addEventListener(
  "touchstart",
  moveNoButton,
  {
    passive: false
  }
);


noBtn.addEventListener(
  "click",
  (event) => {

    event.preventDefault();

    moveNoButton(event);

  }
);


/* =========================================================
   PHONE ROTATION / RESIZE
========================================================= */

function resetNoButton() {

  noBtn.style.position = "";
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.right = "";
  noBtn.style.bottom = "";
  noBtn.style.transform = "";

  moving = false;

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
   VIDEO AUTOPLAY
========================================================= */

document
  .querySelectorAll("video")
  .forEach((video) => {

    video.play().catch(() => {
      // Browser may wait for interaction.
    });

  });
