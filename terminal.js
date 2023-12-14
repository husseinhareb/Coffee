const ipc = require("electron").ipcRenderer;
const term = new Terminal({
    theme: {
        background: '#1E1E1E',
        fontFamily: "JetBrainsMono Nerd Font",
    },

});

term.open(document.getElementById('terminal'));


ipc.on("terminal.incomingData", (event, data) => {
    term.write(data);
});

term.onData(e => {
    ipc.send("terminal.keystroke", e);
});
