
const fss = document.getElementById('fs');

ipcRenderer.on('files', (event, fileArray) => {
  // Create buttons for each file
  fileArray.forEach(file => {
    const button = document.createElement('button');
    button.textContent = file;
    button.addEventListener('click', () => loadFileContent(file));

    // Create a div to hold each button separately
    const buttonWrapper = document.createElement('div');
    buttonWrapper.appendChild(button);

    // Append the button to the fs div
    fss.appendChild(buttonWrapper);
  });
});

function loadFileContent(fileName) {
  // Logic to load file content into textarea
  const textarea = document.getElementById('yourTextareaId');
  // Replace this line with your logic to load file content
  textarea.value = `Content of ${fileName} will be loaded here.`;
}



ipcRenderer.on('more', (event, fileContent) => {
    console.log(fileContent); // Check if you receive the content here

    const textArea = document.getElementById('textArea');
    textArea.value = fileContent; // Use value instead of textContent for textarea
});

