// ===== CYBERSECURITY E-LEARNING INTERACTIVE SYSTEM =====
// This script handles slide navigation, quiz functionality, and user progress tracking

// ===== STATE MANAGEMENT =====
// Global state object to track user progress and current position
const appState = {
    currentSlide: 1,
    totalSlides: 6,
    quizScore: 0,
    currentQuestion: 0,
    userAnswers: [],
    quizCompleted: false,
    questionAttempts: [] // Track attempts per question
};

// ===== QUIZ DATA STRUCTURE =====
// Quiz questions with options, correct answers, and explanations
const quizData = [
    {
        question: "Which of the following BEST describes Confidentiality in the CIA Triad?",
        options: [
            "Ensuring systems are available 24/7",
            "Protecting information from unauthorized access",
            "Preventing data from being modified",
            "Creating audit trails for all actions"
        ],
        correct: 1,
        explanation: {
            correct: "Confidentiality is about keeping sensitive information secret and ensuring only authorized individuals can access it. This includes using encryption, access controls, and data classification.",
            incorrect: "Confidentiality specifically deals with protecting information from unauthorized access, not system availability, data modification, or audit trails."
        }
    },
    {
        question: "What does Integrity in cybersecurity primarily protect against?",
        options: [
            "Unauthorized viewing of data",
            "System downtime and outages",
            "Unauthorized modification of data",
            "Users denying their actions"
        ],
        correct: 2,
        explanation: {
            correct: "Integrity ensures that data remains accurate, complete, and unchanged. It protects against unauthorized modifications through methods like digital signatures, checksums, and version control.",
            incorrect: "While the other options are important security concerns, Integrity specifically focuses on protecting data from unauthorized changes or tampering."
        }
    },
    {
        question: "Non-Repudiation is MOST important in which scenario?",
        options: [
            "Backing up critical business data",
            "Encrypting sensitive customer information",
            "Proving who sent a digital contract",
            "Ensuring website uptime during peak hours"
        ],
        correct: 2,
        explanation: {
            correct: "Non-Repudiation provides proof of origin and prevents someone from denying they performed an action. Digital contracts are a perfect example where you need to prove who sent or signed the document.",
            incorrect: "Non-Repudiation is about preventing denial of actions, not data backup, encryption, or system availability. It's specifically about accountability and proof."
        }
    }
];

// ===== DOM ELEMENTS =====
// Get references to key DOM elements for manipulation
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slideCounter = document.getElementById('slideCounter');
const progressBar = document.getElementById('progressBar');
const slides = document.querySelectorAll('.slide');

// ===== INITIALIZATION =====
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cybersecurity E-Learning System Initialized');
    updateUI();
    setupEventListeners();
});

// ===== EVENT LISTENERS =====
// Set up all interactive event listeners
function setupEventListeners() {
    // Navigation button event listeners
    prevBtn.addEventListener('click', () => navigateSlide(-1));
    nextBtn.addEventListener('click', () => navigateSlide(1));
    
    // Keyboard navigation support
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    console.log('Event listeners configured');
}

// ===== KEYBOARD NAVIGATION =====
// Handle keyboard navigation (arrow keys)
function handleKeyboardNavigation(event) {
    switch(event.key) {
        case 'ArrowLeft':
            if (appState.currentSlide > 1) navigateSlide(-1);
            break;
        case 'ArrowRight':
            if (appState.currentSlide < appState.totalSlides) navigateSlide(1);
            break;
    }
}

// ===== SLIDE NAVIGATION SYSTEM =====
// Navigate between slides with smooth transitions
function navigateSlide(direction) {
    const newSlide = appState.currentSlide + direction;
    
    // Validate slide boundaries
    if (newSlide < 1 || newSlide > appState.totalSlides) {
        console.warn('Navigation blocked: Out of bounds');
        return;
    }
    
    // Special handling for quiz slide
    if (newSlide === 6) {
        initializeQuiz();
    }
    
    // Update state and UI
    appState.currentSlide = newSlide;
    updateSlideDisplay();
    updateUI();
    
    console.log(`Navigated to slide ${appState.currentSlide}`);
}

// ===== SLIDE DISPLAY MANAGEMENT =====
// Update the visual display of slides with transitions
function updateSlideDisplay() {
    slides.forEach((slide, index) => {
        const slideNumber = index + 1;
        
        // Remove all transition classes
        slide.classList.remove('active', 'prev');
        
        if (slideNumber === appState.currentSlide) {
            // Current slide
            slide.classList.add('active');
        } else if (slideNumber < appState.currentSlide) {
            // Previous slides
            slide.classList.add('prev');
        }
        // Future slides have no special class (default translateX(100%))
    });
}

// ===== UI STATE UPDATES =====
// Update navigation controls, progress bar, and slide counter
function updateUI() {
    // Update navigation buttons
    prevBtn.disabled = appState.currentSlide === 1;
    nextBtn.disabled = appState.currentSlide === appState.totalSlides;
    
    // Update slide counter
    slideCounter.textContent = `${appState.currentSlide} / ${appState.totalSlides}`;
    
    // Update progress bar
    const progressPercent = (appState.currentSlide / appState.totalSlides) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Update navigation button text for quiz completion
    if (appState.currentSlide === appState.totalSlides && appState.quizCompleted) {
        nextBtn.textContent = 'Complete';
    } else {
        nextBtn.textContent = 'Next →';
    }
}

// ===== QUIZ INITIALIZATION =====
// Set up the quiz when user reaches the quiz slide
function initializeQuiz() {
    console.log('Initializing quiz system');
    
    // Reset quiz state if retaking
    if (appState.quizCompleted) {
        resetQuiz();
    }
    
    // Initialize tracking arrays
    if (appState.questionAttempts.length === 0) {
        appState.questionAttempts = new Array(quizData.length).fill(0);
    }
    
    // Display first question
    displayQuestion();
}

// ===== QUIZ QUESTION DISPLAY =====
// Render the current quiz question with options
function displayQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    const currentQuizData = quizData[appState.currentQuestion];
    
    // Clear existing content
    questionContainer.innerHTML = '';
    
    // Create question HTML structure
    const questionHTML = `
        <div class="question-box">
            <h3 class="question-text">
                Question ${appState.currentQuestion + 1} of ${quizData.length}
            </h3>
            <p class="question-text">${currentQuizData.question}</p>
            <div class="options" id="optionsContainer">
                ${currentQuizData.options.map((option, index) => `
                    <button class="option-btn" onclick="selectAnswer(${index})" id="option-${index}">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </button>
                `).join('')}
            </div>
            <div id="feedback-${appState.currentQuestion}" class="feedback-container">
                <!-- Feedback messages will appear here -->
            </div>
        </div>
    `;
    
    questionContainer.innerHTML = questionHTML;
    console.log(`Displaying question ${appState.currentQuestion + 1}`);
}

// ===== ANSWER SELECTION HANDLER =====
// Process user's answer selection and provide feedback
function selectAnswer(selectedIndex) {
    const currentQuizData = quizData[appState.currentQuestion];
    const correctIndex = currentQuizData.correct;
    const isCorrect = selectedIndex === correctIndex;
    
    // Increment attempt counter
    appState.questionAttempts[appState.currentQuestion]++;
    
    // Store user's answer
    appState.userAnswers[appState.currentQuestion] = selectedIndex;
    
    // Update visual feedback on options
    updateOptionStyles(selectedIndex, correctIndex, isCorrect);
    
    // Display feedback message
    displayFeedback(isCorrect, currentQuizData.explanation);
    
    // Update score if correct
    if (isCorrect) {
        appState.quizScore++;
        updateScoreDisplay();
    }
    
    // Disable all option buttons to prevent multiple selections
    disableAllOptions();
    
    // Schedule next question or complete quiz
    setTimeout(() => {
        proceedToNextQuestion();
    }, 3000); // 3-second delay to read feedback
    
    console.log(`Answer selected: ${selectedIndex}, Correct: ${isCorrect}`);
}

// ===== VISUAL FEEDBACK FOR OPTIONS =====
// Apply visual styling to show correct/incorrect answers
function updateOptionStyles(selectedIndex, correctIndex, isCorrect) {
    const optionButtons = document.querySelectorAll('.option-btn');
    
    // Reset all button styles
    optionButtons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
    });
    
    // Style the selected answer
    if (isCorrect) {
        optionButtons[selectedIndex].classList.add('correct');
    } else {
        optionButtons[selectedIndex].classList.add('incorrect');
        // Also highlight the correct answer
        optionButtons[correctIndex].classList.add('correct');
    }
}

// ===== FEEDBACK MESSAGE DISPLAY =====
// Show explanatory feedback based on user's answer
function displayFeedback(isCorrect, explanation) {
    const feedbackContainer = document.getElementById(`feedback-${appState.currentQuestion}`);
    const feedbackClass = isCorrect ? 'correct' : 'incorrect';
    const feedbackText = isCorrect ? explanation.correct : explanation.incorrect;
    const attemptCount = appState.questionAttempts[appState.currentQuestion];
    
    let feedbackHTML = `
        <div class="feedback-message ${feedbackClass}">
            <strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</strong>
            <p>${feedbackText}</p>
    `;
    
    // Add attempt information if multiple attempts
    if (attemptCount > 1) {
        feedbackHTML += `<p><em>Attempts: ${attemptCount}</em></p>`;
    }
    
    feedbackHTML += '</div>';
    feedbackContainer.innerHTML = feedbackHTML;
}

// ===== OPTION BUTTON MANAGEMENT =====
// Disable all option buttons after selection
function disableAllOptions() {
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
    });
}

// ===== QUIZ PROGRESSION =====
// Move to next question or complete the quiz
function proceedToNextQuestion() {
    if (appState.currentQuestion < quizData.length - 1) {
        // Move to next question
        appState.currentQuestion++;
        displayQuestion();
    } else {
        // Quiz completed
        completeQuiz();
    }
}

// ===== QUIZ COMPLETION =====
// Handle quiz completion and display results
function completeQuiz() {
    appState.quizCompleted = true;
    
    // Hide question container and show results
    document.getElementById('questionContainer').style.display = 'none';
    const resultsContainer = document.getElementById('quizResults');
    resultsContainer.classList.remove('hidden');
    
    // Calculate performance metrics
    const percentage = Math.round((appState.quizScore / quizData.length) * 100);
    const totalAttempts = appState.questionAttempts.reduce((sum, attempts) => sum + attempts, 0);
    
    // Generate performance message
    let performanceMessage = '';
    if (percentage >= 90) {
        performanceMessage = '🎉 Outstanding! You have excellent understanding of cybersecurity fundamentals.';
    } else if (percentage >= 70) {
        performanceMessage = '👍 Good job! You have a solid grasp of the key concepts.';
    } else if (percentage >= 50) {
        performanceMessage = '📚 Not bad, but consider reviewing the material to strengthen your knowledge.';
    } else {
        performanceMessage = '📖 You might want to review the slides again to better understand these important concepts.';
    }
    
    // Update results display
    document.getElementById('finalScore').innerHTML = `
        <div>Final Score: <strong>${appState.quizScore} / ${quizData.length}</strong></div>
        <div>Percentage: <strong>${percentage}%</strong></div>
        <div>Total Attempts: <strong>${totalAttempts}</strong></div>
    `;
    
    document.getElementById('resultMessage').innerHTML = `
        <p>${performanceMessage}</p>
        <p>Great work completing this cybersecurity fundamentals course!</p>
    `;
    
    // Set up retake button
    document.getElementById('retakeQuiz').addEventListener('click', resetQuiz);
    
    // Update navigation
    updateUI();
    
    console.log(`Quiz completed! Score: ${appState.quizScore}/${quizData.length} (${percentage}%)`);
}

// ===== SCORE DISPLAY MANAGEMENT =====
// Update the running score display
function updateScoreDisplay() {
    const scoreElement = document.getElementById('currentScore');
    if (scoreElement) {
        scoreElement.textContent = appState.quizScore;
        
        // Add visual feedback for score increase
        scoreElement.style.transform = 'scale(1.2)';
        scoreElement.style.color = '#22c55e';
        
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
            scoreElement.style.color = '#15803d';
        }, 300);
    }
}

// ===== QUIZ RESET FUNCTIONALITY =====
// Reset quiz state for retaking
function resetQuiz() {
    console.log('Resetting quiz for retake');
    
    // Reset all quiz-related state
    appState.quizScore = 0;
    appState.currentQuestion = 0;
    appState.userAnswers = [];
    appState.quizCompleted = false;
    appState.questionAttempts = new Array(quizData.length).fill(0);
    
    // Reset UI elements
    document.getElementById('currentScore').textContent = '0';
    document.getElementById('questionContainer').style.display = 'block';
    document.getElementById('quizResults').classList.add('hidden');
    
    // Start first question
    displayQuestion();
    updateUI();
}

// ===== PERFORMANCE ANALYTICS =====
// Track and log user performance data
function logPerformanceData() {
    const analyticsData = {
        totalSlides: appState.totalSlides,
        completedSlides: appState.currentSlide,
        quizScore: appState.quizScore,
        totalQuestions: quizData.length,
        questionAttempts: appState.questionAttempts,
        userAnswers: appState.userAnswers,
        timestamp: new Date().toISOString()
    };
    
    console.log('Performance Analytics:', analyticsData);
    
    // In a real application, this data could be sent to a learning management system
    // or analytics platform to track student progress and identify areas for improvement
}

// ===== ERROR HANDLING =====
// Global error handler for graceful failure management
window.addEventListener('error', function(event) {
    console.error('Application Error:', event.error);
    
    // In a production environment, you might want to show a user-friendly error message
    // and potentially report the error to a monitoring service
});

// ===== ACCESSIBILITY ENHANCEMENTS =====
// Ensure the application is accessible to all users
function enhanceAccessibility() {
    // Add ARIA labels to navigation buttons
    prevBtn.setAttribute('aria-label', 'Go to previous slide');
    nextBtn.setAttribute('aria-label', 'Go to next slide');
    
    // Add focus management for better keyboard navigation
    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            const firstFocusable = slide.querySelector('h1, h2, button');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    });
}

// Initialize accessibility enhancements
document.addEventListener('DOMContentLoaded', enhanceAccessibility);

// ===== DEVELOPMENT AND DEBUGGING UTILITIES =====
// Utility functions for development and debugging
if (typeof console !== 'undefined') {
    // Debug function to inspect current state
    window.debugAppState = function() {
        console.table(appState);
        return appState;
    };
    
    // Quick navigation for development
    window.goToSlide = function(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= appState.totalSlides) {
            appState.currentSlide = slideNumber;
            updateSlideDisplay();
            updateUI();
            if (slideNumber === 6) initializeQuiz();
        }
    };
    
    // Quiz debugging
    window.showQuizAnswers = function() {
        quizData.forEach((q, index) => {
            console.log(`Q${index + 1}: ${q.options[q.correct]}`);
        });
    };
}

console.log('🚀 Cybersecurity E-Learning System fully loaded and ready!');