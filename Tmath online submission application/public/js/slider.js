// Slider class để quản lý tất cả các slider
class Slider {
    constructor(options) {
        this.currentIndex = 1;
        this.isAnimating = false;
        this.totalSlides = options.totalSlides;
        this.slideSelector = options.slideSelector;
        this.dotSelector = options.dotSelector;
        this.container = options.container;
        
        // Khởi tạo slide đầu tiên
        this.initializeFirstSlide();
    }

    moveSlide(n) {
        if (!this.isAnimating) {
            let nextIndex = this.currentIndex + n;
            if (nextIndex > this.totalSlides) nextIndex = 1;
            if (nextIndex < 1) nextIndex = this.totalSlides;
            this.showSlide(nextIndex);
        }
    }

    currentSlide(n) {
        if (!this.isAnimating && this.currentIndex !== n) {
            this.showSlide(n);
        }
    }

    showSlide(n) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const slides = document.querySelectorAll(`${this.container} ${this.slideSelector}`);
        const dots = document.querySelectorAll(`${this.container} ${this.dotSelector}`);
        const oldIndex = this.currentIndex;
        
        // Update dots
        dots.forEach(dot => dot.classList.remove('active'));
        dots[n-1].classList.add('active');

        // Reset all slides except current and next
        slides.forEach((slide, index) => {
            if (index + 1 !== oldIndex && index + 1 !== n) {
                slide.style.visibility = 'hidden';
                slide.style.transform = 'translateX(100%)';
            }
        });

        const oldSlide = slides[oldIndex - 1];
        const newSlide = slides[n - 1];

        // Make both slides visible
        oldSlide.style.visibility = 'visible';
        newSlide.style.visibility = 'visible';

        // Set initial positions
        if (n > oldIndex) {
            newSlide.style.transform = 'translateX(100%)';
            
            // Force reflow
            newSlide.offsetHeight;
            
            // Animate
            oldSlide.style.transform = 'translateX(-100%)';
            newSlide.style.transform = 'translateX(0)';
        } else {
            newSlide.style.transform = 'translateX(-100%)';
            
            // Force reflow
            newSlide.offsetHeight;
            
            // Animate
            oldSlide.style.transform = 'translateX(100%)';
            newSlide.style.transform = 'translateX(0)';
        }

        this.currentIndex = n;

        // Reset after animation
        setTimeout(() => {
            slides.forEach((slide, index) => {
                if (index + 1 !== this.currentIndex) {
                    slide.style.visibility = 'hidden';
                }
            });
            this.isAnimating = false;
        }, 500);
    }

    initializeFirstSlide() {
        const slides = document.querySelectorAll(`${this.container} ${this.slideSelector}`);
        const firstSlide = slides[0];
        firstSlide.style.transform = 'translateX(0)';
        firstSlide.style.visibility = 'visible';
    }
}

// Khởi tạo các slider khi trang đã load
document.addEventListener('DOMContentLoaded', () => {
    // Slider cho phần Class
    const classSlider = new Slider({
        totalSlides: 4,
        slideSelector: '.slide',
        dotSelector: '.dot',
        container: '.class-slider'
    });

    // Slider cho phần Rewards
    const rewardSlider = new Slider({
        totalSlides: 6,
        slideSelector: '.reward-slide',
        dotSelector: '.dot',
        container: '.reward-slider'
    });

    // Gán các hàm xử lý sự kiện vào window để có thể gọi từ HTML
    window.moveSlide = (n) => classSlider.moveSlide(n);
    window.currentSlide = (n) => classSlider.currentSlide(n);
    window.moveRewardSlide = (n) => rewardSlider.moveSlide(n);
    window.currentRewardSlide = (n) => rewardSlider.currentSlide(n);
}); 