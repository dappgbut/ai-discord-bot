let consoleOutput = [];

const originalLog = console.log;

console.log = function(...args) {
    // Convert all arguments to a string format
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');

    // Store the message with a timestamp
    consoleOutput.push(`[${new Date().toISOString()}] ${message}`);

    // Optionally, limit the number of stored logs to prevent memory issues
    if (consoleOutput.length > 100) {
        consoleOutput.shift();
    }

    // Call the original console.log so it still prints to your terminal
    originalLog.apply(console, args);
};

// Function to get the captured output
function getConsoleOutput() {
    return consoleOutput.join('\n');
}

module.exports = { getConsoleOutput };