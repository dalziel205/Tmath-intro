class AdminDashboard {
    constructor() {
        this.initializeCounters();
        this.loadRecentActivity();
        this.setupEventListeners();
    }

    async initializeCounters() {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();
            
            if (response.ok) {
                this.updateCounters(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    }

    updateCounters(data) {
        const counters = document.querySelectorAll('.count');
        const stats = [
            data.totalClasses || 0,
            data.totalTeachers || 0,
            data.totalStudents || 0,
            data.totalSubmissions || 0
        ];

        counters.forEach((counter, index) => {
            counter.textContent = stats[index].toLocaleString();
        });
    }

    async loadRecentActivity() {
        try {
            const response = await fetch('/api/admin/activity?limit=5');
            const data = await response.json();
            
            if (response.ok) {
                this.displayRecentActivity(data.activities);
            }
        } catch (error) {
            console.error('Error fetching recent activity:', error);
        }
    }

    displayRecentActivity(activities) {
        const activityList = document.querySelector('.activity-list');
        activityList.innerHTML = '';

        if (activities.length === 0) {
            activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
            return;
        }

        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <span class="material-icons">${this.getActivityIcon(activity.action_type)}</span>
                </div>
                <div class="activity-details">
                    <p class="activity-description">${activity.action_description}</p>
                    <p class="activity-meta">
                        <span class="activity-user">${activity.user_type}: ${activity.user_id}</span>
                        <span class="activity-time">${this.formatTime(activity.created_at)}</span>
                    </p>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }

    getActivityIcon(actionType) {
        const icons = {
            'login': 'login',
            'logout': 'logout',
            'create_class': 'class',
            'create_assignment': 'assignment',
            'submit_assignment': 'upload',
            'grade_assignment': 'grade',
            'add_student': 'person_add',
            'add_teacher': 'school',
            'default': 'info'
        };
        return icons[actionType] || icons.default;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Less than 1 minute
        if (diff < 60000) {
            return 'Just now';
        }
        
        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        
        // Less than 1 day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        
        // Less than 1 week
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        
        // Format as date
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.header-search input');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }

        // Quick action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', this.handleQuickAction.bind(this));
        });
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        // Implement search functionality based on your requirements
        console.log('Searching for:', searchTerm);
    }

    handleQuickAction(event) {
        const action = event.currentTarget.getAttribute('data-action');
        // Handle quick actions based on the action type
        console.log('Quick action:', action);
    }

    // Add more methods as needed for additional functionality
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
}); 