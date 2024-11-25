window.process = { env: { NODE_ENV: 'production' } };

const URL =
    process.env.NODE_ENV === "production"
        ? "https://taskmanager-dhanush.up.railway.app"
        : "http://localhost:3000";
const baseURL = `${URL}`;

document.addEventListener('DOMContentLoaded', fetchTasks);

document.getElementById('newTaskBtn').style.display = "none";

// Close button
document.getElementById('closeBtn').onclick = () => {
    const taskFormSection = document.getElementById("taskFormSection");
    const tasksSection = document.getElementById('tasksSection');
    document.getElementById('newTaskBtn').style.display = "block";

    taskFormSection.style.display = 'none';
    tasksSection.style.maxWidth = "75vw";
};

// New task button
document.getElementById('newTaskBtn').onclick = () => {
    const taskFormSection = document.getElementById("taskFormSection");
    const tasksSection = document.getElementById('tasksSection');
    document.getElementById('newTaskBtn').style.display = "none";

    tasksSection.style.maxWidth = "45vw";
    taskFormSection.style.display = 'flex';
};

async function fetchTasks() {
    const token = localStorage.getItem('token');
    if (!token) {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
        return;
    }

    try {
        const response = await fetch(`${baseURL}/tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
        }

        const tasks = await response.json();
        const tasksDiv = document.getElementById('tasks');
        tasksDiv.innerHTML = '';

        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            if (task.status) { taskDiv.id = 'completed'; }
            taskDiv.className = 'task';
            taskDiv.innerHTML = `
                <h3 class="h3">${task.title}</h3>
                <p class="description">${task.description}</p>
                <button class="updateBtn" onclick="updateTask('${task._id}')">Update</button>
                <button class="deleteBtn" onclick="deleteTask('${task._id}')">Delete</button>
            `;
            tasksDiv.appendChild(taskDiv);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
        return;
    }
}

function createTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value || 'No description.';
    const token = localStorage.getItem('token');

    const addBtn = document.getElementById('addBtn');
    if (title === '' || title.length < 3) {  // Corrected 'title.length()' to 'title.length'
        document.getElementById('noTask').innerHTML = `<i>Enter valid task name.</i>`;
        return;
    } else {
        document.getElementById('noTask').innerHTML = '';
    }

    // Your additional code for what happens after validation passes goes here.

    addBtn.classList.add('loading');

    fetch(`${baseURL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, status: false })
    })
        .then(response => response.json())
        .then(() => {
            fetchTasks();
            document.getElementById('title').value = '';
            document.getElementById('description').value = '';
            addBtn.classList.remove('loading');
        })
        .catch(error => {
            console.error('Error creating task:', error);
            addBtn.classList.remove('loading');
        });
}

function updateTask(id) {
    const updateBtn = document.querySelector(`.updateBtn[onclick="updateTask('${id}')"]`);
    updateBtn.classList.add('loading');

    fetch(`${baseURL}/tasks/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(task => {
            fetchTasks();
            console.log(task);

            const popup = document.createElement('div');
            popup.id = 'popup';
            popup.className = 'popup';

            popup.innerHTML = `
                <div id="popupHeader">
                    <h2>Task Details</h2>
                    <button id="popupCloseBtn" onclick="popup.remove()">X</button>
                </div>

                <div id="popupContent">
                    <div>
                    <label for="taskTitle"><strong>Title:</strong></label>
                    <input class="popupInp" type="text" id="taskTitle" value="${task.title}" /><br><br>
                    
                    <label for="taskDescription"><strong>Description:</strong></label>
                    <input class="popupInp" type="text" id="taskDescription" value="${task.description}" /><br><br>
                    
                    <label for="taskStatus"><strong>Status:</strong></label>
                    <select id="taskStatus">
                        <option value="true" ${task.status ? 'selected' : ''}>Completed</option>
                        <option value="false" ${!task.status ? 'selected' : ''}>Pending</option>
                    </select><br><br>
                    
                    <p><strong>Created At:</strong> ${new Date(task.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                <button id="saveChanges">Save Changes</button>
            `;

            popup.querySelector('#saveChanges').onclick = () => {
                const updatedTask = {
                    title: document.getElementById('taskTitle').value,
                    description: document.getElementById('taskDescription').value,
                    status: document.getElementById('taskStatus').value === 'true',
                };
                saveTaskChanges(id, updatedTask);
                popup.remove();
            };

            document.body.appendChild(popup);
            updateBtn.classList.remove('loading');
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            updateBtn.classList.remove('loading');
        });
}

function saveTaskChanges(id, updatedTask) {
    fetch(`${baseURL}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update the task');
            }
            return response.json();
        })
        .then(data => {
            console.log('Task updated successfully:', data);
            fetchTasks();
        })
        .catch(error => {
            console.error('Error updating task:', error);
        });
}

function deleteTask(id) {
    if (!confirm('Are you sure?')) {
        return;
    }
    const deleteBtn = document.querySelector(`.deleteBtn[onclick="deleteTask('${id}')"]`);
    deleteBtn.classList.add('loading');

    fetch(`${baseURL}/tasks/${id}`, {
        method: 'DELETE',
    })
        .then(() => fetchTasks())
        .then(() => deleteBtn.classList.remove('loading'))
        .catch(error => {
            console.error('Error deleting task:', error);
            deleteBtn.classList.remove('loading');
        });
}

document.getElementById('title').addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        createTask();
    }
});

function logOut() {
    if (!confirm('Are you sure?')) {
        return;
    }
    const logOutButton = document.getElementById('logOut');
    logOutButton.classList.add('loading');

    setTimeout(() => {
        logOutButton.classList.remove('loading');
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
    }, 2000);
}
