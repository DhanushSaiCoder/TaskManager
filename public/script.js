const baseURL = 'http://localhost:3000/tasks';

document.addEventListener('DOMContentLoaded', fetchTasks);

function fetchTasks() {
    fetch(baseURL)
        .then(response => response.json())
        .then(tasks => {
            const tasksDiv = document.getElementById('tasks');
            tasksDiv.innerHTML = '';
            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                if(task.status){taskDiv.id ='completed'}
                taskDiv.className = 'task';
                taskDiv.innerHTML = `
                    <h3 class="h3">${task.title}</h3>
                    <p class="p" class="description">${task.description}</p>
                    <button class="updateBtn" onclick="updateTask('${task._id}')">Update</button>
                    <button class="deleteBtn" onclick="deleteTask('${task._id}')">Delete</button>
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

function updateTask(id) {
    fetch(`${baseURL}/${id}`, {
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

            // Log the task
            console.log(task);

            // Create the popup
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
                    <input type="text" id="taskTitle" value="${task.title}" /><br><br>
                    
                    <label for="taskDescription"><strong>Description:</strong></label>
                    <input type="text" id="taskDescription" value="${task.description}" /><br><br>
                    
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



            // Append the button to the popup

            // Add event listener for saving changes
            popup.querySelector('#saveChanges').onclick = () => {
                const updatedTask = {
                    title: document.getElementById('taskTitle').value,
                    description: document.getElementById('taskDescription').value,
                    status: document.getElementById('taskStatus').value === 'true',
                };
                saveTaskChanges(id, updatedTask);
                popup.remove();
            };

            // Add the popup to the document body
            document.body.appendChild(popup);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function saveTaskChanges(id, updatedTask) {
    fetch(`${baseURL}/${id}`, {
        method: 'PATCH', // HTTP method to update the task
        headers: {
            'Content-Type': 'application/json', // Specify JSON format
        },
        body: JSON.stringify(updatedTask), // Convert the updated task object to a JSON string
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update the task');
        }
        return response.json(); // Parse the response JSON
    })
    .then(data => {
        console.log('Task updated successfully:', data);
        fetchTasks(); // Refresh the task list to reflect the changes
    })
    .catch(error => {
        console.error('Error updating task:', error);
    });
}

function deleteTask(id) {
    fetch(`${baseURL}/${id}`, {
        method: 'DELETE',
    })
        .then(() => fetchTasks());
}
