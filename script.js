const questionContainer = document.querySelector(".question-container");
const yesBtn = document.querySelector(".js-yes-btn");
const noBtn = document.querySelector(".js-no-btn");
const heartLoader = document.querySelector(".cssload-main");

let isMoving = false;
let lastMoveTime = 0;

/*
 * YES
 * Opens the next webpage after a short heart-loader transition.
 */
yesBtn.addEventListener("click", () => {
  if (isMoving) return;

  questionContainer.classList.add("question-hidden");
  heartLoader.classList.add("show");

  window.setTimeout(() => {
    window.location.href = "result.html";
  }, 900);
});


/*
 * NO
 * The button never accepts the "No" answer.
 * It jumps to another safe position on the SAME webpage.
 *
 * Pointer events work for:
 * - desktop mouse
 * - Android touch
 * - iPhone touch
 * - tablets
 */
function moveNoButton(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const now = Date.now();

  // Prevent multiple touch/pointer events from triggering twice.
  if (now - lastMoveTime < 120) return;
  lastMoveTime = now;

  if (isMoving) return;
  isMoving = true;

  const containerRect = questionContainer.getBoundingClientRect();
  const buttonRect = noBtn.getBoundingClientRect();

  const padding = Math.max(10, Math.min(22, window.innerWidth * 0.04));

  /*
   * Keep the button inside the visible viewport.
   * Coordinates are relative to the question container.
   */
  const containerLeft = containerRect.left;
  const containerTop = containerRect.top;

  const minX = padding;
  const maxX = Math.max(
    minX,
    window.innerWidth - buttonRect.width - padding - containerLeft
  );

  const minY = 0;
  const maxY = Math.max(
    minY,
    window.innerHeight - buttonRect.height - padding - containerTop
  );

  /*
   * Avoid placing No directly over Yes.
   */
  const yesRect = yesBtn.getBoundingClientRect();

  let x;
  let y;
  let attempts = 0;

  do {
    x = minX + Math.random() * Math.max(1, maxX - minX);
    y = minY + Math.random() * Math.max(1, maxY - minY);

    attempts++;

    const noLeft = containerLeft + x;
    const noTop = containerTop + y;

    const overlapsYes =
      noLeft < yesRect.right + 20 &&
      noLeft + buttonRect.width > yesRect.left - 20 &&
      noTop < yesRect.bottom + 20 &&
      noTop + buttonRect.height > yesRect.top - 20;

    if (!overlapsYes || attempts >= 30) break;

  } while (true);

  noBtn.style.position = "fixed";
  noBtn.style.left = `${containerLeft + x}px`;
  noBtn.style.top = `${containerTop + y}px`;
  noBtn.style.right = "auto";
  noBtn.style.transform = "scale(1.05)";

  // Re-enable movement after the CSS transition.
  window.setTimeout(() => {
    isMoving = false;
  }, 220);
}


/*
 * Desktop:
 * Move before the cursor can click it.
 */
noBtn.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") {
    moveNoButton(event);
  }
});


/*
 * Mobile:
 * Move when the user tries to touch the button.
 */
noBtn.addEventListener("pointerdown", (event) => {
  moveNoButton(event);
});


/*
 * Extra protection for browsers where pointer events
 * are delayed or unavailable.
 */
noBtn.addEventListener("touchstart", moveNoButton, {
  passive: false
});

noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton(event);
});


/*
 * Reset the No button after viewport resize.
 * This prevents it from becoming stuck outside the screen
 * after rotating a phone.
 */
window.addEventListener("resize", () => {
  noBtn.style.position = "";
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.right = "";
  noBtn.style.transform = "";
});


/*
 * Make sure autoplay works when the page loads.
 */
document.querySelectorAll("video").forEach((video) => {
  video.play().catch(() => {
    // Browser may block autoplay until user interaction.
  });
});
