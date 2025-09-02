class TodoApp {
    constructor() {
        this.tasks = [];
        this.taskIdCounter = 1;
        this.handleTaskClick = null;
        this.initializeElements();
        this.bindEvents();
        this.loadTasks();
        this.renderTasks();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.clearBtn = document.getElementById('clearBtn');

        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');

        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');

        this.randomModal = document.getElementById('randomModal');
        this.randomTask = document.getElementById('randomTask');
        this.closeModal = document.getElementById('closeModal');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.randomBtn.addEventListener('click', () => this.showRandomTask());
        this.clearBtn.addEventListener('click', () => this.clearAllTasks());

        this.closeModal.addEventListener('click', () => this.hideRandomModal());
        this.randomModal.addEventListener('click', (e) => {
            if (e.target === this.randomModal) this.hideRandomModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.addTask();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.showRandomTask();
                        break;
                    case 'Delete':
                        e.preventDefault();
                        this.clearAllTasks();
                        break;
                }
            }
            if (e.key === 'Escape') this.hideRandomModal();
        });
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        if (!taskText) {
            this.shakeInput();
            return;
        }

        const newTask = {
            id: this.taskIdCounter++,
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.taskInput.value = '';
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.taskInput.focus();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();

            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.style.transition = 'all 0.3s ease';
                taskElement.style.transform = 'scale(0.98)';
                setTimeout(() => taskElement.style.transform = 'scale(1)', 150);
            }
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    showRandomTask() {
        const incompleteTasks = this.tasks.filter(task => !task.completed);

        if (this.tasks.length === 0) {
            this.randomTask.textContent = "Tiada tugasan tersedia. Sila tambah tugasan dahulu! 📝";
        } else if (incompleteTasks.length === 0) {
            this.randomTask.textContent = "Tahniah! Semua tugasan telah selesai! 🎉";
        } else {
            const randomIndex = Math.floor(Math.random() * incompleteTasks.length);
            const selectedTask = incompleteTasks[randomIndex];
            this.randomTask.textContent = selectedTask.text;
        }

        this.randomModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const modalContent = this.randomModal.querySelector('.modal-content');
            if (modalContent) modalContent.style.animation = 'modalSlideIn 0.3s ease';
        }, 10);
    }

    hideRandomModal() {
        this.randomModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    clearAllTasks() {
        if (this.tasks.length === 0) return;
        if (confirm('Adakah anda pasti untuk memadam semua tugasan?')) {
            this.tasks = [];
            this.taskIdCounter = 1;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    renderTasks() {
        if (this.tasks.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.style.display = 'block';
            return;
        }

        this.todoList.style.display = 'block';
        this.emptyState.style.display = 'none';

        this.todoList.innerHTML = this.tasks.map(task => this.createTaskHTML(task)).join('');
        this.bindTaskEvents();
        this.updateStats();
    }

    createTaskHTML(task) {
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle"></div>
                <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="task-btn delete-btn" data-action="delete" title="Padam tugasan">🗑️</button>
                </div>
            </div>
        `;
    }

    bindTaskEvents() {
        this.todoList.removeEventListener('click', this.handleTaskClick);

        this.handleTaskClick = (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;

            const taskId = parseInt(taskItem.dataset.taskId);
            const action = e.target.dataset.action;

            if (action === 'toggle') this.toggleTask(taskId);
            else if (action === 'delete') this.deleteTask(taskId);
        };

        this.todoList.addEventListener('click', this.handleTaskClick);
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;
    }

    shakeInput() {
        this.taskInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => this.taskInput.style.animation = '', 500);

        if (!document.querySelector('#shakeAnimation')) {
            const style = document.createElement('style');
            style.id = 'shakeAnimation';
            style.textContent = `@keyframes shake {0%, 100% { transform: translateX(0); }10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }20%, 40%, 60%, 80% { transform: translateX(5px); }}`;
            document.head.appendChild(style);
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('todoTasks');
            const savedIdCounter = localStorage.getItem('taskIdCounter');

            this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
            this.taskIdCounter = savedIdCounter ? parseInt(savedIdCounter) : 1;
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
            this.taskIdCounter = 1;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

function addGlowEffect() {
    const glowElements = document.querySelectorAll('.btn, .task-item, .stat-item');
    glowElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
        });
        element.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
}

function addParticleBackground() {
    const particleCount = 50;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `position: fixed;width: 2px;height: 2px;background: rgba(0, 212, 255, 0.5);border-radius: 50%;pointer-events: none;z-index: -1;`;
        document.body.appendChild(particle);
        particles.push({
            element: particle,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5
        });
    }

    function animateParticles() {
        particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            if (particle.x < 0 || particle.x > window.innerWidth) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.speedY *= -1;
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

document.addEventListener('DOMContentLoaded', function() {
    const app = new TodoApp();
    app.updateStats();
    setTimeout(() => {
        addGlowEffect();
        addParticleBackground();
    }, 500);
    console.log('🚀 Random To-Do List - Dark Tech Mode dimuat!');
});
