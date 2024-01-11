const ipc = require("electron").ipcRenderer;
const term = new Terminal({
    theme: {
        background: '#1f2335',
        fontFamily: "JetBrainsMono Nerd Font",
    },

});

term.open(document.getElementById('terminal'));

term.resize(80, 14);

ipc.on("terminal.incomingData", (event, data) => {
    term.write(data);
});

term.onData(e => {
    ipc.send("terminal.keystroke", e);
});



const terminal = document.getElementById('terminal');
let isResizingHeight = false;
let startY, startHeight;

function handleMouseHeightMove(e) {
  if (!isResizingHeight) return;

  const newHeight = startHeight - (e.clientY - startY);
  terminal.style.height = newHeight + 'px';
  terminal.style.borderTop = "5px solid #29355a";
}
let hoverTimeout;

terminal.addEventListener('mousemove', (e) => {
  const isNearTopEdge = e.offsetY < 6;
  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    terminal.style.transition = "border-top 0.5s ease";
    terminal.style.borderTop = isNearTopEdge ? "5px solid #29355a" : "3px solid #1b1e2e";
  }, 300);
  terminal.style.cursor = isNearTopEdge ? "row-resize" : "default";
});

terminal.addEventListener('mouseleave', () => {
  clearTimeout(hoverTimeout);

  terminal.style.transition = "border-top 0.5s ease"; 
  terminal.style.borderTop = "3px solid #1b1e2e";

  setTimeout(() => {
    terminal.style.transition = "none";
  }, 300);
});


terminal.addEventListener('mousedown', (e) => {
  const isNearTopEdge = e.offsetY < 6;
  if (isNearTopEdge) {
    isResizingHeight = true;
    startY = e.clientY;
    startHeight = terminal.offsetHeight; 
    document.addEventListener('mousemove', handleMouseHeightMove);
  }
});

document.addEventListener('mouseup', () => {
  isResizingHeight = false;
  document.removeEventListener('mousemove', handleMouseHeightMove);
  terminal.style.borderTop = "3px solid #1b1e2e";
});