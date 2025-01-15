class TeacherDashboard {
    constructor() {
        this.initializeCounters();
        this.loadRecentSubmissions();
        this.loadClassOverview();
        this.loadUpcomingDeadlines();
        this.setupEventListeners();
    }

    async initializeCounters() {
        try {
            const response = await fetch('/api/teacher/stats');
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
            data.activeClasses || 0,
            data.activeAssignments || 0,
            data.totalStudents || 0,
            data.pendingSubmissions || 0
        ];

        counters.forEach((counter, index) => {
            counter.textContent = stats[index].toLocaleString();
        });
    }

    async loadRecentSubmissions() {
        try {
            const response = await fetch('/api/teacher/submissions/recent');
            const data = await response.json();
            
            if (response.ok) {
                this.displayRecentSubmissions(data.submissions);
            }
        } catch (error) {
            console.error('Error fetching recent submissions:', error);
        }
    }

    displayRecentSubmissions(submissions) {
        const tbody = document.querySelector('.submissions-table tbody');
        tbody.innerHTML = '';

        if (submissions.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="6" class="text-center">No recent submissions</td>';
            tbody.appendChild(tr);
            return;
        }

        submissions.forEach(submission => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="student-info">
                        <span class="student-name">${submission.student_name}</span>
                        <span class="student-code">${submission.student_code}</span>
                    </div>
                </td>
                <td>${submission.assignment_title}</td>
                <td>${submission.class_name}</td>
                <td>${this.formatTime(submission.submitted_at)}</td>
                <td><span class="status-badge ${submission.status}">${submission.status}</span></td>
                <td>
                    <button class="grade-btn" data-id="${submission.id}">
                        <span class="material-icons">grading</span>
                        Grade
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to grade buttons
        const gradeButtons = tbody.querySelectorAll('.grade-btn');
        gradeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const submissionId = button.dataset.id;
                window.location.href = `/teacher/submissions/${submissionId}/grade`;
            });
        });
    }

    async loadClassOverview() {
        try {
            const response = await fetch('/api/teacher/classes/active');
            const data = await response.json();
            
            if (response.ok) {
                this.displayClassOverview(data.classes);
            }
        } catch (error) {
            console.error('Error fetching class overview:', error);
        }
    }

    displayClassOverview(classes) {
        const classList = document.querySelector('.class-list');
        classList.innerHTML = '';

        if (classes.length === 0) {
            classList.innerHTML = '<p class="no-classes">No active classes</p>';
            return;
        }

        classes.forEach(classItem => {
            const classCard = document.createElement('div');
            classCard.className = 'class-card';
            classCard.innerHTML = `
                <div class="class-info">
                    <h3>${classItem.class_name}</h3>
                    <p>${classItem.class_code} | ${classItem.semester} ${classItem.academic_year}</p>
                </div>
                <div class="class-stats">
                    <div class="stat">
                        <span class="material-icons">people</span>
                        <span>${classItem.student_count} Students</span>
                    </div>
                    <div class="stat">
                        <span class="material-icons">assignment</span>
                        <span>${classItem.assignment_count} Assignments</span>
                    </div>
                </div>
                <button class="view-class-btn" onclick="location.href='/teacher/classes/${classItem.id}'">
                    View Class
                </button>
            `;
            classList.appendChild(classCard);
        });
    }

    async loadUpcomingDeadlines() {
        try {
            const response = await fetch('/api/teacher/assignments/upcoming');
            const data = await response.json();
            
            if (response.ok) {
                this.displayUpcomingDeadlines(data.deadlines);
            }
        } catch (error) {
            console.error('Error fetching upcoming deadlines:', error);
        }
    }

    displayUpcomingDeadlines(deadlines) {
        const timeline = document.querySelector('.deadline-timeline');
        timeline.innerHTML = '';

        if (deadlines.length === 0) {
            timeline.innerHTML = '<p class="no-deadlines">No upcoming deadlines</p>';
            return;
        }

        deadlines.forEach(deadline => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-date">
                    <span class="date">${this.formatDate(deadline.due_date)}</span>
                    <span class="time">${this.formatTime(deadline.due_date)}</span>
                </div>
                <div class="timeline-content">
                    <h4>${deadline.assignment_title}</h4>
                    <p>${deadline.class_name}</p>
                    <span class="submissions-count">
                        ${deadline.submission_count}/${deadline.total_students} Submissions
                    </span>
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
        
        // Format as time
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
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

    // Add more methods as needed for additional functionality
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TeacherDashboard();
}); 