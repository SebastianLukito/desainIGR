const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const clearButton = document.getElementById('clear');
const equalsButton = document.getElementById('equals');

let currentInput = '';
let operator = '';
let result = '';

buttons.forEach(button =>{
    button.addEventListener('click', () =>
    handleButtonClick(button.innerText))
})

clearButton.addEventListener('click', clearDisplay);

equalsButton.addEventListener('click', performCalculation);

// Event listener for keyboard input
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key >= '0' && key <= '9') {
        handleButtonClick(key);
    } else if (key === '.') {
        handleButtonClick(key);
    } else if (key === 'Backspace') {
        handleButtonClick('←');
    } else if (key === 'Enter' || key === '=') {
        performCalculation();
    } else if (key === '+') {
        handleButtonClick('+');
    } else if (key === '-') {
        handleButtonClick('-');
    } else if (key === '*') {
        handleButtonClick('x');
    } else if (key === '/') {
        handleButtonClick('/');
    } else if (key === 'Escape') {
        clearDisplay();
    }
});

function handleButtonClick(value){
    if(value>= '0' && value <='9'){
        currentInput += value;
    }
    else if(value === '.' && !currentInput.includes('.')){
        currentInput += value;
    }
    else if(value === 'C'){
        clearDisplay();
    }
    else if(value === '←'){
        currentInput = currentInput.substring(0, currentInput.length - 1);
    }
    else if(value === '='){
        performCalculation();
        operator = '';
    }
    else {
        if (currentInput !== '') {
            if (operator !== '') {
                performCalculation();
            } else {
                result = currentInput;
            }
            operator = value;
            currentInput = '';
        }
    }
    display.value = `${result} ${operator} ${currentInput}`;

}

function performCalculation() {
    if (currentInput !== '') {
        if (operator === '+'){
            result = (parseFloat(result) + parseFloat(currentInput)).toString();
        } else if (operator === '-'){
            result = (parseFloat(result) - parseFloat(currentInput)).toString();
        } else if (operator === 'x'){
            result = (parseFloat(result) * parseFloat(currentInput)).toString();
        } else if (operator === '/'){
            result = (parseFloat(result) / parseFloat(currentInput)).toString();
        } else {
            result = currentInput;
        }
    }
    currentInput = '';
    operator = '';
    display.value = result;
}

function clearDisplay() {
    currentInput = '';
    operator = '';
    result = '';
    display.value = '0';
}
