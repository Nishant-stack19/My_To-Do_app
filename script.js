document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const todosContainer = document.querySelector('.todos-container');
    const progressBar = document.getElementById('progress');
    const progressNumber = document.getElementById('numbers');

    let taskBeingEdited = null;

    const toggleEmptyState = () => {
        emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
        todosContainer.style.width = taskList.children.length > 0 ? '100%' : '50%';
    };

    const updateProgress = () => {
        const totalTasks = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('.checkbox:checked').length;

        const percent = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
        progressBar.style.width = `${percent}%`;
        progressNumber.textContent = `${completedTasks} / ${totalTasks}`;

        if (totalTasks > 0 && completedTasks === totalTasks) {
            Confetti();
        }
    };

    const createTaskElement = (text, completed = false) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = completed;

        const span = document.createElement('span');
        span.textContent = text;

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'task-buttons';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;

        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(buttonContainer);

        if (completed) {
            li.classList.add('completed');
            editBtn.disabled = true;
            editBtn.style.opacity = '0.5';
            editBtn.style.pointerEvents = 'none';
        }

        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            li.classList.toggle('completed', isChecked);
            editBtn.disabled = isChecked;
            editBtn.style.opacity = isChecked ? '0.5' : '1';
            editBtn.style.pointerEvents = isChecked ? 'none' : 'auto';
            updateProgress();
            saveTaskToLocalStorage();
        });

        editBtn.addEventListener('click', () => {
            if (!checkbox.checked) {
                taskInput.value = span.textContent;
                taskInput.focus();
                taskBeingEdited = { element: li, span: span };
            }
        });

        deleteBtn.addEventListener('click', () => {
            li.remove();
            if (taskBeingEdited?.element === li) {
                taskBeingEdited = null;
                taskInput.value = '';
            }
            toggleEmptyState();
            updateProgress();
            saveTaskToLocalStorage();
        });

        return li;
    };

    const saveTaskToLocalStorage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector('span').textContent,
            completed: li.querySelector('.checkbox').checked
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(({ text, completed }) => {
            addTask(text, completed, false);
        });
        toggleEmptyState();
        updateProgress();
    };

    const addTask = (text = null, completed = false, fromUser = true) => {
        if (fromUser) {
            text = taskInput.value.trim();
            if (!text) return;

            if (taskBeingEdited) {
                taskBeingEdited.span.textContent = text;
                taskBeingEdited = null;
            } else {
                const li = createTaskElement(text);
                taskList.appendChild(li);
            }

            taskInput.value = '';
        } else {
            const li = createTaskElement(text, completed);
            taskList.appendChild(li);
        }

        toggleEmptyState();
        updateProgress();
        saveTaskToLocalStorage();
    };

    addTaskBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addTask(null, false, true);
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask(null, false, true);
        }
    });

    // Initial load
    loadTasksFromLocalStorage();
});

const Confetti = () => {
    const duration = 15 * 100;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }));

        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }));
    }, 250);
};
