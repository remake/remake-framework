export default function initEventListenerHelpers() {
  // helper: prevent default
  document.addEventListener("click", event => {
    if (event.target.closest("[prevent-default]")) {
      event.preventDefault();
    }
  });
}
