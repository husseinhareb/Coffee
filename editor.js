var keywords = ["INT", "FLOAT", "DOUBLE", "LONG", "BOOL", "VOID", "STRUCTURE"];
var controlKeywords = ["IF", "ELSE", "WHILE","FOR","DO","ELIF"]; // New set of keywords
var stdio = ["PRINTF","SCANF","INPUT","PRINT","ECHO"]
document.querySelector('#editor').addEventListener('keyup', e => {
    if (e.keyCode == 32) {
        var newHTML = "";
        var str = e.target.innerText;
        var encodedStr = str.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Encode < and > to HTML entities
        var allKeywords = [...keywords, ...controlKeywords]; // Combine all keywords

        var chunks = encodedStr.split(new RegExp(
            allKeywords
                .map(w => `(${w})`)
                .join('|'), 'i'))
            .filter(Boolean);

        var markup = chunks.reduce((acc, chunk) => {
            var chunkLower = chunk.toUpperCase(); // Convert chunk to uppercase for comparison
            if (keywords.includes(chunkLower)) {
                acc += `<span class="datatypes">${chunk}</span>`;
            } else if (controlKeywords.includes(chunkLower)) {
                acc += `<span class="control">${chunk}</span>`;
            } else if (stdio.includes(chunkLower)) {
                acc += `<span class="stdio">${chunk}</span>`;
            } else {
                acc += `<span class="others">${chunk}</span>`;
            }
            return acc;
        }, '');

        e.target.innerHTML = markup;

        var child = e.target.children;
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(child[child.length - 1], 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        e.target.focus();
    }
});
