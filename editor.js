



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


fs.readFile('keywords.json', 'utf8', (err, jsonData) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }
  try {
    const data = JSON.parse(jsonData);
    console.log(data); // Use the data as needed
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
  }
});


const fss = document.getElementById('fs');

// Define content you want to write
const content = 'This is the content I want to write into the div.';

// Write content into the div using innerHTML
fss.innerHTML = content;