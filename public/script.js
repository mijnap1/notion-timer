// Selectors
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const taskTitle = document.getElementById("taskTitle");
const stopwatchDisplay = document.getElementById("stopwatch");
const emojiPickerButton = document.getElementById("emojiPicker");
const emojiDropdown = document.getElementById("emojiPickerDropdown");
const logContainer = document.getElementById("timeLog");
const taskContainer = document.getElementById("taskContainer"); // Container for tasks
const addTaskBtn = document.getElementById("addTaskBtn"); // Button to add a new task

let timerInterval = null;
let startTime = null;
let selectedEmoji = null;

// Emoji list and recent emojis
const emojiList = ["😀", "🎉", "✅", "🔥", "🌟", "💻", "📚", "📝", "⚡", "🕒", "🎓", "🎧", "🖥️", "🛒", "🍽️", "🍱", "🥣", "🪧", "🏬", "🏠"];
let recentEmojis = [];

// Function to create a new task timer
function createTaskTimer() {
    const taskBox = document.createElement("section");
    taskBox.classList.add("stopwatch-box", "fade-in");

    taskBox.innerHTML = `
        <p class="timer-label">Task Timer</p>
        <div class="timer-display">00:00:00.000</div>
        <div class="input-wrapper">
            <div class="emoji-container">
                <button type="button" class="emoji-button">+</button>
                <div class="emoji-dropdown hidden"></div>
            </div>
            <input type="text" class="task-input" placeholder="Enter task title here">
        </div>
        <div class="controls">
            <button class="control-button start-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <polygon points="5,3 19,12 5,21" fill="#34d399"></polygon>
                </svg>
            </button>
            <button class="control-button stop-btn" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="6" width="12" height="12" fill="#f87171"></rect>
                </svg>
            </button>
        </div>
    `;

    // Insert new task before Activity Logs
    const logSection = document.querySelector(".log-section");
    taskContainer.insertBefore(taskBox, logSection);

    setupTaskControls(taskBox); // Set up controls for the new timer
}
// Function to set up individual task timer controls
function setupTaskControls(taskBox) {
    const startBtn = taskBox.querySelector(".start-btn");
    const stopBtn = taskBox.querySelector(".stop-btn");
    const taskTitle = taskBox.querySelector(".task-input");
    const stopwatchDisplay = taskBox.querySelector(".timer-display");

    let timerInterval = null;
    let startTime = null;

    // Start timer
    startBtn.addEventListener("click", () => {
        if (taskTitle.value.trim() === "") {
            alert("Please enter a task title.");
            return;
        }

        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            stopwatchDisplay.textContent = formatTime(elapsedTime);
        }, 10);

        const logMessage = selectedEmoji
            ? `Started task: "${taskTitle.value}" using emoji "${selectedEmoji}" at ${formatEST(startTime)}`
            : `Started task: "${taskTitle.value}" at ${formatEST(startTime)}`;

        addLog(logMessage);
        startBtn.disabled = true;
        stopBtn.disabled = false;
    });

    // Stop timer and save data
    stopBtn.addEventListener("click", async () => {
        clearInterval(timerInterval);
        startBtn.disabled = false;
        stopBtn.disabled = true;

        const task = taskTitle.value.trim();
        const stopTime = Date.now();
        const elapsedTime = stopTime - startTime;
        const formattedTime = formatTime(elapsedTime);

        const logMessage = selectedEmoji
            ? `Stopped task: "${task}" at ${formatEST(stopTime)} and lasted ${formattedTime}`
            : `Stopped task: "${task}" at ${formatEST(stopTime)} and lasted ${formattedTime}`;

        addLog(logMessage);

        // Save task to backend
        const taskWithEmoji = selectedEmoji ? `${selectedEmoji} ${task}` : task;
        await saveTaskToBackend(taskWithEmoji, startTime, stopTime);
    });
}

// Format time
function formatTime(ms) {
    const milliseconds = String(ms % 1000).padStart(3, "0");
    const seconds = String(Math.floor(ms / 1000) % 60).padStart(2, "0");
    const minutes = String(Math.floor(ms / (60 * 1000)) % 60).padStart(2, "0");
    const hours = String(Math.floor(ms / (60 * 60 * 1000)));
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// Convert time to EST
function formatEST(date) {
    return new Date(date).toLocaleString("en-US", { timeZone: "America/New_York" });
}

// Add log
function addLog(message) {
    const logItem = document.createElement("p");
    logItem.textContent = message;
    logContainer.prepend(logItem);

    if (logContainer.children.length > 5) {
        logContainer.lastChild.remove();
    }
}

// Populate emoji dropdown
function populateEmojiDropdown() {
    emojiDropdown.innerHTML = ""; // Clear dropdown
    const allEmojis = [...recentEmojis, ...emojiList.filter((emoji) => !recentEmojis.includes(emoji))];

    allEmojis.forEach((emoji) => {
        const button = document.createElement("button");
        button.textContent = emoji;
        button.addEventListener("click", () => {
            selectedEmoji = emoji;
            emojiPickerButton.textContent = emoji;
            emojiDropdown.classList.add("hidden");

            if (!recentEmojis.includes(emoji)) {
                recentEmojis.unshift(emoji);
                if (recentEmojis.length > 5) recentEmojis.pop(); // Limit to 5 recent emojis
            }
            populateEmojiDropdown(); // Refresh the dropdown
        });
        emojiDropdown.appendChild(button);
    });
}

populateEmojiDropdown();

// Toggle emoji dropdown
emojiPickerButton.addEventListener("click", () => {
    emojiDropdown.classList.toggle("hidden");
});

// Start timer
startBtn.addEventListener("click", () => {
    if (taskTitle.value.trim() === "") {
        alert("Please enter a task title.");
        return;
    }

    startTime = Date.now();
    stopwatchDisplay.textContent = "00:00:00.000";

    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        stopwatchDisplay.textContent = formatTime(elapsedTime);
    }, 10);

    const logMessage = selectedEmoji
        ? `Started task: "${taskTitle.value}" using emoji "${selectedEmoji}" at ${formatEST(startTime)}`
        : `Started task: "${taskTitle.value}" at ${formatEST(startTime)}`;

    addLog(logMessage);
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

// Stop timer
stopBtn.addEventListener("click", async () => {
    clearInterval(timerInterval);

    const task = taskTitle.value.trim();
    const stopTime = Date.now();
    const elapsedTime = stopTime - startTime;
    const formattedTime = formatTime(elapsedTime);

    const logMessage = selectedEmoji
        ? `Stopped task: "${task}" at ${formatEST(stopTime)} and lasted ${formattedTime}`
        : `Stopped task: "${task}" at ${formatEST(stopTime)} and lasted ${formattedTime}`;

    addLog(logMessage);

    // Prepend emoji to the task title
    const taskWithEmoji = selectedEmoji ? `${selectedEmoji} ${task}` : task;

    // Add animation to task title and emoji button
    taskTitle.classList.add("disappear");
    emojiPickerButton.classList.add("disappear");

    // Save task to backend
    await saveTaskToBackend(taskWithEmoji, startTime, stopTime);

    // Reset UI after animation
    setTimeout(() => {
        taskTitle.value = "";
        taskTitle.classList.remove("disappear");
        emojiPickerButton.textContent = "+";
        emojiPickerButton.classList.remove("disappear");
        selectedEmoji = null;
        stopwatchDisplay.textContent = "00:00:00.000";
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }, 500);
});
// Add event listener for the "New Task" button
addTaskBtn.addEventListener("click", createTaskTimer);

// Save to backend
async function saveTaskToBackend(task, startTime, stopTime) {
    const backendUrl = "http://localhost:3000"; // Replace with your actual backend URL

    try {
        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task, startTime, stopTime }),
        });

        if (response.ok) {
            console.log("Task saved successfully.");
        } else {
            const errorDetails = await response.json();
            console.error("Failed to save task:", errorDetails);
        }
    } catch (error) {
        console.error("Error saving task:", error);
    }
}
