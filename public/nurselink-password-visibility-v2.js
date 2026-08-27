(() => {
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

  function enhance() {
    const pageText = document.body?.innerText || "";
    if (!/replace your password/i.test(pageText)) return;

    document.querySelectorAll('input[type="password"]').forEach((input) => {
      if (input.dataset.nlEyeToggle === "true") return;
      input.dataset.nlEyeToggle = "true";

      const wrapper = document.createElement("div");
      wrapper.className = "nl-password-field";
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "nl-password-eye";
      button.innerHTML = eyeClosed;
      button.hidden = input.value.length === 0;
      button.setAttribute("aria-label", "Show password");
      button.setAttribute("aria-pressed", "false");

      const updateVisibility = () => {
        button.hidden = input.value.length === 0;
      };

      input.addEventListener("input", updateVisibility);
      input.addEventListener("change", updateVisibility);

      button.addEventListener("click", () => {
        const willShow = input.type === "password";

        input.type = willShow ? "text" : "password";
        button.innerHTML = willShow ? eyeOpen : eyeClosed;
        button.setAttribute(
          "aria-label",
          willShow ? "Hide password" : "Show password"
        );
        button.setAttribute("aria-pressed", String(willShow));

        input.focus({preventScroll: true});
        const end = input.value.length;
        input.setSelectionRange?.(end, end);
      });

      wrapper.appendChild(button);
      updateVisibility();
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
