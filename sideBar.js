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
settings.title = 'Settings';
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
settings.addEventListener('click', settingsWindow);


let settingsWindowVisible = false; 

function settingsWindow(){
  if (!settingsWindowVisible) {
    var settingsWindow = document.createElement('div');
    settingsWindow.className = 'settingsWindow';
    sideBar.appendChild(settingsWindow);
  } else {
    var settingsWindow = document.querySelector('.settingsWindow');
    settingsWindow.parentNode.removeChild(settingsWindow);
  }
  
  settingsWindowVisible = !settingsWindowVisible;
}

sideBar.appendChild(folder);
sideBar.appendChild(settings);