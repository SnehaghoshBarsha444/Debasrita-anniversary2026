const intro =
  document.getElementById("musicIntro");

const playBtn =
  document.getElementById("playSongBtn");

const mainPage =
  document.getElementById("mainPage");

const song =
  document.getElementById("backgroundSong");

const question =
  document.querySelector(".question-container");

const yesBtn =
  document.getElementById("yesBtn");

const noBtn =
  document.getElementById("noBtn");

const loader =
  document.getElementById("heartLoader");


const START_TIME = 43;

const POSITION_KEY =
  "debnit-anniversary-ishq-position";


let yesClicked = false;
let noMoving = false;
let lastMove = 0;


/* =========================================================
   MAIN MUSIC
========================================================= */

async function playFromTime(audio, time) {

  try {

    await new Promise(resolve => {

      if (audio.readyState >= 1) {
        resolve();
        return;
      }

      audio.addEventListener(
        "loadedmetadata",
        resolve,
        { once: true }
      );

      setTimeout(resolve, 2000);

    });


    audio.currentTime =
      Math.max(
        START_TIME,
        Number(time) || START_TIME
      );


    await new Promise(resolve => {

      const done = () => {

        audio.removeEventListener(
          "seeked",
          done
        );

        resolve();

      };

      audio.addEventListener(
        "seeked",
        done,
        { once: true }
      );

      setTimeout(done, 1200);

    });


    await audio.play();

  } catch (error) {

    console.warn(
      "Main music could not play:",
      error
    );

  }

}


playBtn.addEventListener(
  "click",
  () => {

    if (playBtn.disabled) {
      return;
    }

    playBtn.disabled = true;

    /*
     * User gesture starts the audio.
     */
    playFromTime(
      song,
      START_TIME
    );


    intro.classList.add("hidden");

    mainPage.classList.add("visible");

    mainPage.setAttribute(
      "aria-hidden",
      "false"
    );


    setTimeout(() => {

      intro.style.display =
        "none";

    }, 550);

  }
);


/*
 * Save playback position continuously.
 */
setInterval(() => {

  if (
    song &&
    !song.paused &&
    Number.isFinite(song.currentTime)
  ) {

    localStorage.setItem(
      POSITION_KEY,
      String(song.currentTime)
    );

  }

}, 200);


/*
 * Loop Ishq Bulaava from 00:43.
 */
song.addEventListener(
  "ended",
  () => {

    song.currentTime =
      START_TIME;

    playFromTime(
      song,
      START_TIME
    );

  }
);


/* =========================================================
   NO BUTTON
========================================================= */

function getViewport() {

  /*
   * clientWidth/clientHeight are used because the button
   * uses position: fixed.
   */
  return {

    width:
      document.documentElement.clientWidth ||
      window.innerWidth,

    height:
      document.documentElement.clientHeight ||
      window.innerHeight

  };

}


function moveNoButton(event) {

  if (event) {

    event.preventDefault();
    event.stopPropagation();

  }


  if (
    yesClicked ||
    noMoving
  ) {

    return;

  }


  const now =
    Date.now();


  if (
    now - lastMove < 160
  ) {

    return;

  }


  lastMove =
    now;

  noMoving =
    true;


  const v =
    getViewport();


  const noRect =
    noBtn.getBoundingClientRect();


  const yesRect =
    yesBtn.getBoundingClientRect();


  /*
   * Safe distance from every edge.
   */
  const padding =
    Math.max(
      10,
      Math.min(
        22,
        v.width * 0.035
      )
    );


  /*
   * HARD viewport limits.
   */
  const minX =
    padding;

  const maxX =
    Math.max(
      minX,
      v.width -
      noRect.width -
      padding
    );


  const minY =
    padding;

  const maxY =
    Math.max(
      minY,
      v.height -
      noRect.height -
      padding
    );


  let finalX =
    minX;

  let finalY =
    minY;


  /*
   * Find a position which does not overlap Yes.
   */
  for (
    let attempt = 0;
    attempt < 150;
    attempt++
  ) {

    const x =
      minX +
      Math.random() *
      Math.max(
        1,
        maxX - minX
      );


    const y =
      minY +
      Math.random() *
      Math.max(
        1,
        maxY - minY
      );


    const gap =
      35;


    const overlapsYes =

      x <
        yesRect.right + gap

      &&

      x + noRect.width >
        yesRect.left - gap

      &&

      y <
        yesRect.bottom + gap

      &&

      y + noRect.height >
        yesRect.top - gap;


    if (!overlapsYes) {

      finalX =
        x;

      finalY =
        y;

      break;

    }


    /*
     * Valid fallback.
     */
    finalX =
      x;

    finalY =
      y;

  }


  /*
   * FINAL HARD CLAMP.
   *
   * No can never leave the viewport.
   */
  finalX =
    Math.max(
      minX,
      Math.min(
        finalX,
        maxX
      )
    );


  finalY =
    Math.max(
      minY,
      Math.min(
        finalY,
        maxY
      )
    );


  noBtn.style.position =
    "fixed";

  noBtn.style.left =
    `${Math.round(finalX)}px`;

  noBtn.style.top =
    `${Math.round(finalY)}px`;

  noBtn.style.right =
    "auto";

  noBtn.style.bottom =
    "auto";

  noBtn.style.margin =
    "0";

  noBtn.style.transform =
    "scale(1.05)";


  setTimeout(() => {

    noMoving =
      false;

  }, 200);

}


/*
 * DESKTOP:
 * Move when mouse approaches No.
 */
noBtn.addEventListener(
  "pointerenter",
  event => {

    if (
      event.pointerType === "mouse"
    ) {

      moveNoButton(event);

    }

  }
);


/*
 * MOBILE:
 * One touch = one escape.
 */
noBtn.addEventListener(
  "pointerdown",
  event => {

    if (
      event.pointerType === "touch" ||
      event.pointerType === "pen"
    ) {

      moveNoButton(event);

    }

  },
  {
    passive: false
  }
);


/*
 * Older mobile browser fallback.
 *
 * There is deliberately NO click handler on No.
 */
noBtn.addEventListener(
  "touchstart",
  moveNoButton,
  {
    passive: false
  }
);


/* =========================================================
   YES
========================================================= */

yesBtn.addEventListener(
  "click",
  event => {

    event.preventDefault();
    event.stopPropagation();


    if (yesClicked) {
      return;
    }


    yesClicked =
      true;


    noBtn.style.pointerEvents =
      "none";


    /*
     * Save music position immediately.
     */
    if (
      song &&
      Number.isFinite(
        song.currentTime
      )
    ) {

      localStorage.setItem(
        POSITION_KEY,
        String(
          song.currentTime
        )
      );

    }


    question.classList.add("hide");

    loader.classList.add("show");


    /*
     * ONLY YES can navigate.
     */
    setTimeout(() => {

      window.location.assign(
        "./result.html"
      );

    }, 650);

  }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    if (yesClicked) {
      return;
    }


    noBtn.style.position = "";
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.style.right = "";
    noBtn.style.bottom = "";
    noBtn.style.margin = "";
    noBtn.style.transform = "";


    noMoving =
      false;

  }
);


/* =========================================================
   VIDEO
========================================================= */

document
  .querySelectorAll("video")
  .forEach(video => {

    video.play().catch(() => {});

  });
