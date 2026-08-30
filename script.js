const musicIntro = document.getElementById("musicIntro");
const playSongBtn = document.getElementById("playSongBtn");
const mainPage = document.getElementById("mainPage");
const backgroundSong = document.getElementById("backgroundSong");

const questionContainer = document.querySelector(".question-container");
const yesBtn = document.querySelector(".js-yes-btn");
const noBtn = document.querySelector(".js-no-btn");
const heartLoader = document.querySelector(".cssload-main");

let moving = false;
let lastMoveTime = 0;


/* =========================================================
   MUSIC INTRO
   User must explicitly press Play because browsers block
   unexpected audio autoplay.
========================================================= */

playSongBtn.addEventListener("click", async () => {

  try {
    await backgroundSong.play();
  } catch (error) {
    console.log("Audio playback was blocked:", error);
  }

  musicIntro.classList.add("intro-hidden");

  mainPage.classList.add("main-visible");
  mainPage.setAttribute("aria-hidden", "false");

  /*
   * Keep the intro completely out of the way after transition.
   */
  setTimeout(() => {
    musicIntro.style.display = "none";
  }, 650);
});


/* =========================================================
   NO BUTTON
   It keeps escaping on the SAME webpage.
========================================================= */

function getViewport() {

  if (window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height,
      left: window.visualViewport.offsetLeft || 0,
      top: window.visualViewport.offsetTop || 0
    };
  }

  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    left: 0,
    top: 0
  };
}


function moveNoButton(event) {

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const now = Date.now();

  if (now - lastMoveTime < 180) return;
  lastMoveTime = now;

  if (moving) return;
  moving = true;

  const buttonRect = noBtn.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();
  const viewport = getViewport();

  const padding = Math.max(
    12,
    Math.min(24, viewport.width * 0.04)
  );

  const minLeft = viewport.left + padding;
  const maxLeft =
    viewport.left +
    viewport.width -
    buttonRect.width -
    padding;

  const minTop = viewport.top + padding;
  const maxTop =
    viewport.top +
    viewport.height -
    buttonRect.height -
    padding;

  let newLeft = minLeft;
  let newTop = minTop;

  let attempts = 0;

  while (attempts < 60) {

    newLeft =
      minLeft +
      Math.random() *
      Math.max(1, maxLeft - minLeft);

    newTop =
      minTop +
      Math.random() *
      Math.max(1, maxTop - minTop);

    const noRight = newLeft + buttonRect.width;
    const noBottom = newTop + buttonRect.height;

    const gap = 25;

    const overlapsYes =
      newLeft < yesRect.right + gap &&
      noRight > yesRect.left - gap &&
      newTop < yesRect.bottom + gap &&
      noBottom > yesRect.top - gap;

    if (!overlapsYes) break;

    attempts++;
  }

  /*
   * Final hard clamp.
   * No button can ever leave the visible screen.
   */
  newLeft = Math.max(
    minLeft,
    Math.min(newLeft, Math.max(minLeft, maxLeft))
  );

  newTop = Math.max(
    minTop,
    Math.min(newTop, Math.max(minTop, maxTop))
  );

  noBtn.style.position = "fixed";
  noBtn.style.left = `${Math.round(newLeft)}px`;
  noBtn.style.top = `${Math.round(newTop)}px`;
  noBtn.style.right = "auto";
  noBtn.style.bottom = "auto";
  noBtn.style.transform = "scale(1.05)";

  setTimeout(() => {
    moving = false;
  }, 220);
}


/* Desktop */
noBtn.addEventListener("pointerenter", (event) => {

  if (event.pointerType === "mouse") {
    moveNoButton(event);
  }

});


/* Mobile + tablet */
noBtn.addEventListener("pointerdown", moveNoButton);


/* Older touch fallback */
noBtn.addEventListener(
  "touchstart",
  moveNoButton,
  { passive: false }
);


/* Final protection */
noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton(event);
});


/* =========================================================
   YES BUTTON
   Same behaviour as before:
   loader -> next webpage
========================================================= */

yesBtn.addEventListener("click", () => {

  questionContainer.classList.add("question-hidden");

  heartLoader.classList.add("show");

  setTimeout(() => {
    window.location.href = "result.html";
  }, 900);

});


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


window.addEventListener("resize", resetNoButton);


if (window.visualViewport) {
  window.visualViewport.addEventListener(
    "resize",
    resetNoButton
  );
}


/* =========================================================
   VIDEO AUTOPLAY
========================================================= */

document.querySelectorAll("video").forEach((video) => {

  video.play().catch(() => {
    // Browser may wait for interaction.
  });

});
