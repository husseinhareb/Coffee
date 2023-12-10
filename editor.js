const autoCompletion = document.getElementById('textArea');
const textArea = document.getElementById('textArea');

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
      const newText =
        inputValue.substring(0, cursorPosition) +
        pair.close +
        inputValue.substring(cursorPosition);
      this.value = newText;
      this.selectionStart = cursorPosition + 1;
      this.selectionEnd = cursorPosition + 1;
    }
  });
});

textArea.addEventListener('input', function() {
  const keywords = ['int', 'float', 'double', 'bool', 'long']; // Keywords to highlight
  const cursorPosition = this.selectionStart;

  let start = cursorPosition - 1;
  while (start >= 0 && /\w/.test(this.value[start])) {
    start--;
  }
  start++;

  let end = cursorPosition;
  while (end < this.value.length && /\w/.test(this.value[end])) {
    end++;
  }

  const word = this.value.substring(start, end);

  keywords.forEach(keyword => {
    const regExp = new RegExp('\\b' + keyword + '\\b', 'g');
    const matches = this.value.match(regExp);
    if (matches && matches.includes(word)) {
      const newHTML = this.value.replace(regExp, '<span class="highlight">$&</span>');
      this.value = newHTML;
    }
  });
});

