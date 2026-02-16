let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

// Magic variables
let magicMode = false;
let equalPressCount = 0;
let magicClickCount = 0;
let magicBaseValue = 0;

function updateDisplay() {
    const display = document.querySelector('.display');
    display.textContent = displayValue;
}

function appendNumber(number) {
    resetEqualSequence(); // Interaction breaks the sequence of =
    if (waitingForSecondOperand) {
        displayValue = number;
        waitingForSecondOperand = false;
    } else {
        displayValue = displayValue === '0' ? number : displayValue + number;
    }
    updateDisplay();
}

function appendDecimal() {
    resetEqualSequence();
    if (waitingForSecondOperand) {
        displayValue = '0.';
        waitingForSecondOperand = false;
        updateDisplay();
        return;
    }

    if (!displayValue.includes('.')) {
        displayValue += '.';
        updateDisplay();
    }
}

function handleOperator(nextOperator) {
    resetEqualSequence();
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        return;
    }

    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (operator) {
        const result = performCalculation(operator, firstOperand, inputValue);
        displayValue = String(result);
        firstOperand = result;
        updateDisplay();
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
}

function performCalculation(op, first, second) {
    if (op === '+') return first + second;
    if (op === '-') return first - second;
    if (op === '*') return first * second;
    if (op === '/') return first / second;
    return second;
}

function calculate() {
    // Standard logic first
    let inputValue = parseFloat(displayValue);

    if (operator && firstOperand !== null) {
        const result = performCalculation(operator, firstOperand, inputValue);
        displayValue = String(result);
        firstOperand = result;
        operator = null;
        waitingForSecondOperand = false;
        updateDisplay();
    }

    // Magic Trigger Check
    equalPressCount++;
    if (equalPressCount === 2) {
        magicMode = true;
        // The value on screen is the "triggerResult"
        magicBaseValue = parseFloat(displayValue);

        // Reset click count.
        // We set to -1 because the current click event (on the equal button)
        // will bubble up to the document listener immediately after this,
        // incrementing it to 0.
        magicClickCount = -1;

        console.log("Magic Mode Activated. Base: " + magicBaseValue);
    }
}

function handleClear() {
    resetEqualSequence();
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    updateDisplay();
}

function handleNegate() {
    resetEqualSequence();
    displayValue = String(parseFloat(displayValue) * -1);
    updateDisplay();
}

function handlePercent() {
    resetEqualSequence();
    displayValue = String(parseFloat(displayValue) / 100);
    updateDisplay();
}

function resetEqualSequence() {
    // Resets the consecutive equal press count.
    // Does NOT reset magicMode once activated.
    equalPressCount = 0;
}

// Magic Logic - Global Click Listener
document.addEventListener('click', () => {
    if (magicMode) {
        magicClickCount++;
        console.log("Magic Click Count:", magicClickCount);

        if (magicClickCount >= 7) {
            triggerMagicEffect();
        }
    }
});

function triggerMagicEffect() {
    const p = calculateP();
    const result = p - magicBaseValue;
    displayValue = String(result);
    updateDisplay();
}

function calculateP() {
    let now = new Date();

    // Check seconds
    if (now.getSeconds() >= 30) {
        // Next minute
        now = new Date(now.getTime() + 60000);
    }

    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');

    // p is MMDDhhmm
    const pString = `${month}${day}${hour}${minute}`;
    return parseInt(pString, 10);
}

// Global scope binding
window.appendNumber = appendNumber;
window.appendDecimal = appendDecimal;
window.handleOperator = handleOperator;
window.calculate = calculate;
window.handleClear = handleClear;
window.handleNegate = handleNegate;
window.handlePercent = handlePercent;
