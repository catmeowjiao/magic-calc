let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

// Magic variables
let magicMode = false;
let magicClickCount = 0;
let magicBaseValue = 0;

function updateDisplay() {
    const display = document.querySelector('.display');
    display.textContent = displayValue;
}

function appendNumber(number) {
    if (magicMode) {
        // If magic mode is active, input might interfere with count logic?
        // But clicking number buttons triggers global listener.
        // Let's just allow normal append unless it violates constraints.
        // The magic reveal will overwrite this anyway.
    }

    if (waitingForSecondOperand) {
        displayValue = number;
        waitingForSecondOperand = false;
    } else {
        if (displayValue === '0') {
            displayValue = number;
        } else {
            // Check length constraint (max 5 digits)
            if (displayValue.length >= 5) {
                return; // Ignore
            }
            displayValue = displayValue + number;
        }
    }
    updateDisplay();
}

function appendDecimal() {
    // Constraint: No decimals allowed.
    return;
}

function handleOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        return;
    }

    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (operator) {
        const result = performCalculation(operator, firstOperand, inputValue);

        // Constraint Check
        if (!isValidResult(result)) {
            // Ignore operation - do not update firstOperand or displayValue
            return;
        }

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

function isValidResult(result) {
    // Constraints:
    // 1. Not negative
    if (result < 0) return false;

    // 2. Not decimal (is integer)
    if (!Number.isInteger(result)) return false;

    // 3. Not > 5 digits (Max 99999)
    if (result > 99999) return false;

    return true;
}

function calculate() {
    let inputValue = parseFloat(displayValue);
    let potentialResult = inputValue;

    if (operator && firstOperand !== null) {
        potentialResult = performCalculation(operator, firstOperand, inputValue);

        if (isValidResult(potentialResult)) {
            displayValue = String(potentialResult);
            firstOperand = potentialResult;
            operator = null;
            waitingForSecondOperand = false;
            updateDisplay();
        } else {
            // Invalid result. Ignore the calculation?
            // "Any such operation ignored".
            // So the display doesn't update.
            // But what about magic mode?
            // If the calculation is invalid (e.g. 5 digits + 1),
            // the display stays at "99999" (first operand? or input?).
            // If we are waitingForSecondOperand, display is showing second operand.
            // If we hit '=', and calc is invalid, nothing happens.
            // The display shows `inputValue`.
            potentialResult = inputValue;
        }
    }

    // Trigger Magic Mode Check
    // "Change to click equal once".
    // So ANY click on equal triggers magic mode?
    // "Once screen be pressed... 7 times... automatically change... to p - result".
    // Does it matter if the calculation was valid?
    // Probably yes, usually magic tricks rely on a valid looking state.
    // If user types 99999 + 1 =, nothing happens. They might think it's broken.
    // But if they type 1+1=, it shows 2. Then taps 7 times.
    // Let's assume ANY equal press activates it, using whatever is on display as base.

    if (!magicMode) {
        magicMode = true;
        magicBaseValue = parseFloat(displayValue);
        magicClickCount = -1; // Current click bubbles to document listener
        console.log("Magic Mode Activated. Base: " + magicBaseValue);
    }
}

function handleClear() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;

    // Reset magic mode?
    magicMode = false;
    magicClickCount = 0;

    updateDisplay();
}

function handleNegate() {
    // Constraint: No negatives.
    return;
}

function handlePercent() {
    // Constraint: No decimals.
    return;
}


// Magic Logic - Global Click Listener
// Note: We need to handle the fact that 'calculate' sets magicMode=true
// and creates a race condition with this listener if not careful.
// Using a simple flag or counter reset (-1) works.

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

    // "Magic part except" - allowed to be negative/large/decimal?
    // P is usually large positive integer. Base is small positive integer (max 5 digits).
    // Result is large positive integer.

    const result = p - magicBaseValue;

    displayValue = String(result);
    updateDisplay();

    // Reset magic mode after trigger?
    // Usually magic tricks end.
    // Or stay in mode? "Once screen be pressed... 7 times or above".
    // If we stay, every subsequent click updates P?
    // "Automatically change...".
    // Let's keep updating if they keep clicking? Or just once?
    // Usually once is enough. But the prompt says "7 times OR ABOVE".
    // So maybe continuous update?
    // P changes every minute.
    // Let's just update on every click >= 7.
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
