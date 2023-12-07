
const autoCompletion = document.getElementById('textArea');

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



