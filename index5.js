let topZIndex = 2;
let zCounter = 10;

document.addEventListener('DOMContentLoaded', (event) => {
  const plants = [
    'plant1', 'plant2', 'plant3', 'plant4', 'plant5', 'plant6',
    'plant7', 'plant8', 'plant9', 'plant10', 'plant11', 'plant12',
    'plant13', 'plant14'
  ];

  plants.forEach(id => {
    const el = document.getElementById(id);
    dragElement(el);       
    setDoubleClick(el);    
  });
});


function dragElement(el) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  let dragging = false;

  el.addEventListener('pointerdown', startDrag);

  function startDrag(e) {
    dragging = true;
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.addEventListener('pointermove', onDrag);
    document.addEventListener('pointerup', stopDrag);
    zCounter ++;
    e.currentTarget.style.zIndex = zCounter;
  }

  function onDrag(e) {
    if (!dragging) return;
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    el.style.top = el.offsetTop - pos2 + 'px';
    el.style.left = el.offsetLeft - pos1 + 'px';
  }

  function stopDrag() {
    dragging = false;
    document.removeEventListener('pointermove', onDrag);
    document.removeEventListener('pointerup', stopDrag);
    zCounter ++;
    e.currentTarget.style.zIndex = zCounter;
  }
}


function bringToTop(e) {
  zCounter ++;
  e.currentTarget.style.zIndex = zCounter;
}

function setDoubleClick(el) {
  el.addEventListener('dblclick', bringToTop);
}
