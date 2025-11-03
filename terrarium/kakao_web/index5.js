let zCounter = 10;

document.addEventListener('DOMContentLoaded', (event) => {
    const plants = [
        'plant1', 'plant2', 'plant3', 'plant4', 'plant5', 'plant6',
        'plant7', 'plant8', 'plant9', 'plant10', 'plant11', 'plant12',
        'plant13', 'plant14'
    ];

    plants.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('dragstart', dragStart);

            setDoubleClick(el);
        }
    });

    document.addEventListener('dragover', dragOver);
    document.addEventListener('drop', drop);
});

function dragStart(e) {
    zCounter++;
    e.target.style.zIndex = zCounter;
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.setData('text/offset-x', e.offsetX);
    e.dataTransfer.setData('text/offset-y', e.offsetY);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const offsetX = e.dataTransfer.getData('text/offset-x');
    const offsetY = e.dataTransfer.getData('text/offset-y');
    
    const el = document.getElementById(id);

    if (el) {
        document.body.appendChild(el);
        el.style.left = (e.clientX - offsetX) + 'px';
        el.style.top = (e.clientY - offsetY) + 'px';
    }
}


function bringToTop(e) {
    zCounter++;
    e.currentTarget.style.zIndex = zCounter;
}

function setDoubleClick(el) {
    el.addEventListener('dblclick', bringToTop);
}