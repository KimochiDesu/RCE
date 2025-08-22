// ===== CYBERSECURITY E-LEARNING APPLICATION =====
// Frontend JavaScript for managing lessons, quizzes, and user interaction
// This file handles all API communication with the backend server

// ===== GLOBAL STATE MANAGEMENT =====
let currentContent = [];
let currentStep = 0;
let quizData = [];
let currentQuestion = 0;
let userScore = 0;
let userAnswers = [];
let selectedAnswer = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('E-Learning Application Initialized');
    initializeApplication();
});

// ===== MAIN INITIALIZATION FUNCTION =====
async function initializeApplication() {
    try {
        // Load content from server
        await loadContentFromServer();
        
        // Setup event listeners
        setupEventListeners();
        
        // Display first piece of content
        displayCurrentContent();
        
        console.log('Application successfully initialized');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showErrorMessage('Failed to load content. Please refresh the page.');
    }
}

// ===== API COMMUNICATION =====
// Fetch all content (lessons and questions) from the server
async function loadContentFromServer() {
    try {
        console.log('Fetching content from server...');
        
        const response = await fetch('/api/content');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process lessons and questions into a combined content array
        // Following LESSON > QUIZ > LESSON > QUIZ flow
        currentContent = [];
        
        // Add lessons and create quiz sections
        if (data.lessons && data.lessons.length > 0) {
            data.lessons.forEach((lesson, index) => {
                // Add lesson
                currentContent.push({
                    type: 'lesson',
                    id: lesson.id,
                    title: lesson.title,
                    content: lesson.content
                });
                
                // Add quiz after each lesson (if questions available)
                if (data.questions && data.questions.length > 0) {
                    // Get questions for this lesson (distribute questions evenly)
                    const questionsPerQuiz = Math.ceil(data.questions.length / data.lessons.length);
                    const startIndex = index * questionsPerQuiz;
                    const endIndex = Math.min(startIndex + questionsPerQuiz, data.questions.length);
                    const lessonQuestions = data.questions.slice(startIndex, endIndex);
                    
                    if (lessonQuestions.length > 0) {
                        currentContent.push({
                            type: 'quiz',
                            title: `Quiz: ${lesson.title}`,
                            questions: lessonQuestions
                        });
                    }
                }
            });
        }
        
        // Store all quiz data for later use
        quizData = data.questions || [];
        
        console.log(`Loaded ${currentContent.length} content items`);
        console.log(`Loaded ${quizData.length} quiz questions`);
        
    } catch (error) {
        console.error('Error loading content:', error);
        throw error;
    }
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', previousContent);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextContent);
    }
    
    // Quiz-specific event listeners
    const submitAnswerBtn = document.getElementById('submitAnswer');
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const finishQuizBtn = document.getElementById('finishQuiz');
    
    if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener('click', submitQuizAnswer);
    }
    
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', nextQuizQuestion);
    }
    
    if (finishQuizBtn) {
        finishQuizBtn.addEventListener('click', finishQuiz);
    }
    
    console.log('Event listeners configured');
}

// ===== CONTENT DISPLAY MANAGEMENT =====
// Display the current content item (lesson or quiz)
function displayCurrentContent() {
    if (currentContent.length === 0) {
        showErrorMessage('No content available. Please contact the administrator.');
        return;
    }
    
    const contentItem = currentContent[currentStep];
    const mainContent = document.getElementById('mainContent');
    const navigation = document.getElementById('navigation');
    
    if (!contentItem) {
        console.error('Invalid content step:', currentStep);
        return;
    }
    
    // Show navigation
    navigation.style.display = 'flex';
    
    // Update progress bar
    updateProgressBar();
    
    // Update navigation state
    updateNavigationButtons();
    
    // Update step indicator
    const currentStepElement = document.getElementById('currentStep');
    if (currentStepElement) {
        currentStepElement.textContent = `${currentStep + 1} / ${currentContent.length}`;
    }
    
    // Display content based on type
    if (contentItem.type === 'lesson') {
        displayLesson(contentItem, mainContent);
    } else if (contentItem.type === 'quiz') {
        displayQuiz(contentItem);
    }
    
    console.log(`Displaying content step ${currentStep + 1}: ${contentItem.type}`);
}

// ===== LESSON DISPLAY =====
function displayLesson(lesson, container) {
    const lessonHTML = `
        <div class="lesson">
            <h2>${lesson.title}</h2>
            <div class="lesson-content">
                <p>${lesson.content}</p>
            </div>
        </div>
    `;
    
    container.innerHTML = lessonHTML;
    
    // Hide quiz overlay if visible
    const quizOverlay = document.getElementById('quizOverlay');
    if (quizOverlay) {
        quizOverlay.style.display = 'none';
    }
}

// ===== QUIZ DISPLAY AND MANAGEMENT =====
function displayQuiz(quizContent) {
    // Reset quiz state
    currentQuestion = 0;
    userScore = 0;
    userAnswers = [];
    selectedAnswer = null;
    
    // Update quiz data for this quiz
    quizData = quizContent.questions;
    
    // Show quiz overlay
    const quizOverlay = document.getElementById('quizOverlay');
    const quizTitle = document.getElementById('quizTitle');
    const totalQuestions = document.getElementById('totalQuestions');
    
    if (quizOverlay && quizTitle && totalQuestions) {
        quizOverlay.style.display = 'flex';
        quizTitle.textContent = quizContent.title;
        totalQuestions.textContent = quizData.length;
    }
    
    // Display first question
    displayQuizQuestion();
    
    console.log(`Starting quiz: ${quizContent.title} with ${quizData.length} questions`);
}

// Display current quiz question
function displayQuizQuestion() {
    if (!quizData || currentQuestion >= quizData.length) {
        console.error('Invalid quiz question index:', currentQuestion);
        return;
    }
    
    const question = quizData[currentQuestion];
    const quizContent = document.getElementById('quizContent');
    const submitBtn = document.getElementById('submitAnswer');
    const nextBtn = document.getElementById('nextQuestion');
    const finishBtn = document.getElementById('finishQuiz');
    
    // Create question HTML
    const questionHTML = `
        <div class="question">
            <h3>Question ${currentQuestion + 1} of ${quizData.length}</h3>
            <p>${question.question}</p>
            <div class="options" id="questionOptions">
                ${question.options.map((option, index) => `
                    <label class="option" data-index="${index}">
                        <input type="radio" name="answer" value="${index}">
                        <span>${String.fromCharCode(65 + index)}. ${option}</span>
                    </label>
                `).join('')}
            </div>
            <div id="questionFeedback" class="question-feedback" style="display: none;"></div>
        </div>
    `;
    
    quizContent.innerHTML = questionHTML;
    
    // Add event listeners to options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            // Remove previous selections
            options.forEach(opt => opt.classList.remove('selected'));
            
            // Select this option
            this.classList.add('selected');
            const radioInput = this.querySelector('input[type="radio"]');
            radioInput.checked = true;
            selectedAnswer = parseInt(this.dataset.index);
            
            // Show submit button
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
            }
        });
    });
    
    // Reset button visibility
    if (submitBtn) submitBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (finishBtn) finishBtn.style.display = 'none';
    
    selectedAnswer = null;
    
    console.log(`Displaying question ${currentQuestion + 1}: ${question.question}`);
}

// ===== QUIZ INTERACTION HANDLERS =====
function submitQuizAnswer() {
    if (selectedAnswer === null) {
        alert('Please select an answer before submitting.');
        return;
    }
    
    const question = quizData[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;
    
    // Update score
    if (isCorrect) {
        userScore++;
    }
    
    // Store user's answer
    userAnswers[currentQuestion] = selectedAnswer;
    
    // Update score display
    const scoreElement = document.getElementById('quizScore');
    if (scoreElement) {
        scoreElement.textContent = userScore;
    }
    
    // Show feedback
    showQuestionFeedback(isCorrect, question);
    
    // Update button visibility
    const submitBtn = document.getElementById('submitAnswer');
    const nextBtn = document.getElementById('nextQuestion');
    const finishBtn = document.getElementById('finishQuiz');
    
    if (submitBtn) submitBtn.style.display = 'none';
    
    if (currentQuestion < quizData.length - 1) {
        if (nextBtn) nextBtn.style.display = 'inline-block';
    } else {
        if (finishBtn) finishBtn.style.display = 'inline-block';
    }
    
    // Disable all options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        const input = option.querySelector('input');
        input.disabled = true;
        option.style.cursor = 'not-allowed';
        
        // Highlight correct and incorrect answers
        const optionIndex = parseInt(option.dataset.index);
        if (optionIndex === question.correct) {
            option.classList.add('correct');
        } else if (optionIndex === selectedAnswer && !isCorrect) {
            option.classList.add('incorrect');
        }
    });
    
    console.log(`Answer submitted: ${selectedAnswer}, Correct: ${isCorrect}`);
}

function showQuestionFeedback(isCorrect, question) {
    const feedbackElement = document.getElementById('questionFeedback');
    if (!feedbackElement) return;
    
    const feedbackHTML = `
        <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
            <strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</strong>
            <p>${isCorrect ? 'Well done!' : `The correct answer is: ${String.fromCharCode(65 + question.correct)}. ${question.options[question.correct]}`}</p>
        </div>
    `;
    
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.style.display = 'block';
}

function nextQuizQuestion() {
    currentQuestion++;
    if (currentQuestion < quizData.length) {
        displayQuizQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    const quizContent = document.getElementById('quizContent');
    const percentage = Math.round((userScore / quizData.length) * 100);
    
    // Determine performance message
    let performanceClass = '';
    let performanceMessage = '';
    
    if (percentage >= 90) {
        performanceClass = 'score-excellent';
        performanceMessage = '🎉 Excellent work! You have mastered this topic.';
    } else if (percentage >= 70) {
        performanceClass = 'score-good';
        performanceMessage = '👍 Good job! You have a solid understanding.';
    } else if (percentage >= 50) {
        performanceClass = 'score-fair';
        performanceMessage = '📚 Fair performance. Consider reviewing the material.';
    } else {
        performanceClass = 'score-poor';
        performanceMessage = '📖 You may want to review the lesson material again.';
    }
    
    const resultsHTML = `
        <div class="quiz-results">
            <h2>Quiz Complete!</h2>
            <div class="final-score ${performanceClass}">
                ${userScore} / ${quizData.length} (${percentage}%)
            </div>
            <p>${performanceMessage}</p>
            <button class="quiz-btn" onclick="closeQuiz()">Continue Learning</button>
        </div>
    `;
    
    quizContent.innerHTML = resultsHTML;
    
    // Hide action buttons
    const submitBtn = document.getElementById('submitAnswer');
    const nextBtn = document.getElementById('nextQuestion');
    const finishBtn = document.getElementById('finishQuiz');
    
    if (submitBtn) submitBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (finishBtn) finishBtn.style.display = 'none';
    
    console.log(`Quiz completed! Score: ${userScore}/${quizData.length} (${percentage}%)`);
}

// Close quiz overlay and return to main content
function closeQuiz() {
    const quizOverlay = document.getElementById('quizOverlay');
    if (quizOverlay) {
        quizOverlay.style.display = 'none';
    }
    
    // Move to next content item
    nextContent();
}

// ===== NAVIGATION FUNCTIONS =====
function previousContent() {
    if (currentStep > 0) {
        currentStep--;
        displayCurrentContent();
        console.log(`Navigated to step ${currentStep + 1}`);
    }
}

function nextContent() {
    if (currentStep < currentContent.length - 1) {
        currentStep++;
        displayCurrentContent();
        console.log(`Navigated to step ${currentStep + 1}`);
    } else {
        // Reached the end
        showCompletionMessage();
    }
}

// ===== UI UPDATE FUNCTIONS =====
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((currentStep + 1) / currentContent.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentStep === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentStep >= currentContent.length - 1;
        nextBtn.textContent = currentStep >= currentContent.length - 1 ? 'Complete' : 'Next →';
    }
}

// ===== COMPLETION AND ERROR HANDLING =====
function showCompletionMessage() {
    const mainContent = document.getElementById('mainContent');
    
    const completionHTML = `
        <div class="completion-message">
            <h2>🎉 Congratulations!</h2>
            <p>You have successfully completed the Cybersecurity Fundamentals course!</p>
            <div class="completion-stats">
                <h3>Course Summary:</h3>
                <ul>
                    <li>Total Content Items: ${currentContent.length}</li>
                    <li>Lessons Completed: ${currentContent.filter(item => item.type === 'lesson').length}</li>
                    <li>Quizzes Completed: ${currentContent.filter(item => item.type === 'quiz').length}</li>
                </ul>
            </div>
            <button class="nav-btn" onclick="restartCourse()">Start Over</button>
        </div>
    `;
    
    mainContent.innerHTML = completionHTML;
    
    console.log('Course completed!');
}

function restartCourse() {
    currentStep = 0;
    displayCurrentContent();
}

function showErrorMessage(message) {
    const mainContent