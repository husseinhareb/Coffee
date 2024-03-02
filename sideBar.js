const sideBar = document.getElementById('sideBar');
const folder = document.createElement('button');

let fsVisibility = true;

fetch('./symbols.json')
  .then(response => response.json())
  .then(data => {
    folder.innerHTML = data['sideFolder'];
  })
  .catch(error => console.log('Error fetching data:', error));

folder.className = 'folder';
folder.title = 'Workspace';
folder.style.borderLeft = 'solid 2px #959cbd';

folder.addEventListener('click', () => {
  const fs = document.getElementById('fs');
  if (fsVisibility) {
    folder.style.borderLeft = 'solid 0px';
    fs.style.width = '0px';
    fs.style.borderWidth = '0px';
  } else {
    folder.style.borderLeft = 'solid 2px #959cbd';
    fs.style.width = '200px';
    fs.style.borderWidth = '3px';
  }
  fsVisibility = !fsVisibility;
});

// Append button to sidebar
sideBar.appendChild(folder);
