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
        scrollToBottom(); // Scroll to the bottom after command input
      }
    });

    scrollToBottom(); // Scroll to the bottom after appending output
  } else {
    console.error("Element with id 'terminal' not found.");
  }
});


function scrollToBottom() {
  const terminalElement = document.getElementById('terminal');
  terminalElement.scrollTop = terminalElement.scrollHeight;
}





const autoCompletion = document.getElementById('editor');

const pairs = [
  { open: '{', close: '}' },
  { open: '"', close: '"' },
  { open: '<', close: '>' },
  { open: "'", close: "'" },
  { open: '[', close: ']' },
  { open: '(', close: ')' },


];

autoCompletion.addEventListener('input', function(event) {
  const cursorPosition = this.selectionStart;
  const inputValue = this.value;
  const insertedChar = event.data;

  pairs.forEach(pair => {
    if (insertedChar === pair.open) {
      const newText = inputValue.substring(0, cursorPosition) + pair.close + inputValue.substring(cursorPosition);
      this.value = newText;
      this.selectionStart = cursorPosition;
      this.selectionEnd = cursorPosition;
    }
  });
});


const tabOver = document.getElementById('editor');

tabOver.addEventListener('keydown', function(event) {
  if (event.key === 'Tab') {
    event.preventDefault(); // Prevent default tab behavior
    const cursorPosition = this.selectionStart;
    const textBeforeCursor = this.value.substring(0, cursorPosition);
    const textAfterCursor = this.value.substring(cursorPosition);
    const newText = textBeforeCursor + '   ' + textAfterCursor; // Three spaces

    this.value = newText;
    this.selectionStart = cursorPosition + 3; // Move cursor three positions forward
    this.selectionEnd = cursorPosition + 3;
  }
});


