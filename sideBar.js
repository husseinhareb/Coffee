const sideBar = document.getElementById('sideBar');
const settings = document.createElement('button');
const folder = document.createElement('button');

let fsVisibility = true; 

fetch('./symbols.json')
  .then(response => response.json())
  .then(data => {
    settings.innerHTML = data['settingsSymbol'];
    folder.innerHTML = data['sideFolder'];
  })
  .catch(error => console.log('Error fetching data:', error));

settings.className = 'settings';
folder.className = 'folder';

folder.addEventListener('click', () => {
  const fs = document.getElementById('fs');
  if (fsVisibility) {
    fs.style.width = '0px'; 
    fs.style.borderWidth = '0px';
  } else {
    fs.style.width = '200px';
    fs.style.borderWidth = '3px';
  }
  fsVisibility = !fsVisibility; 
});

sideBar.appendChild(folder);
sideBar.appendChild(settings);
