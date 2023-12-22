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
