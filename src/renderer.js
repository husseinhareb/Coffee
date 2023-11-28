document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('root');
  const consoleDiv = document.createElement('div');
  consoleDiv.style.fontFamily = 'monospace';
  root.appendChild(consoleDiv);

  function printConsole(prompt) {
    consoleDiv.innerHTML += prompt;
  }

  function processInput(input) {
    if (input.trim() !== '') {
      console.log(input);
    }
    printConsole('<br>>> ');
  }

  printConsole('>>> ');

  let currentInput = '';
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      processInput(currentInput);
      currentInput = '';
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      if (currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
        consoleDiv.innerHTML = consoleDiv.innerHTML.slice(0, -1);
      }
    } else {
      currentInput += event.key;
      if (event.key !== 'Backspace') {
        printConsole(event.key);
      }
    }
  });
});
