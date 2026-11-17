
"use strict";

function initializeCalculator() {
  const form = document.getElementById("calculator");
  const result = document.getElementById("result");
  const process = document.getElementById("process");

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

  if (!form || !result || !process ||
      Object.values(inputs).some(input => !input)) {
    console.error("Missing calculator HTML elements.");
    return;
  }

  function getUnknown() {
    return document.querySelector(
      'input[name="unknown"]:checked'
    )?.value;
  }

  function format(value) {
    if (!Number.isFinite(value)) return "Undefined";
    return Number(value.toPrecision(6)).toString();
  }

  function showError(message) {
    result.textContent = message;
    result.className = "error";
    process.textContent = "Unable to calculate.";
  }

  function clearResults() {
    process.textContent = "Enter two values to see the steps.";
    result.textContent = "Your answer will appear here.";
    result.className = "";
  }

  function calculate(event) {
    if (event) event.preventDefault();

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

    if ("R" in values && values.R < 0) {
      showError("Resistance cannot be negative.");
      return;
    }

    let answer;
    let formula;
    let substitution;

    switch (unknown) {
      case "V":
        answer = values.I * values.R;
        formula = "V = I × R";
        substitution =
          `V = ${format(values.I)} × ${format(values.R)}`;
        break;

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

    inputs[unknown].value = formatted;

    // Show the steps without injecting HTML
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

    result.textContent = `${name} = ${formatted} ${unit}`;
    result.className = "success";
  }

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

  // Calculate automatically when values change
  Object.values(inputs).forEach(input => {
    input.addEventListener("input", calculate);
  });

  // Calculate when the button is clicked
  form.addEventListener("submit", calculate);

  // Update when the selected quantity changes
  document.querySelectorAll(
    'input[name="unknown"]'
  ).forEach(radio => {
    radio.addEventListener("change", updateFields);
  });

  // Reset the calculator
  form.addEventListener("reset", event => {
    event.preventDefault();
    updateFields();
  });

  updateFields();
}

// Works whether the script loads before or after the HTML
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeCalculator
  );
} else {
  initializeCalculator();
}
