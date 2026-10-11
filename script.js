/* =====================================================
   script.js  |  Nitin Rajpoot portfolio
   Small jobs, in order:
   1. Footer year
   2. Animations on/off switch
   3. Mobile menu
   4. Highlight the menu link of the section you are viewing
   5. Scroll reveal (sections animate in as you scroll)
   6. Scroll progress line
   7. Typing effect in the hero
   8. Hero panel tilts toward your mouse
   9. Glow that follows your mouse inside project cards
   ===================================================== */

const root = document.documentElement;

// True when animations are switched on (the class "motion" is on <html>)
function motionOn() {
  return root.classList.contains("motion");
}


/* ---------- 1. FOOTER YEAR ---------- */
document.getElementById("year").textContent = new Date().getFullYear();


/* ---------- 2. ANIMATIONS SWITCH ----------
   The small script in index.html picked a starting mode. This button lets you change it.
   Your choice is saved in the browser (localStorage), so it is remembered next time. */
const motionButton = document.querySelector(".motion-toggle");

function setMotion(on) {
  root.classList.toggle("motion", on);
  root.classList.toggle("no-motion", !on);
  motionButton.setAttribute("aria-pressed", String(on));
  try {
    localStorage.setItem("motion", on ? "on" : "off");
  } catch (error) {
    // Saving can fail in private mode. That is fine: the switch still works.
  }
}

motionButton.setAttribute("aria-pressed", String(motionOn()));
motionButton.addEventListener("click", function () {
  setMotion(!motionOn());
});


/* ---------- 3. MOBILE MENU ---------- */
const toggleButton = document.querySelector(".nav-toggle");
const menu = document.getElementById("nav-menu");

function setMenu(open) {
  menu.classList.toggle("is-open", open);                    // CSS shows the menu when this class is present
  toggleButton.setAttribute("aria-expanded", String(open));  // tells screen readers the menu state
}

toggleButton.addEventListener("click", function () {
  const isOpen = toggleButton.getAttribute("aria-expanded") === "true";
  setMenu(!isOpen);
});

// Click a link inside the menu: close the menu
menu.addEventListener("click", function (event) {
  if (event.target.closest("a")) {
    setMenu(false);
  }
});

// Press Escape: close the menu and return focus to the button
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && menu.classList.contains("is-open")) {
    setMenu(false);
    toggleButton.focus();
  }
});


/* ---------- 4. HIGHLIGHT THE CURRENT SECTION ----------
   IntersectionObserver tells us when a section crosses a thin band
   near the middle of the screen. Then we mark the matching menu link. */
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

const sectionObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      navLinks.forEach(function (link) {
        if (link.getAttribute("href") === "#" + entry.target.id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach(function (section) {
  sectionObserver.observe(section);
});


/* ---------- 5. SCROLL REVEAL ----------
   Elements fade and slide up the first time they scroll into view.
   The animation itself is written in style.css (section 9d). */

// The elements that should animate in. Add a CSS selector here to animate more things.
const revealTargets = document.querySelectorAll(
  ".section:not(.hero) .section-title, .prose, .facts, .skill-group, .project, .edu, .empty, .section:not(.hero) .actions"
);

revealTargets.forEach(function (element) {
  element.classList.add("reveal");

  // Cards in a row (skills, projects) appear one after another, 120ms apart
  if (element.matches(".skill-group, .project")) {
    const position = Array.from(element.parentElement.children).indexOf(element);
    element.style.setProperty("--d", position * 120 + "ms");
  }
});

// Tags inside a group pop in one by one: give each tag a number (0, 1, 2 ...)
document.querySelectorAll(".chips").forEach(function (list) {
  Array.from(list.children).forEach(function (tag, index) {
    tag.style.setProperty("--n", index);
  });
});

// Watch each element and add "is-visible" when 15% of it is on screen
const revealObserver = new IntersectionObserver(
  function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);   // animate only once
      }
    });
  },
  { threshold: 0.15 }
);

revealTargets.forEach(function (element) {
  revealObserver.observe(element);
});


/* ---------- 6. SCROLL PROGRESS LINE ----------
   Works out how far down the page you are (0 = top, 1 = bottom)
   and gives that number to the CSS as --progress. */
const progressBar = document.querySelector(".scroll-progress");

function updateProgress() {
  const scrollable = root.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.setProperty("--progress", progress.toFixed(3));
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();


/* ---------- 7. TYPING EFFECT ----------
   Types each role, waits, deletes it, then types the next one.
   When animations are off, the full sentence from index.html is shown instead. */
const roles = ["Java Backend Developer", "Spring Boot Developer", "Full Stack Developer"];
const typedText = document.querySelector(".typed");
const staticText = typedText.textContent;   // the fallback sentence written in index.html

let roleIndex = 0;      // which role we are on
let letterCount = 0;    // how many letters are showing
let deleting = false;   // are we typing or deleting?

function typeStep() {
  if (!motionOn()) {
    typedText.textContent = staticText;     // animations off: show the plain sentence
    setTimeout(typeStep, 500);              // check again in half a second
    return;
  }

  const role = roles[roleIndex];

  if (!deleting) {
    letterCount++;
    typedText.textContent = role.slice(0, letterCount);
    if (letterCount === role.length) {
      deleting = true;
      setTimeout(typeStep, 1600);           // pause when a role is fully typed
      return;
    }
    setTimeout(typeStep, 70);
  } else {
    letterCount--;
    typedText.textContent = role.slice(0, letterCount);
    if (letterCount === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;   // next role, back to the first after the last
      setTimeout(typeStep, 350);
      return;
    }
    setTimeout(typeStep, 35);
  }
}

setTimeout(typeStep, 1800);   // wait until the hero animation has played

// If animations are on at the start, clear the fallback text so typing can begin cleanly
if (motionOn()) {
  typedText.textContent = "";
}


/* ---------- 8. HERO PANEL TILT ----------
   Only for devices with a mouse. The panel leans toward the pointer. */
const tilt = document.getElementById("tilt");

if (tilt && window.matchMedia("(pointer: fine)").matches) {
  tilt.addEventListener("pointermove", function (event) {
    if (!motionOn()) return;
    const box = tilt.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;    // -0.5 (left) to 0.5 (right)
    const y = (event.clientY - box.top) / box.height - 0.5;     // -0.5 (top) to 0.5 (bottom)
    tilt.style.setProperty("--tilt-x", (x * 8).toFixed(2) + "deg");
    tilt.style.setProperty("--tilt-y", (-y * 8).toFixed(2) + "deg");
  });

  tilt.addEventListener("pointerleave", function () {
    tilt.style.setProperty("--tilt-x", "0deg");
    tilt.style.setProperty("--tilt-y", "0deg");
  });
}


/* ---------- 9. CARD GLOW FOLLOWS THE MOUSE ----------
   Saves the mouse position inside the card as --mx and --my.
   The CSS uses those two numbers to place a soft glow. */
document.querySelectorAll(".project:not(.project-placeholder)").forEach(function (card) {
  card.addEventListener("pointermove", function (event) {
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", event.clientX - box.left + "px");
    card.style.setProperty("--my", event.clientY - box.top + "px");
  });
});
