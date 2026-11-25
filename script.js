
// =========================================
// MOBILE AND IPAD NAVIGATION
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".links");

  if (!nav || !menuToggle || !navLinks) return;

  nav.classList.add("menu-ready");

  function closeMenu() {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  // Close when selecting a page
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  // Close when tapping outside the menu
  document.addEventListener("click", event => {
    if (!nav.contains(event.target)) {
      closeMenu();
    }
  });

  // Close when pressing Escape
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  // Reset when switching to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      closeMenu();
    }
  });
});

"use strict";

function initializeCalculator() {

  const form = document.getElementById("calculator");

  // Do not initialize on other pages
  if (!form) return;

  const result = document.getElementById("result");
  const process = document.getElementById("process");
  const calculateBtn = document.getElementById("calculateBtn");

  const inputs = {
    V: document.getElementById("voltage"),
    I: document.getElementById("current"),
    R: document.getElementById("resistance")
  };

  const quantities = {
    V: { name: "Voltage", unit: "V" },
    I: { name: "Current", unit: "A" },
    R: { name: "Resistance", unit: "Ω" }
  };

  if (
    !result ||
    !process ||
    Object.values(inputs).some(input => !input)
  ) {
    console.error("Missing calculator HTML elements.");
    return;
  }

  // Identify the selected unknown quantity
  function getUnknown() {
    return form.querySelector(
      'input[name="unknown"]:checked'
    )?.value;
  }

  // Format numerical answers
  function format(value) {
    if (!Number.isFinite(value)) {
      return "Undefined";
    }

    return Number(value.toPrecision(6)).toString();
  }

  // Display error messages
  function showError(message) {
    const unknown = getUnknown();

    if (inputs[unknown]) {
      inputs[unknown].value = "";
    }

    result.textContent = message;
    result.className = "error";
    process.textContent = "Unable to calculate.";
  }

  // Clear previous results
  function clearResults() {
    process.textContent =
      "Enter two values to see the calculation steps.";

    result.textContent =
      "Your answer will appear here.";

    result.className = "";
  }

  // Main calculation function
  function calculate(event) {

    if (event) {
      event.preventDefault();
    }

    const unknown = getUnknown();

    if (!unknown || !inputs[unknown]) {
      showError("Please select a quantity.");
      return;
    }

    const known = Object.keys(inputs).filter(
      key => key !== unknown
    );

    const values = {};

    for (const key of known) {

      const raw = inputs[key].value.trim();

      if (raw === "") {
        inputs[unknown].value = "";
        clearResults();
        return;
      }

      values[key] = Number(raw);

      if (!Number.isFinite(values[key])) {
        showError("Please enter valid numbers.");
        return;
      }

    }

    // Resistance validation
    if ("R" in values && values.R < 0) {
      showError("Resistance cannot be negative.");
      return;
    }

    let answer;
    let formula;
    let substitution;

    switch (unknown) {

      // Calculate voltage
      case "V":

        answer = values.I * values.R;

        formula = "V = I × R";

        substitution =
          `V = ${format(values.I)} × ${format(values.R)}`;

        break;

      // Calculate current
      case "I":

        if (values.R === 0) {
          showError("Cannot divide by zero resistance.");
          return;
        }

        answer = values.V / values.R;

        formula = "I = V ÷ R";

        substitution =
          `I = ${format(values.V)} ÷ ${format(values.R)}`;

        break;

      // Calculate resistance
      case "R":

        if (values.I === 0) {
          showError("Cannot divide by zero current.");
          return;
        }

        answer = values.V / values.I;

        formula = "R = V ÷ I";

        substitution =
          `R = ${format(values.V)} ÷ ${format(values.I)}`;

        break;

    }

    // Validate the calculated answer
    if (!Number.isFinite(answer)) {
      showError("The calculated result is too large.");
      return;
    }

    if (unknown === "R" && answer < 0) {
      showError("Calculated resistance cannot be negative.");
      return;
    }

    const formatted = format(answer);
    const { name, unit } = quantities[unknown];

    // Display answer inside the disabled input
    inputs[unknown].value = formatted;

    // Display calculation process
    process.replaceChildren();

    const steps = [
      `Step 1: Identify the formula: ${formula}`,
      `Step 2: Substitute the values: ${substitution}`,
      `Step 3: Calculate: ${formatted} ${unit}`
    ];

    steps.forEach(step => {

      const paragraph = document.createElement("p");

      paragraph.textContent = step;

      process.appendChild(paragraph);

    });

    // Display final answer
    result.textContent =
      `${name} = ${formatted} ${unit}`;

    result.className = "success";

  }

  // Update input fields
  function updateFields() {

    const unknown = getUnknown();

    if (!unknown || !inputs[unknown]) {
      showError("Please select a quantity.");
      return;
    }

    for (const [key, input] of Object.entries(inputs)) {

      input.disabled = key === unknown;
      input.required = key !== unknown;
      input.value = "";

      input.placeholder = key === unknown
        ? "Calculated automatically"
        : `Enter ${quantities[key].name.toLowerCase()}`;

    }

    clearResults();

  }

  // Automatic calculations
  Object.values(inputs).forEach(input => {

    input.addEventListener("input", calculate);

  });

  // Calculate button
  if (calculateBtn) {

    calculateBtn.addEventListener("click", calculate);

  }

  // Calculate when pressing Enter
  form.addEventListener("submit", calculate);

  // Update selected quantity
  form.querySelectorAll(
    'input[name="unknown"]'
  ).forEach(radio => {

    radio.addEventListener("change", updateFields);

  });

  // Reset calculator
  form.addEventListener("reset", event => {

    event.preventDefault();

    updateFields();

  });

  // Initialize calculator
  updateFields();

}

// Start when the page is ready
if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initializeCalculator
  );

} else {

  initializeCalculator();

}
