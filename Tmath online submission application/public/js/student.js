class StudentDashboard {
    constructor() {
        this.initializeCounters();
        this.loadUpcomingAssignments();
        this.loadRecentGrades();
        this.loadClassSchedule();
        this.setupEventListeners();
    }

    async initializeCounters() {
        try {
            const response = await fetch('/api/student/stats');
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
            data.enrolledClasses || 0,
            data.pendingAssignments || 0,
            data.submittedWork || 0,
            data.averageGrade || '0.0'
        ];

        counters.forEach((counter, index) => {
            counter.textContent = stats[index].toLocaleString();
        });
    }

    async loadUpcomingAssignments() {
        try {
            const response = await fetch('/api/student/assignments/upcoming');
            const data = await response.json();
            
            if (response.ok) {
                this.displayUpcomingAssignments(data.assignments);
            }
        } catch (error) {
            console.error('Error fetching upcoming assignments:', error);
        }
    }

    displayUpcomingAssignments(assignments) {
        const tbody = document.querySelector('.assignments-table tbody');
        tbody.innerHTML = '';

        if (assignments.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="5" class="text-center">No upcoming assignments</td>';
            tbody.appendChild(tr);
            return;
        }

        assignments.forEach(assignment => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${assignment.title}</td>
                <td>${assignment.class_name}</td>
                <td>${this.formatDate(assignment.due_date)}</td>
                <td><span class="status-badge ${assignment.status.toLowerCase()}">${assignment.status}</span></td>
                <td>
                    <button class="submit-btn" data-id="${assignment.id}">
                        <span class="material-icons">upload_file</span>
                        Submit
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to submit buttons
        const submitButtons = tbody.querySelectorAll('.submit-btn');
        submitButtons.forEach(button => {
            button.addEventListener('click', () => {
                const assignmentId = button.dataset.id;
                window.location.href = `/student/assignments/${assignmentId}/submit`;
            });
        });
    }

    async loadRecentGrades() {
        try {
            const response = await fetch('/api/student/grades/recent');
            const data = await response.json();
            
            if (response.ok) {
                this.displayRecentGrades(data.grades);
            }
        } catch (error) {
            console.error('Error fetching recent grades:', error);
        }
    }

    displayRecentGrades(grades) {
        const gradesList = document.querySelector('.grades-list');
        gradesList.innerHTML = '';

        if (grades.length === 0) {
            gradesList.innerHTML = '<p class="no-grades">No recent grades</p>';
            return;
        }

        grades.forEach(grade => {
            const gradeCard = document.createElement('div');
            gradeCard.className = 'grade-card';
            gradeCard.innerHTML = `
                <div class="grade-info">
                    <h4>${grade.assignment_title}</h4>
                    <p>${grade.class_name}</p>
                </div>
                <div class="grade-score">
                    <span class="score">${grade.score}</span>
                    <span class="total">/${grade.total_points}</span>
                </div>
                <div class="grade-feedback">
                    <p>${grade.feedback || 'No feedback provided'}</p>
                </div>
                <div class="grade-meta">
                    <span class="graded-by">Graded by: ${grade.graded_by}</span>
                    <span class="graded-at">${this.formatTime(grade.graded_at)}</span>
                </div>
            `;
            gradesList.appendChild(gradeCard);
        });
    }

    async loadClassSchedule() {
        try {
            const response = await fetch('/api/student/classes/schedule');
            const data = await response.json();
            
            if (response.ok) {
                this.displayClassSchedule(data.schedule);
            }
        } catch (error) {
            console.error('Error fetching class schedule:', error);
        }
    }

    displayClassSchedule(schedule) {
        const timeline = document.querySelector('.schedule-timeline');
        timeline.innerHTML = '';

        if (schedule.length === 0) {
            timeline.innerHTML = '<p class="no-schedule">No upcoming classes</p>';
            return;
        }

        schedule.forEach(classItem => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-time">
                    <span class="day">${this.formatDay(classItem.schedule_time)}</span>
                    <span class="time">${this.formatTimeOnly(classItem.schedule_time)}</span>
                </div>
                <div class="timeline-content">
                    <h4>${classItem.class_name}</h4>
                    <p>${classItem.teacher_name}</p>
                    <span class="location">${classItem.location || 'Online'}</span>
                </div>
            `;
            timeline.appendChild(timelineItem);
        });
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDay(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long'
        });
    }

    formatTimeOnly(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
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
        return this.formatDate(timestamp);
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.header-search input');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }

        // Notifications
        const notificationsIcon = document.querySelector('.notifications');
        if (notificationsIcon) {
            notificationsIcon.addEventListener('click', this.handleNotifications.bind(this));
        }

        // Quick Links
        const quickLinks = document.querySelectorAll('.quick-link');
        quickLinks.forEach(link => {
            link.addEventListener('click', this.handleQuickLink.bind(this));
        });
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        // Implement search functionality
        console.log('Searching for:', searchTerm);
    }

    handleNotifications() {
        // Implement notifications functionality
        console.log('Opening notifications');
    }

    handleQuickLink(event) {
        const link = event.currentTarget;
        const action = link.getAttribute('href').split('/').pop();
        
        switch (action) {
            case 'enroll':
                // Handle class enrollment
                break;
            case 'pending':
                // Handle pending assignments
                break;
            case 'report':
                // Handle grade report
                break;
            case 'help':
                // Handle help section
                break;
        }
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudentDashboard();
}); 