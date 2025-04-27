document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('.section');
    const backButtons = document.querySelectorAll('.back-btn');
    const profileImg = document.querySelector('.profile-img');
    const description = document.querySelector('.description');
    const visitorCountSpan = document.getElementById('visitor-count');
    const container = document.querySelector('.container');
    const typingText = document.querySelector('.typing-text');
    const letters = document.querySelectorAll('.letter');

    // Chatbot Logic
    const chatBubble = document.getElementById('chat-assistant');
    const chatWindow = document.getElementById('chat-window');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const closeBtn = document.querySelector('.close-btn');

    // Initialize chat window as hidden
    window.addEventListener('load', () => {
        chatWindow.classList.add('hidden');
    });

    chatBubble.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        chatWindow.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
        setTimeout(() => chatWindow.classList.add('hidden'), 300);
    });

    chatSend.addEventListener('click', () => {
        const message = chatInput.value.trim().toLowerCase();
        if (message) {
            addMessage('You: ' + message, 'user');
            setTimeout(() => {
                addMessage('Typing...', 'bot-message');
                setTimeout(() => {
                    const response = respond(message);
                    const typingMessage = chatMessages.lastChild;
                    typingMessage.textContent = 'JARVIS: ' + response;
                    typingMessage.classList.remove('typing');
                }, 1000);
            }, 500);
            chatInput.value = '';
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            chatSend.click();
        }
    });

    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = text;
        messageDiv.className = type === 'user' ? 'user-message' : 'bot-message';
        if (type === 'bot-message' && text === 'Typing...') {
            messageDiv.classList.add('typing');
        }
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function respond(message) {
        let response = '';
        message = message.toLowerCase();

        if (message.includes('who is avinash') || message.includes('who are you')) {
            response = 'I am Avinash Singh, a Computer Science student at MIT AOE, passionate about AI and web development!';
        } else if (message.includes('skills') || message.includes('show me your skills')) {
            response = 'I know C (97%), Python (76%), Java (30%), C++ (70%), JavaScript (35%), and SQL (50%). I’m also learning Flask, Git, and APIs!';
        } else if (message.includes('zen planner') || (message.includes('projects') && message.includes('zen'))) {
            response = 'My Zen Planner project helps students manage time and well-being with a focus on productivity and mental health!';
        } else if (message.includes('weather checker') || (message.includes('projects') && message.includes('weather'))) {
            response = 'The Weather Checker Script is a Python project by Avinash that fetches real-time weather data using APIs. Check it out in the Projects section!';
        } else if (message.includes('portfolio website') || (message.includes('projects') && message.includes('portfolio'))) {
            response = 'This very Portfolio Website is Avinash’s project! It’s built with HTML, CSS, and JavaScript, featuring a sleek design and interactive elements.';
        } else if (message.includes('projects') || message.includes('tell me about your project')) {
            response = 'Avinash has worked on projects like Zen Planner, Weather Checker Script, and this Portfolio Website. Ask about a specific project or check the Projects section!';
        } else if (message.includes('contact') || message.includes('how can i contact you')) {
            response = 'You can reach me via email at avinash@example.com or connect on LinkedIn—check the Contact Me section!';
        } else if (message.includes('about') || message.includes('tell me about avinash')) {
            response = 'Avinash Singh is an aspiring AI Engineer and Computer Science student at MIT AOE. He’s passionate about technology, AI, and web development. Learn more in the About Me section!';
        } else if (message.includes('qualifications') || message.includes('education')) {
            response = 'Avinash is pursuing a Computer Science degree at MIT Academy of Engineering (MIT AOE). Check out his academic journey in the Qualifications section!';
        } else if (message.includes('learning goals') || message.includes('what are you learning')) {
            response = 'Avinash is currently learning Flask, Git, and APIs to enhance his web development skills. See his Learning Goals section for more!';
        } else if (message.includes('certificates') || message.includes('certifications')) {
            response = 'Avinash has earned certificates in various domains. You can view them in the Certificates section of his portfolio!';
        } else if (message.includes('social') || message.includes('linkedin') || message.includes('github')) {
            response = 'You can connect with Avinash on LinkedIn or check out his GitHub projects—links are in the Contact Me section!';
        } else if (message.includes('interests') || message.includes('hobbies')) {
            response = 'Avinash is passionate about AI, web development, and exploring new technologies. He also enjoys building projects that solve real-world problems!';
        } else if (message.includes('help') || message.includes('what can you do')) {
            response = 'I’m JARVIS 👾 I can tell you about Avinash, his skills, projects, qualifications, learning goals, certificates, or how to contact him. Just ask!';
        } else {
            response = 'I’m JARVIS 👾 Ask me about Avinash, his skills, projects, or how to contact him!';
        }

        return response;
    }

    // Visitor Counter
    function updateVisitorCount() {
        let count = localStorage.getItem('visitorCount') || 0;
        count = parseInt(count) + 1;
        localStorage.setItem('visitorCount', count);
        
        let current = 0;
        const increment = Math.ceil(count / 30);
        const timer = setInterval(() => {
            current += increment;
            if (current >= count) {
                current = count;
                clearInterval(timer);
            }
            visitorCountSpan.textContent = current;
        }, 30);
    }
    updateVisitorCount();

    // Navigation System
    let currentActiveSection = null;

    function showSection(sectionId) {
        if (!sectionId || typeof sectionId !== 'string') {
            console.warn('Invalid section ID provided:', sectionId);
            container.classList.remove('section-view');
            sections.forEach(section => section.classList.remove('active'));
            navLinks.forEach(link => link.classList.remove('active'));
            currentActiveSection = null;
            return;
        }

        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            console.warn(`Section with ID "${sectionId}" not found`);
            container.classList.remove('section-view');
            sections.forEach(section => section.classList.remove('active'));
            navLinks.forEach(link => link.classList.remove('active'));
            currentActiveSection = null;
            return;
        }

        sections.forEach(section => section.classList.remove('active'));
        targetSection.classList.add('active');
        currentActiveSection = sectionId;

        animateTitleLetters(targetSection);

        if (sectionId === 'skills') {
            animateProgressBars(targetSection);
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });
    }

    function animateTitleLetters(section) {
        const letters = section.querySelectorAll('.title-letter');
        letters.forEach((letter, index) => {
            letter.style.animation = 'none';
            letter.offsetHeight;
            setTimeout(() => {
                letter.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`;
            }, 10);
        });
    }

    function animateProgressBars(section) {
        const progressFills = section.querySelectorAll('.progress-fill');
        progressFills.forEach(fill => {
            fill.style.width = '0';
            fill.offsetHeight;
            const progress = fill.getAttribute('data-progress');
            setTimeout(() => {
                fill.style.width = `${progress}%`;
            }, 500);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href')?.substring(1) || '';
            if (targetId === '') {
                container.classList.remove('section-view');
                sections.forEach(section => section.classList.remove('active'));
                navLinks.forEach(link => link.classList.remove('active'));
                currentActiveSection = null;
            } else {
                container.classList.add('section-view');
                showSection(targetId);
            }
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            container.classList.remove('section-view');
            sections.forEach(section => section.classList.remove('active'));
            navLinks.forEach(link => link.classList.remove('active'));
            currentActiveSection = null;
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            }); // Add scroll to top
        });
    });

    // Interactive Elements
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('glow');
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = this.classList.contains('glow') ? 'scale(1.05)' : 'scale(1)';
            }, 300);
        });
    });

    const timelineItems = document.querySelectorAll('.timeline-content');
    timelineItems.forEach(item => {
        item.addEventListener('click', function() {
            timelineItems.forEach(proj => proj.classList.remove('active'));
            this.classList.add('active');
            this.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
            setTimeout(() => {
                this.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.6)';
            }, 500);
        });
    });

    // Initial Setup
    container.classList.remove('section-view');

    // Name Illumination
    setTimeout(() => {
        letters.forEach(letter => {
            letter.classList.add('illuminated');
        });
    }, 1000);

    // Typing Animation
    const messages = [
        "Hi, I am",
        "Welcome to my digital portfolio",
        "I am currently studying in MIT AOE ",
        "Aspiring AI Engineer|Passionate About Technology🚀",
        "Exploring the World of AI & Software🤖💻"
    ];

    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseBetweenMessages = 2000;

    function type() {
        const currentMessage = messages[messageIndex];
        const displayText = currentMessage.substring(0, charIndex);
        typingText.textContent = displayText;

        if (!isDeleting) {
            if (charIndex < currentMessage.length) {
                charIndex++;
                setTimeout(type, typingSpeed);
            } else {
                setTimeout(() => {
                    isDeleting = true;
                    type();
                }, pauseBetweenMessages);
            }
        } else {
            if (charIndex > 0) {
                charIndex--;
                setTimeout(type, deletingSpeed);
            } else {
                isDeleting = false;
                messageIndex = (messageIndex + 1) % messages.length;
                setTimeout(type, 500);
            }
        }
    }

    type();

    // Scroll Progress Indicator
    const progressBar = document.createElement('div');
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.width = '0';
    progressBar.style.height = '4px';
    progressBar.style.background = '#00FFFF';
    progressBar.style.zIndex = '1001';
    progressBar.style.transition = 'width 0.3s ease';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = `${scrollPercentage}%`;
    });

    // Back to Top Button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.textContent = '↑';
    backToTopBtn.style.position = 'fixed';
    backToTopBtn.style.bottom = '20px';
    backToTopBtn.style.left = '20px';
    backToTopBtn.style.padding = '10px';
    backToTopBtn.style.background = '#00FFFF';
    backToTopBtn.style.border = 'none';
    backToTopBtn.style.borderRadius = '50%';
    backToTopBtn.style.cursor = 'pointer';
    backToTopBtn.style.display = 'none';
    backToTopBtn.style.zIndex = '1001';
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        backToTopBtn.style.display = window.pageYOffset > 200 ? 'block' : 'none';
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Dynamic Greeting
    const greetingDiv = document.createElement('div');
    greetingDiv.style.position = 'fixed';
    greetingDiv.style.bottom = '20px';
    greetingDiv.style.right = '230px';
    greetingDiv.style.padding = '8px 15px';
    greetingDiv.style.background = 'rgba(0, 0, 0, 0.7)';
    greetingDiv.style.borderRadius = '20px';
    greetingDiv.style.color = '#00FFFF';
    greetingDiv.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.2)';
    greetingDiv.style.zIndex = '10';
    document.body.appendChild(greetingDiv);

    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
        greetingDiv.textContent = `${greeting}, Visitor!`;
    }
    updateGreeting();
    setInterval(updateGreeting, 60000);

    // Lazy Loading for Images
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => observer.observe(img));

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        const activeSectionIndex = Array.from(sections).findIndex(section => section.classList.contains('active'));
        const sectionIds = Array.from(navLinks)
            .map(link => link.getAttribute('href')?.substring(1))
            .filter(id => id);

        if (e.key === 'ArrowRight' && activeSectionIndex < sections.length - 1) {
            const nextSectionId = sectionIds[activeSectionIndex + 1];
            container.classList.add('section-view');
            showSection(nextSectionId);
        } else if (e.key === 'ArrowLeft' && activeSectionIndex > 0) {
            const prevSectionId = sectionIds[activeSectionIndex - 1];
            container.classList.add('section-view');
            showSection(prevSectionId);
        } else if (e.key === 'Escape') {
            container.classList.remove('section-view');
            sections.forEach(section => section.classList.remove('active'));
            navLinks.forEach(link => link.classList.remove('active'));
            currentActiveSection = null;
        } else if (e.key === 'Enter' && document.activeElement === chatBubble) {
            chatBubble.click();
        }
    });

    // Make chat bubble focusable
    chatBubble.setAttribute('tabindex', '0');
});