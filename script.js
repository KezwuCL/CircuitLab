
"use strict";

// Wait until the HTML is fully loaded
document.addEventListener("DOMContentLoaded", () => {

  // Get HTML elements
  const form = document.getElementById("calculator");
  const result = document.getElementById("result");

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

  // Check that all required HTML elements exist
  if (!form || !result ||
      Object.values(inputs).some(input => !input)) {
    console.error(
      "Calculator setup error: Missing HTML elements."
    );
    return;
  }

  // Find the quantity the user wants to calculate
  function getUnknown() {
    const selected = document.querySelector(
      'input[name="unknown"]:checked'
    );

    return selected ? selected.value : null;
  }

  // Display messages and results
  function showMessage(message, type = "") {
    result.textContent = message;
    result.className = type;
    result.setAttribute(
      "role",
      type === "error" ? "alert" : "status"
    );
  }

  // Format numbers
  function formatNumber(value) {
    if (!Number.isFinite(value)) {
      return "Undefined";
    }

    if (value === 0) return "0";

    const absolute = Math.abs(value);

    if (absolute >= 1e7 || absolute < 1e-4) {
      return value.toExponential(4);
    }

    return Number(value.toPrecision(6)).toString();
  }

  // Update input fields based on selected quantity
  function updateFields() {
    const unknown = getUnknown();

    if (!unknown || !(unknown in inputs)) {
      showMessage(
        "Please select a quantity to calculate.",
        "error"
      );
      return;
    }

    for (const [key, input] of Object.entries(inputs)) {
      const isUnknown = key === unknown;

      input.disabled = isUnknown;
      input.required = !isUnknown;
      input.value = "";

      input.placeholder = isUnknown
        ? "Calculated automatically"
        : `Enter ${quantities[key].name.toLowerCase()}`;
    }

    showMessage(
      "Enter two values to calculate the third."
    );
  }

  // Read and validate input values
  function readValue(key) {
    const input = inputs[key];
    const raw = input.value.trim();

    if (raw === "") {
      throw new Error(
        `Please enter ${quantities[key].name.toLowerCase()}.`
      );
    }

    const value = Number(raw);

    if (!Number.isFinite(value)) {
      throw new Error(
        `${quantities[key].name} must be a valid number.`
      );
    }

    if (key === "R" && value < 0) {
      throw new Error(
        "Resistance cannot be negative."
      );
    }

    return value;
  }

  // Main calculation function
  function calculate(event) {
    if (event) event.preventDefault();

    const unknown = getUnknown();

    if (!unknown || !(unknown in inputs)) {
      showMessage(
        "Please select a quantity to calculate.",
        "error"
      );
      return;
    }

    try {
      const values = {};

      for (const key of Object.keys(inputs)) {
        if (key !== unknown) {
          values[key] = readValue(key);
        }
      }

      let answer;
      let formula;

      // Ohm's Law formulas
      switch (unknown) {

        case "V":
          // Voltage = Current × Resistance
          answer = values.I * values.R;
          formula = "V = I × R";
          break;

        case "I":
          // Current = Voltage ÷ Resistance
          if (values.R === 0) {
            throw new Error(
              "Cannot calculate current when resistance is zero."
            );
          }

          answer = values.V / values.R;
          formula = "I = V ÷ R";
          break;

        case "R":
          // Resistance = Voltage ÷ Current
          if (values.I === 0) {
            throw new Error(
              "Cannot calculate resistance when current is zero."
            );
          }

          answer = values.V / values.I;
          formula = "R = V ÷ I";
          break;
      }

      // Check the result
      if (!Number.isFinite(answer)) {
        throw new Error(
          "The calculated value is too large."
        );
      }

      if (unknown === "R" && answer < 0) {
        throw new Error(
          "Resistance cannot be negative. Check your values."
        );
      }

      // Display the calculated answer
      const { name, unit } = quantities[unknown];
      const formatted = formatNumber(answer);

      inputs[unknown].value = formatted;

      showMessage(
        `${name} = ${formatted} ${unit} | ${formula}`,
        "success"
      );

    } catch (error) {
      inputs[unknown].value = "";
      showMessage(error.message, "error");
    }
  }

  // Automatically calculate when both values exist
  function autoCalculate() {
    const unknown = getUnknown();

    if (!unknown || !(unknown in inputs)) return;

    const known = Object.keys(inputs).filter(
      key => key !== unknown
    );

    const allFilled = known.every(
      key => inputs[key].value.trim() !== ""
    );

    if (allFilled) {
      calculate();
    } else {
      inputs[unknown].value = "";

      showMessage(
        "Enter two values to calculate the third."
      );
    }
  }

  // Reset calculator
  function resetCalculator() {
    updateFields();
  }

  // Listen for quantity selection changes
  document.querySelectorAll(
    'input[name="unknown"]'
  ).forEach(radio => {
    radio.addEventListener("change", updateFields);
  });

  // Calculate when the button is clicked
  form.addEventListener("submit", calculate);

  // Automatically calculate while typing
  Object.values(inputs).forEach(input => {
    input.addEventListener("input", autoCalculate);
  });

  // Reset button support
  form.addEventListener("reset", event => {
    event.preventDefault();
    resetCalculator();
  });

  // Initialize calculator
  updateFields();

});
