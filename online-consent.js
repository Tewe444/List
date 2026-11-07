"use strict";

(() => {
  const onlineActions = [
    "#btn-quick-join",
    "#btn-create-confirm",
    "#btn-join-room",
    "#multiplayerBtn",
    "#btnHost",
    "#btnJoin",
    "#btnOnline",
    "#onPublic",
    "#onCreate",
    "#onJoin",
    ".mb.online[data-a='online']",
    "#playOnline",
    "#oPub",
    "#oPriv",
    "#oJoin"
  ].join(",");
  const joinInputs = "#joinCode,#room-input";
  let approved = false;

  function askBeforeOnline(event) {
    if (approved) return true;
    if (!window.confirm("Dieses Feature verbindet dich online mit anderen Spielern. Möchtest du online spielen?")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
    approved = true;
    return true;
  }

  document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target.closest(onlineActions) : null;
    if (target) askBeforeOnline(event);
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key === "Enter" && event.target instanceof Element && event.target.matches(joinInputs)) {
      askBeforeOnline(event);
    }
  }, true);
})();
