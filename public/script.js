window.process = { env: { NODE_ENV: 'production' } };

const URL =
    process.env.NODE_ENV === "production"
        ? "https://taskmanager-dhanush.up.railway.app"
        : "http://localhost:3000";
const baseURL = `${URL}`;

document.addEventListener('DOMContentLoaded', fetchTasks);

document.getElementById('newTaskBtn').style.display = "none"

document.getElementById('closeBtn').onclick = () => {
    const taskFormSection = document.getElementById("taskFormSection")
    const tasksSection = document.getElementById('tasksSection')
    document.getElementById('newTaskBtn').style.display = "block"

    taskFormSection.style.display = 'none';
    tasksSection.style.width = "100vw";
}
document.getElementById('newTaskBtn').onclick = () => {
    const taskFormSection = document.getElementById("taskFormSection")
    const tasksSection = document.getElementById('tasksSection')
    document.getElementById('newTaskBtn').style.display = "none"

    taskFormSection.style.display = 'flex';
   

}

async function fetchTasks() {
    const token = localStorage.getItem('token');
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
        alert('Failed to fetch tasks: ' + error.message); // Optionally, display error to the user
    }
}



function createTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value || 'No description.';
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    fetch(`${baseURL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the token in the headers
        },
        body: JSON.stringify({ title, description, status: false })
    })
        .then(response => response.json())
        .then(() => {
            fetchTasks();
            document.getElementById('title').value = '';
            document.getElementById('description').value = '';
        })
        .catch(error => console.error('Error creating task:', error));
}

function updateTask(id) {
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
    fetch(`${baseURL}/tasks/${id}`, {
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
    fetch(`${baseURL}/tasks/${id}`, {
        method: 'DELETE',
    })
        .then(() => fetchTasks());
}

document.getElementById('title').addEventListener("keydown", function (event) {
    // Check if the Enter key is pressed
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission (if inside a form)
        createTask(); // Call the function
    }
});

function logOut() {
    localStorage.removeItem('token')
    window.location.href = '/auth/login'
}