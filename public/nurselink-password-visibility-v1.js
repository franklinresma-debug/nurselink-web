(() => {
  const enhance = () => {
    const pageText = document.body?.innerText || "";
    if (!/replace your password/i.test(pageText)) return;

    document.querySelectorAll('input[type="password"]').forEach((input) => {
      if (input.dataset.nlPasswordToggle) return;
      input.dataset.nlPasswordToggle = "true";

      const wrapper = document.createElement("div");
      wrapper.className = "nl-password-field";
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "nl-password-toggle";
      button.textContent = "Show";
      button.setAttribute("aria-label", "Show password");
      button.setAttribute("aria-pressed", "false");

      button.addEventListener("click", () => {
        const showing = input.type === "text";
        input.type = showing ? "password" : "text";
        button.textContent = showing ? "Show" : "Hide";
        button.setAttribute(
          "aria-label",
          showing ? "Show password" : "Hide password"
        );
        button.setAttribute("aria-pressed", String(!showing));
        input.focus({ preventScroll: true });
      });

      wrapper.appendChild(button);
    });
  };

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
