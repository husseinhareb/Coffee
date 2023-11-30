const { ipcRenderer } = require('electron');

let path = '';
let hostname = '';
let username = '';

const root = document.getElementById('root');

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
  const outputString = `${path}\n${hostname}@${username} ~>`;

  const container = document.createElement('div');
  container.appendChild(document.createTextNode(outputString));

  const inputElement = document.createElement('input');
  inputElement.setAttribute('type', 'text');
  inputElement.setAttribute('id', 'userInput');

  // Listen for keypress event on the input field
  inputElement.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      const userInput = e.target.value.trim(); // Get the input value

      // Send the userInput value to the main process
      ipcRenderer.send('userInput', userInput);

      // Clear the input field after sending the value
      e.target.value = '';
    }
  });

  container.appendChild(inputElement);

  const outputElement = document.getElementById('root');
  outputElement.innerHTML = '';
  outputElement.appendChild(container);
}

// Call updateOutput() to initialize the interface
updateOutput();
ipcRenderer.on('executionResult', (event, result) => {
  const outputElement = document.createElement("div");
  outputElement.textContent = result;
  
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.appendChild(outputElement);
    console.log(result);

    // Assuming path, hostname, and username are defined elsewhere
    const outputString = `${path}\n${hostname}@${username} ~>`;

    // Create container div
    const container = document.createElement('div');
    container.textContent = outputString;

    // Append container to rootElement or any other desired parent element
    rootElement.appendChild(container);

    // Create an input element
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = 'Enter text here';
    container.appendChild(inputElement);

    // Listen for keypress event on the input field
    inputElement.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        const userInput = e.target.value.trim(); // Get the input value

        // Send the userInput value to the main process
        ipcRenderer.send('userInput', userInput);

        // Clear the input field after sending the value
        e.target.value = '';
      }
    });
  } else {
    console.error("Element with id 'root' not found.");
  }
});

