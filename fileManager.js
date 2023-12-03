
const fss = document.getElementById('fs');

ipcRenderer.on('files', (event, output) => {
    console.log(output);
  fss.innerHTML = output; // Directly set the innerHTML in the event listener
});


