const intro = document.getElementById("musicIntro");
const playBtn = document.getElementById("playSongBtn");
const mainPage = document.getElementById("mainPage");
const song = document.getElementById("backgroundSong");

const question = document.querySelector(".question-container");
const yesBtn = document.querySelector(".yes-btn");
const noBtn = document.querySelector(".no-btn");
const loader = document.getElementById("heartLoader");

const START = 43;
const POSITION_KEY = "debnit-anniversary-ishq-position";

let yesClicked = false;
let moving = false;
let lastMove = 0;

async function seekAndPlay(audio, time) {
  try {
    await new Promise(resolve => {
      if (audio.readyState >= 1) return resolve();
      audio.addEventListener("loadedmetadata", resolve, { once: true });
      setTimeout(resolve, 2000);
    });

    audio.currentTime = Math.max(START, Number(time) || START);

    await new Promise(resolve => {
      const done = () => {
        audio.removeEventListener("seeked", done);
        resolve();
      };
      audio.addEventListener("seeked", done, { once: true });
      setTimeout(done, 1200);
    });

    await audio.play();
  } catch (error) {
    console.warn("Music playback blocked/unavailable:", error);
  }
}

playBtn.addEventListener("click", () => {
  if (playBtn.disabled) return;

  playBtn.disabled = true;

  seekAndPlay(song, START);

  intro.classList.add("hidden");
  mainPage.classList.add("visible");
  mainPage.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    intro.style.display = "none";
  }, 550);
});

/* Save the exact playback position for result.html. */
setInterval(() => {
  if (song && !song.paused && Number.isFinite(song.currentTime)) {
    localStorage.setItem(POSITION_KEY, String(song.currentTime));
  }
}, 200);

song.addEventListener("ended", async () => {
  song.currentTime = START;
  await seekAndPlay(song, START);
});


/* =========================
   NO BUTTON
========================= */

function viewport() {
  if (window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height
    };
  }

  return {
    width: document.documentElement.clientWidth || window.innerWidth,
    height: document.documentElement.clientHeight || window.innerHeight
  };
}

function moveNo(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (yesClicked || moving) return;

  const now = Date.now();

  if (now - lastMove < 180) return;

  lastMove = now;
  moving = true;

  const v = viewport();
  const r = noBtn.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();

  const padding = Math.max(
    10,
    Math.min(20, v.width * 0.035)
  );

  const minX = padding;
  const maxX = Math.max(
    minX,
    v.width - r.width - padding
  );

  const minY = padding;
  const maxY = Math.max(
    minY,
    v.height - r.height - padding
  );

  let x = minX;
  let y = minY;

  for (let i = 0; i < 100; i++) {
    const testX =
      minX +
      Math.random() *
      Math.max(1, maxX - minX);

    const testY =
      minY +
      Math.random() *
      Math.max(1, maxY - minY);

    const gap = 28;

    const collision =
      testX < yes.right + gap &&
      testX + r.width > yes.left - gap &&
      testY < yes.bottom + gap &&
      testY + r.height > yes.top - gap;

    x = testX;
    y = testY;

    if (!collision) break;
  }

  x = Math.max(minX, Math.min(x, maxX));
  y = Math.max(minY, Math.min(y, maxY));

  noBtn.style.position = "fixed";
  noBtn.style.left = `${Math.round(x)}px`;
  noBtn.style.top = `${Math.round(y)}px`;
  noBtn.style.right = "auto";
  noBtn.style.bottom = "auto";
  noBtn.style.margin = "0";
  noBtn.style.transform = "scale(1.05)";

  setTimeout(() => {
    moving = false;
  }, 220);
}

noBtn.addEventListener("pointerenter", event => {
  if (event.pointerType === "mouse") moveNo(event);
});

noBtn.addEventListener(
  "pointerdown",
  moveNo,
  { passive: false }
);

noBtn.addEventListener(
  "touchstart",
  moveNo,
  { passive: false }
);

noBtn.addEventListener("click", event => {
  event.preventDefault();
  event.stopPropagation();
  moveNo(event);
});


/* =========================
   YES ONLY -> RESULT
========================= */

yesBtn.addEventListener("click", () => {
  if (yesClicked) return;

  yesClicked = true;

  noBtn.style.pointerEvents = "none";

  if (song && Number.isFinite(song.currentTime)) {
    localStorage.setItem(
      POSITION_KEY,
      String(song.currentTime)
    );
  }

  question.classList.add("hide");
  loader.classList.add("show");

  setTimeout(() => {
    window.location.href = "./result.html";
  }, 800);
});

window.addEventListener("resize", () => {
  if (yesClicked) return;

  noBtn.style.position = "";
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.right = "";
  noBtn.style.bottom = "";
  noBtn.style.margin = "";
  noBtn.style.transform = "";

  moving = false;
});

document.querySelectorAll("video").forEach(video => {
  video.play().catch(() => {});
});
