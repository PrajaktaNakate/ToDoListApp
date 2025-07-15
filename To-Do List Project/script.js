class ModernTodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.initializeEventListeners();
        this.renderTasks();
        this.updateStats();
        this.updateProgress();
        this.addLoadingAnimation();
    }

    addLoadingAnimation() {
        // Add a brief loading animation on startup
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '<div class="flex justify-center items-center p-8"><div class="loading-spinner"></div></div>';

        setTimeout(() => {
            this.renderTasks();
        }, 800);
    }

    initializeEventListeners() {
        // Form submission with enhanced feedback
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTaskWithAnimation();
        });

        // Filter buttons with smooth transitions
        document.getElementById('filterAll').addEventListener('click', () => this.setFilter('all'));
        document.getElementById('filterActive').addEventListener('click', () => this.setFilter('active'));
        document.getElementById('filterCompleted').addEventListener('click', () => this.setFilter('completed'));

        // Clear completed with confirmation animation
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompletedWithAnimation());

        // Edit modal with enhanced animations
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditWithAnimation();
        });
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeEditModal());

        // Enhanced modal interactions
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeEditModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.getElementById('editModal').classList.contains('hidden')) {
                this.closeEditModal();
            }
            if (e.ctrlKey && e.key === 'Enter') {
                document.getElementById('taskInput').focus();
            }
        });
    }

    addTaskWithAnimation() {
        const taskInput = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const dueDateInput = document.getElementById('dueDateInput');
        const categoryInput = document.getElementById('categoryInput');

        const taskText = taskInput.value.trim();

        if (!taskText) {
            this.showError('Please enter a task description! ✍️');
            this.shakeElement(taskInput);
            return;
        }

        // Add loading state to button
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adding...';
        submitBtn.disabled = true;

        setTimeout(() => {
            const task = {
                id: Date.now().toString(),
                text: taskText,
                completed: false,
                priority: prioritySelect.value,
                dueDate: dueDateInput.value || null,
                category: categoryInput.value.trim() || null,
                createdAt: new Date().toISOString()
            };

            this.tasks.unshift(task);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.updateProgress();

            // Reset form with animation
            taskInput.value = '';
            dueDateInput.value = '';
            categoryInput.value = '';
            prioritySelect.value = 'medium';

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            this.showSuccess('Task added successfully! 🎉');
            this.celebrateTaskAdd();
        }, 500);
    }

    celebrateTaskAdd() {
        // Create celebration effect
        const celebration = document.createElement('div');
        celebration.innerHTML = '🎉';
        celebration.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    font-size: 3rem;
                    z-index: 9999;
                    pointer-events: none;
                    animation: celebrate 1s ease-out forwards;
                `;

        const style = document.createElement('style');
        style.textContent = `
                    @keyframes celebrate {
                        0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 1; }
                        50% { transform: translate(-50%, -50%) scale(1.5) rotate(180deg); opacity: 1; }
                        100% { transform: translate(-50%, -50%) scale(0) rotate(360deg); opacity: 0; }
                    }
                `;
        document.head.appendChild(style);
        document.body.appendChild(celebration);

        setTimeout(() => {
            document.body.removeChild(celebration);
            document.head.removeChild(style);
        }, 1000);
    }

    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        const style = document.createElement('style');
        style.textContent = `
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                `;
        document.head.appendChild(style);

        setTimeout(() => {
            element.style.animation = '';
            document.head.removeChild(style);
        }, 500);
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();

            // Add completion animation
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                if (task.completed) {
                    taskElement.style.animation = 'completionPulse 0.6s ease';
                    this.showSuccess('Task completed! Great job! 🎊');
                } else {
                    taskElement.style.animation = 'incompletePulse 0.3s ease';
                }
            }

            setTimeout(() => {
                this.renderTasks();
                this.updateStats();
                this.updateProgress();
            }, 300);
        }
    }

    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && confirm(`Are you sure you want to delete "${task.text}"? 🗑️`)) {
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.classList.add('slide-out-right');
                setTimeout(() => {
                    this.tasks = this.tasks.filter(t => t.id !== taskId);
                    this.saveTasks();
                    this.renderTasks();
                    this.updateStats();
                    this.updateProgress();
                    this.showSuccess('Task deleted successfully! 🗑️');
                }, 300);
            }
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            document.getElementById('editTaskInput').value = task.text;
            document.getElementById('editPrioritySelect').value = task.priority;
            document.getElementById('editDueDateInput').value = task.dueDate || '';
            document.getElementById('editCategoryInput').value = task.category || '';

            const modal = document.getElementById('editModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');

            // Focus on input after animation
            setTimeout(() => {
                document.getElementById('editTaskInput').focus();
            }, 300);
        }
    }

    saveEditWithAnimation() {
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            const newText = document.getElementById('editTaskInput').value.trim();
            if (!newText) {
                this.showError('Please enter a task description! ✍️');
                this.shakeElement(document.getElementById('editTaskInput'));
                return;
            }

            // Add loading state
            const saveBtn = document.querySelector('#editForm button[type="submit"]');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
            saveBtn.disabled = true;

            setTimeout(() => {
                task.text = newText;
                task.priority = document.getElementById('editPrioritySelect').value;
                task.dueDate = document.getElementById('editDueDateInput').value || null;
                task.category = document.getElementById('editCategoryInput').value.trim() || null;

                this.saveTasks();
                this.renderTasks();
                this.closeEditModal();
                this.showSuccess('Task updated successfully! ✨');

                // Reset button
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }, 500);
        }
    }

    closeEditModal() {
        const modal = document.getElementById('editModal');
        const content = modal.querySelector('.modal-content');

        content.style.animation = 'modalSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';

        const style = document.createElement('style');
        style.textContent = `
                    @keyframes modalSlideOut {
                        from { opacity: 1; transform: scale(1) translateY(0); }
                        to { opacity: 0; transform: scale(0.9) translateY(-20px); }
                    }
                `;
        document.head.appendChild(style);

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            content.style.animation = '';
            document.head.removeChild(style);
            this.editingTaskId = null;
        }, 300);
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Update filter button styles with animation
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('bg-white/20', 'text-white');
        });

        const activeBtn = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
        activeBtn.classList.add('active');
        activeBtn.classList.remove('bg-white/20', 'text-white');

        // Add transition effect
        const tasksList = document.getElementById('tasksList');
        tasksList.style.opacity = '0.5';
        tasksList.style.transform = 'translateY(10px)';

        setTimeout(() => {
            this.renderTasks();
            tasksList.style.opacity = '1';
            tasksList.style.transform = 'translateY(0)';
        }, 200);
    }

    clearCompletedWithAnimation() {
        const completedTasks = this.tasks.filter(task => task.completed);
        if (completedTasks.length === 0) {
            this.showError('No completed tasks to clear! 🤷‍♂️');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)? 🗑️`)) {
            // Animate out completed tasks
            completedTasks.forEach(task => {
                const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
                if (taskElement) {
                    taskElement.classList.add('slide-out-right');
                }
            });

            setTimeout(() => {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.updateProgress();
                this.showSuccess(`${completedTasks.length} completed tasks cleared! 🎉`);
            }, 300);
        }
    }

    updateProgress() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        // Update progress bar with animation
        const progressFill = document.getElementById('progressFill');
        const progressPercentage = document.getElementById('progressPercentage');
        const completedCount = document.getElementById('completedCount');
        const totalCount = document.getElementById('totalCount');

        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
        completedCount.textContent = `${completedTasks} completed`;
        totalCount.textContent = `${totalTasks} total`;

        // Add celebration for 100% completion
        if (percentage === 100 && totalTasks > 0) {
            this.celebrateCompletion();
        }
    }

    celebrateCompletion() {
        // Create fireworks effect
        const fireworks = ['🎆', '🎇', '✨', '🎉', '🎊'];
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.innerHTML = fireworks[Math.floor(Math.random() * fireworks.length)];
                firework.style.cssText = `
                            position: fixed;
                            top: ${Math.random() * 100}%;
                            left: ${Math.random() * 100}%;
                            font-size: 2rem;
                            z-index: 9999;
                            pointer-events: none;
                            animation: firework 2s ease-out forwards;
                        `;

                document.body.appendChild(firework);

                setTimeout(() => {
                    document.body.removeChild(firework);
                }, 2000);
            }, i * 200);
        }

        const style = document.createElement('style');
        style.textContent = `
                    @keyframes firework {
                        0% { opacity: 1; transform: scale(0) rotate(0deg); }
                        50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
                        100% { opacity: 0; transform: scale(0) rotate(360deg); }
                    }
                `;
        document.head.appendChild(style);

        setTimeout(() => {
            document.head.removeChild(style);
        }, 3000);

        this.showSuccess('🎉 Congratulations! All tasks completed! You\'re amazing! 🎉');
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            tasksList.innerHTML = filteredTasks.map((task, index) => {
                const html = this.createTaskHTML(task);
                // Add staggered animation delay
                setTimeout(() => {
                    const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
                    if (taskElement) {
                        taskElement.classList.add('slide-in-left');
                        taskElement.style.animationDelay = `${index * 0.1}s`;
                    }
                }, 50);
                return html;
            }).join('');
        }

        // Update clear completed button visibility
        const hasCompleted = this.tasks.some(task => task.completed);
        const clearBtn = document.getElementById('clearCompleted');
        if (hasCompleted) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }

    createTaskHTML(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !task.completed;
        const dueDateText = dueDate ? dueDate.toLocaleDateString() : '';

        return `
                    <div class="task-card p-6 hover:bg-white/5 transition-all duration-300 priority-${task.priority}" data-task-id="${task.id}">
                        <div class="flex items-center space-x-4">
                            <input 
                                type="checkbox" 
                                ${task.completed ? 'checked' : ''} 
                                onchange="todoApp.toggleTask('${task.id}')"
                                class="custom-checkbox"
                            >
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between">
                                    <p class="text-lg font-medium ${task.completed ? 'task-completed text-white/60' : 'text-white'} truncate">
                                        ${task.text}
                                    </p>
                                    <div class="flex items-center space-x-3 ml-4">
                                        <button 
                                            onclick="todoApp.editTask('${task.id}')"
                                            class="text-blue-300 hover:text-blue-100 text-lg transition-all duration-200 hover:scale-110"
                                            title="Edit task"
                                        >
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            onclick="todoApp.deleteTask('${task.id}')"
                                            class="text-red-300 hover:text-red-100 text-lg transition-all duration-200 hover:scale-110"
                                            title="Delete task"
                                        >
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4 mt-3">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${this.getPriorityClasses(task.priority)}">
                                        ${this.getPriorityIcon(task.priority)} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                    </span>
                                    ${task.category ? `<span class="text-xs text-white/70 bg-white/20 px-3 py-1 rounded-full"><i class="fas fa-tag mr-1"></i>${task.category}</span>` : ''}
                                    ${dueDateText ? `<span class="text-xs ${isOverdue ? 'text-red-300 font-medium animate-pulse' : 'text-white/70'}">${isOverdue ? '⚠️ Overdue: ' : '📅 '} ${dueDateText}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
    }

    getPriorityClasses(priority) {
        switch (priority) {
            case 'high':
                return 'bg-red-500/20 text-red-300 border border-red-500/30';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
            case 'low':
                return 'bg-green-500/20 text-green-300 border border-green-500/30';
            default:
                return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
        }
    }

    getPriorityIcon(priority) {
        switch (priority) {
            case 'high':
                return '🔴';
            case 'medium':
                return '🟡';
            case 'low':
                return '🟢';
            default:
                return '⚪';
        }
    }

    updateStats() {
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        const totalTasks = this.tasks.length;

        const statsElement = document.getElementById('taskStats');
        if (totalTasks === 0) {
            statsElement.innerHTML = '<i class="fas fa-info-circle mr-2"></i>No tasks yet';
        } else {
            statsElement.innerHTML = `<i class="fas fa-tasks mr-2"></i>${activeTasks} of ${totalTasks} tasks remaining`;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification fixed top-6 right-6 px-6 py-4 rounded-xl text-white font-medium z-50 max-w-sm ${type}`;
        notification.innerHTML = `
                    <div class="flex items-center">
                        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-3 text-lg"></i>
                        <span>${message}</span>
                    </div>
                `;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'notificationSlideOut 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);

        // Add slide out animation
        const style = document.createElement('style');
        style.textContent = `
                    @keyframes notificationSlideOut {
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
        document.head.appendChild(style);
        setTimeout(() => document.head.removeChild(style), 500);
    }

    loadTasks() {
        try {
            const tasks = localStorage.getItem('modernTodoTasks');
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('modernTodoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showError('Failed to save tasks! 😞');
        }
    }
}

// Add completion and incompletion pulse animations
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
            @keyframes completionPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); background: rgba(107, 207, 127, 0.2); }
                100% { transform: scale(1); }
            }
            @keyframes incompletePulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); background: rgba(255, 255, 255, 0.1); }
                100% { transform: scale(1); }
            }
        `;
document.head.appendChild(additionalStyles);

// Initialize the modern app
const todoApp = new ModernTodoApp();

// Add some welcome animations
window.addEventListener('load', () => {
    // Animate elements on load
    const elements = document.querySelectorAll('.slide-in-left, .slide-in-right');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
    });
});