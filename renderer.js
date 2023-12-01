const { ipcRenderer } = require('electron');

let path = '';
let hostname = '';
let username = '';

const terminal = document.getElementById('terminal');

ipcRenderer.on('path', (event, output) => {
  path = output;
  updateOutput();
});

ipcRenderer.on('hostname', (event, output) => {
  hostname = output;
  updateOutput();
});

ipcRenderer.on('username', (event, output) => {
  username = output;
  updateOutput();
});

function updateOutput() {
  const outputString = `${path}<br>${hostname}@${username} ~>`;
  const container = document.createElement('div');
  container.innerHTML = outputString; // Use innerHTML instead of textContent

  const inputElement = document.createElement('input');
  inputElement.setAttribute('type', 'text');
  inputElement.setAttribute('id', 'userInput');

  // Listen for keypress event on the input field
  inputElement.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      const userInput = e.target.value.trim(); // Get the input value

      // Send the userInput value to the main process
      ipcRenderer.send('userInput', userInput);

      e.target.disabled = true; // Disable the input field after user input

    }
  });

  container.appendChild(inputElement);
  container.addEventListener('mouseenter', function () {
    inputElement.focus();
  });
  
  const outputElement = document.getElementById('terminal');
  outputElement.innerHTML = '';
  outputElement.appendChild(container);
}

// Call updateOutput() to initialize the interface
updateOutput();


ipcRenderer.on('executionResult', (event, result) => {
  
  const outputElement = document.createElement('div');
  outputElement.innerHTML = result;

  const terminalElement = document.getElementById('terminal');
  if (terminalElement) {
    terminalElement.appendChild(outputElement);
    console.log(result);

    const outputString = `${path}<br>${hostname}@${username} ~>`;

    const container = document.createElement('div');
    container.innerHTML = outputString;
    terminalElement.appendChild(container);

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = 'Enter text here';
    container.appendChild(inputElement);

    inputElement.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        const userInput = e.target.value.trim();
        ipcRenderer.send('userInput', userInput);

        e.target.disabled = true; // Disable the input field after user input
      }
    });
  } else {
    console.error("Element with id 'terminal' not found.");
  }
});

