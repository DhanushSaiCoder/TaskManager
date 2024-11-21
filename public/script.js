const baseURL = 'http://localhost:3000/api/tasks';

document.addEventListener('DOMContentLoaded', fetchTasks);

function fetchTasks() {
    fetch(baseURL)
        .then(response => response.json())
        .then(tasks => {
            const tasksDiv = document.getElementById('tasks');
            tasksDiv.innerHTML = '';
            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'task';
                taskDiv.innerHTML = `
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <button onclick="updateTask('${task._id}', '${task.title}', '${task.description}', ${task.status})">Update</button>
                    <button onclick="deleteTask('${task._id}')">Delete</button>
                `;
                tasksDiv.appendChild(taskDiv);
            });
        });
}

function createTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    fetch(baseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, status: false })
    })
    .then(response => response.json())
    .then(() => {
        fetchTasks();
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
    });
}

function updateTask(id, title, description, status) {
    const updatedStatus = !status;

    fetch(`${baseURL}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: updatedStatus })
    })
    .then(response => response.json())
    .then(() => fetchTasks());
}

function deleteTask(id) {
    fetch(`${baseURL}/${id}`, {
        method: 'DELETE',
    })
    .then(() => fetchTasks());
}
