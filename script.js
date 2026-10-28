const scenes = Array.from(document.querySelectorAll("[data-scene]"));
const sceneHeadings = scenes.map((scene) => {
  const heading = scene.querySelector("h1, h2");
  heading.tabIndex = -1;
  return heading;
});
const nextButtons = Array.from(document.querySelectorAll("[data-next]"));
const enterButton = document.querySelector("[data-enter]");
const backButton = document.querySelector("[data-back]");
const restartButton = document.querySelector("[data-restart]");
const progressLabel = document.querySelector("[data-progress]");
const progressFill = document.querySelector("[data-progress-fill]");
const form = document.querySelector("#response-form");
const responseField = document.querySelector("#response");
const formStatus = document.querySelector("#form-status");

const chapterNames = [
  "Opening",
  "The surface",
  "The beginning",
  "The little things",
  "A small confession",
  "It grew",
  "Beneath the calm",
  "The risk",
  "The honest part",
  "Your space",
  "Whenever you’re ready",
];

let currentScene = 0;

function showScene(index, moveFocus = false) {
  currentScene = Math.max(0, Math.min(index, scenes.length - 1));
  scenes.forEach((scene, sceneIndex) => {
    const active = sceneIndex === currentScene;
    scene.hidden = !active;
    scene.classList.toggle("is-active", active);
  });

  backButton.hidden = currentScene === 0;
  nextButtons.forEach((button) => {
    button.hidden = currentScene === 0 || currentScene === scenes.length - 1;
  });

  progressLabel.textContent = chapterNames[currentScene];
  progressFill.style.width = `${(currentScene / (scenes.length - 1)) * 100}%`;
  if (moveFocus) sceneHeadings[currentScene].focus();
}

nextButtons.forEach((button) => {
  button.addEventListener("click", () => showScene(currentScene + 1, true));
});

enterButton.addEventListener("click", () => showScene(currentScene + 1, true));
backButton.addEventListener("click", () => showScene(currentScene - 1, true));
restartButton.addEventListener("click", () => showScene(0, true));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  const endpoint = form.dataset.formspreeEndpoint?.trim();

  if (!responseField.value.trim()) {
    formStatus.textContent = "There’s no message to send. You can leave this blank and continue.";
    return;
  }

  if (!endpoint) {
    formStatus.textContent = "This form isn’t connected yet, so your message hasn’t been sent. Your text is still here.";
    return;
  }

  submitResponse(endpoint);
});

async function submitResponse(endpoint) {
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  formStatus.textContent = "Sending your message…";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });

    if (!response.ok) {
      throw new Error(`Form submission failed with status ${response.status}`);
    }

    form.reset();
    formStatus.textContent = "Your message was sent. Thank you for taking the time.";
  } catch (error) {
    console.error("Could not send the response form.", error);
    formStatus.textContent = "Your message couldn’t be sent. Please try again later; your text is still here.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send privately <span aria-hidden="true">↗</span>';
  }
}

showScene(0);
