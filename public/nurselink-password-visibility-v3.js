(() => {
  const visibility = new Map();

  const eyeOpen = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`;

  const eyeClosed = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 3 18 18"/>
      <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17.8 17.8 0 0 1-2.1 2.8"/>
      <path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 6 10 6a10.7 10.7 0 0 0 4.1-.8"/>
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
    </svg>`;

  function passwordKey(input, index) {
    return input.id ||
      input.name ||
      input.autocomplete ||
      `recovery-password-${index}`;
  }

  function applyState(input, button, visible) {
    input.type = visible ? "text" : "password";
    input.dataset.nlPasswordVisible = String(visible);

    button.innerHTML = visible ? eyeOpen : eyeClosed;
    button.setAttribute(
      "aria-label",
      visible ? "Hide password" : "Show password"
    );
    button.setAttribute("aria-pressed", String(visible));
    button.hidden = input.value.length === 0;
  }

  function enhance() {
    if (!/replace your password/i.test(document.body?.innerText || "")) return;

    const inputs = [...document.querySelectorAll(
      'input[type="password"], input[data-nl-password-visible]'
    )];

    inputs.forEach((input, index) => {
      const key = passwordKey(input, index);
      const savedState = visibility.get(key) ?? false;

      let wrapper = input.closest(".nl-password-field");
      let button = wrapper?.querySelector(".nl-password-eye");

      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.className = "nl-password-field";
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
      }

      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "nl-password-eye";

        button.addEventListener("click", () => {
          const visible = input.type !== "text";
          visibility.set(key, visible);
          applyState(input, button, visible);

          input.focus({preventScroll: true});
          const end = input.value.length;
          input.setSelectionRange?.(end, end);
        });

        wrapper.appendChild(button);
      }

      applyState(input, button, savedState);

      if (input.dataset.nlPersistentEye !== "true") {
        input.dataset.nlPersistentEye = "true";

        input.addEventListener("input", () => {
          const preserveState = () => {
            const visible = visibility.get(key) ?? false;
            applyState(input, button, visible);
          };

          preserveState();
          queueMicrotask(preserveState);
          requestAnimationFrame(preserveState);
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance);
  } else {
    enhance();
  }

  new MutationObserver(enhance).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
