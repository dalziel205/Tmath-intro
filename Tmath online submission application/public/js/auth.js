class Auth {
    constructor() {
        this.roleButtons = document.querySelectorAll('.role-btn');
        this.codeLabel = document.getElementById('codeLabel');
        this.userCodeInput = document.getElementById('userCode');
        this.errorMessage = document.querySelector('.error-message');
        this.currentRole = 'student';
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Role selection
        this.roleButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleRoleChange(e));
        });
        
        // Form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    handleRoleChange(e) {
        e.preventDefault();
        this.roleButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentRole = e.target.dataset.role;
        
        if (this.currentRole === 'student') {
            this.codeLabel.textContent = 'Mã học sinh';
            this.userCodeInput.placeholder = 'Nhập mã học sinh';
        } else {
            this.codeLabel.textContent = 'Mã giáo viên';
            this.userCodeInput.placeholder = 'Nhập mã giáo viên';
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        const userCode = this.userCodeInput.value;
        const password = document.getElementById('password').value;
        
        try {
            const endpoint = this.currentRole === 'teacher' ? '/api/teacher/login' : '/api/student/login';
            const codeField = this.currentRole === 'teacher' ? 'teacher_code' : 'student_code';
            
            const response = await this.sendLoginRequest(endpoint, {
                [codeField]: userCode,
                password: password
            });
            
            if (response.ok) {
                const data = await response.json();
                this.handleSuccessfulLogin(data, userCode);
            } else {
                const data = await response.json();
                this.showError(data.error || 'Sai mã đăng nhập hoặc mật khẩu');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Lỗi kết nối server. Vui lòng thử lại sau.');
        }
    }
    
    async sendLoginRequest(endpoint, data) {
        return await fetch(`http://localhost:3000${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
    }
    
    handleSuccessfulLogin(data, userCode) {
        this.hideError();
        
        const userKey = this.currentRole === 'teacher' ? 'teacher' : 'student';
        sessionStorage.setItem('userRole', this.currentRole);
        sessionStorage.setItem('userData', JSON.stringify(data[userKey]));
        sessionStorage.setItem('userCode', userCode);
        
        if (data.redirect) {
            window.location.href = data.redirect;
        } else {
            window.location.href = this.currentRole === 'teacher' ? '/teacher' : '/student';
        }
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
    }
    
    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
}); 