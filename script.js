const questionContainer = document.querySelector(".question-container");
const yesBtn = document.querySelector(".js-yes-btn");
const noBtn = document.querySelector(".js-no-btn");
const heartLoader = document.querySelector(".cssload-main");

let moving = false;
let lastMoveTime = 0;


/* =========================================================
   YES BUTTON
   ========================================================= */

yesBtn.addEventListener("click", () => {
  if (moving) return;

  questionContainer.classList.add("question-hidden");
  heartLoader.classList.add("show");

  setTimeout(() => {
    window.location.href = "result.html";
  }, 900);
});


/* =========================================================
   GET REAL MOBILE VIEWPORT
   ========================================================= */

function getViewport() {
  const viewport = window.visualViewport;

  if (viewport) {
    return {
      width: viewport.width,
      height: viewport.height,
      offsetLeft: viewport.offsetLeft || 0,
      offsetTop: viewport.offsetTop || 0
    };
  }

  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    offsetLeft: 0,
    offsetTop: 0
  };
}


/* =========================================================
   MOVE NO BUTTON
   ALWAYS KEEP IT INSIDE PHONE SCREEN
   ========================================================= */

function moveNoButton(event) {

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const now = Date.now();

  /*
   * Prevent touchstart + pointerdown + click
   * from triggering multiple movements at once.
   */
  if (now - lastMoveTime < 180) {
    return;
  }

  lastMoveTime = now;

  if (moving) {
    return;
  }

  moving = true;


  /* -------------------------------------------------------
     Measure the button
  ------------------------------------------------------- */

  const buttonRect = noBtn.getBoundingClientRect();

  const buttonWidth = buttonRect.width;
  const buttonHeight = buttonRect.height;


  /* -------------------------------------------------------
     Get REAL visible viewport
  ------------------------------------------------------- */

  const viewport = getViewport();

  const viewportWidth = viewport.width;
  const viewportHeight = viewport.height;

  const viewportLeft = viewport.offsetLeft;
  const viewportTop = viewport.offsetTop;


  /* -------------------------------------------------------
     Safe distance from phone edges
  ------------------------------------------------------- */

  const horizontalPadding =
    Math.max(12, Math.min(24, viewportWidth * 0.04));

  const verticalPadding =
    Math.max(12, Math.min(24, viewportHeight * 0.035));


  /* -------------------------------------------------------
     Calculate absolutely safe boundaries
  ------------------------------------------------------- */

  const minLeft =
    viewportLeft + horizontalPadding;

  const maxLeft =
    viewportLeft +
    viewportWidth -
    buttonWidth -
    horizontalPadding;

  const minTop =
    viewportTop + verticalPadding;

  const maxTop =
    viewportTop +
    viewportHeight -
    buttonHeight -
    verticalPadding;


  /* -------------------------------------------------------
     Make sure boundaries are valid
  ------------------------------------------------------- */

  const safeMinLeft = Math.min(minLeft, maxLeft);
  const safeMaxLeft = Math.max(minLeft, maxLeft);

  const safeMinTop = Math.min(minTop, maxTop);
  const safeMaxTop = Math.max(minTop, maxTop);


  /* -------------------------------------------------------
     Get Yes button position
     So No doesn't land directly on Yes
  ------------------------------------------------------- */

  const yesRect = yesBtn.getBoundingClientRect();

  let newLeft = 0;
  let newTop = 0;

  let attempts = 0;

  while (attempts < 50) {

    newLeft =
      safeMinLeft +
      Math.random() *
      Math.max(1, safeMaxLeft - safeMinLeft);

    newTop =
      safeMinTop +
      Math.random() *
      Math.max(1, safeMaxTop - safeMinTop);


    const noRight =
      newLeft + buttonWidth;

    const noBottom =
      newTop + buttonHeight;


    /*
     * Extra gap around Yes button
     */
    const gap = 20;


    const overlapsYes =
      newLeft < yesRect.right + gap &&
      noRight > yesRect.left - gap &&
      newTop < yesRect.bottom + gap &&
      noBottom > yesRect.top - gap;


    if (!overlapsYes) {
      break;
    }

    attempts++;
  }


  /* -------------------------------------------------------
     FINAL HARD CLAMP
     This is the important part.
     The button can NEVER go outside the viewport.
  ------------------------------------------------------- */

  newLeft = Math.max(
    safeMinLeft,
    Math.min(newLeft, safeMaxLeft)
  );

  newTop = Math.max(
    safeMinTop,
    Math.min(newTop, safeMaxTop)
  );


  /* -------------------------------------------------------
     Apply fixed viewport position
  ------------------------------------------------------- */

  noBtn.style.position = "fixed";

  noBtn.style.left = `${Math.round(newLeft)}px`;
  noBtn.style.top = `${Math.round(newTop)}px`;

  noBtn.style.right = "auto";
  noBtn.style.bottom = "auto";

  noBtn.style.transform = "scale(1.05)";


  /* -------------------------------------------------------
     Release movement lock
  ------------------------------------------------------- */

  setTimeout(() => {
    moving = false;
  }, 220);
}


/* =========================================================
   DESKTOP MOUSE
   Move before mouse can click
   ========================================================= */

noBtn.addEventListener("pointerenter", (event) => {

  if (event.pointerType === "mouse") {
    moveNoButton(event);
  }

});


/* =========================================================
   MOBILE TOUCH
   ========================================================= */

noBtn.addEventListener(
  "pointerdown",
  moveNoButton
);


/*
 * Older mobile browser fallback
 */
noBtn.addEventListener(
  "touchstart",
  moveNoButton,
  {
    passive: false
  }
);


/*
 * Extra protection
 */
noBtn.addEventListener("click", (event) => {

  event.preventDefault();

  moveNoButton(event);

});


/* =========================================================
   RESET AFTER PHONE ROTATION / RESIZE
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


/*
 * Normal browser resize
 */
window.addEventListener(
  "resize",
  resetNoButton
);


/*
 * Mobile visual viewport resize
 * Handles address bar appearing/disappearing.
 */
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
    /*
     * Some browsers wait for user interaction.
     */
  });

});
