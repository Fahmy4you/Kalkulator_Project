const htmlParent = document.querySelector('html');
const darkText = document.querySelector('#dark');
const lightText = document.querySelector('#light');
const secondToggleButton = document.querySelector('.second-toggle');
const secondButtons = document.querySelectorAll('.second');

const secondMap = {
    'sin': 'cosec',
    'cos': 'sec',
    'tan': 'cot',
    'cosec': 'sin',
    'sec': 'cos',
    'cot': 'tan',
    'sinh': 'cosech',
    'cosh': 'sech',
    'tanh': 'coth',
    'cosech' : 'sinh',
    'sech': 'cosh',
    'coth': 'tanh',
}

let secondMode = localStorage.getItem('secondMode') == 'true';

function applySecondMode() {
    secondButtons.forEach(btn => {
        const text = btn.innerText.toLowerCase();
        if(secondMap[text]) {
            btn.innerText = secondMap[text]
        }
    });
}

if(secondMode) {
    secondToggleButton.classList.add('active');
    applySecondMode();
}

secondToggleButton.addEventListener('click', () => {
    secondMode = !secondMode;
    console.log(secondMode)
    localStorage.setItem('secondMode', secondMode);
    secondToggleButton.classList.toggle('active');
    applySecondMode();
})

document.querySelector("#modecolor").addEventListener('click', () => {
    htmlParent.classList.toggle('dark')
    if(localStorage.getItem('modecolor') == "light") {
        localStorage.setItem('modecolor', 'dark')
        darkText.style.display = 'none';
        lightText.style.display = 'block';
    } else {
        darkText.style.display = 'block';
        lightText.style.display = 'none';
        localStorage.setItem('modecolor', 'light')
    }
});

if(localStorage.getItem('modecolor') == "light") {
    htmlParent.classList.add('light')
    darkText.style.display = 'block';
    lightText.style.display = 'none';
} else {
    darkText.style.display = 'none';
    lightText.style.display = 'block';
    htmlParent.classList.add('dark')
}