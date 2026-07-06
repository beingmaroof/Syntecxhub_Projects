/**
 * Syntecxhub - Project 1: Quiz App
 * Pure Vanilla JavaScript implementation of score tracking,
 * state management, safe textContent mutations, and decoupling design standards.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // QUESTIONS DATABASE
    // ==========================================================================
    const quizQuestions = [
        {
            question: "Which HTML5 element is used to define semantically important navigation links?",
            options: [
                "<links>",
                "<navigation>",
                "<menu>",
                "<nav>"
            ],
            answerIndex: 3 // "<nav>"
        },
        {
            question: "What CSS layout model is designed for one-dimensional layouts (either a single row or a single column)?",
            options: [
                "CSS Grid",
                "Flexbox",
                "Position Relative",
                "Table Layout"
            ],
            answerIndex: 1 // "Flexbox"
        },
        {
            question: "How do you select all DOM elements with the class name 'js-button' in modern JavaScript?",
            options: [
                "document.getElementById('js-button')",
                "document.querySelector('.js-button')",
                "document.querySelectorAll('.js-button')",
                "document.getElementByClassName('js-button')"
            ],
            answerIndex: 2 // "document.querySelectorAll('.js-button')"
        },
        {
            question: "Which of the following is the secure, standard property to set text content in the DOM and avoid XSS vulnerabilities?",
            options: [
                "innerHTML",
                "outerHTML",
                "innerText",
                "textContent"
            ],
            answerIndex: 3 // "textContent"
        },
        {
            question: "What does the CSS media query breakpoint '@media (min-width: 768px)' target?",
            options: [
                "Screens that are 768px wide or smaller",
                "Screens that are 768px wide or larger",
                "Only screens exactly 768px wide",
                "Portrait phone orientations only"
            ],
            answerIndex: 1 // "Screens that are 768px wide or larger"
        }
    ];

    // ==========================================================================
    // STATE DEFINITION
    // ==========================================================================
    const state = {
        currentQuestionIndex: 0,
        score: 0,
        selectedAnswerIndex: null,
        hasSubmitted: false
    };

    // ==========================================================================
    // DOM REFERENCES (Using strict js- prefix naming convention)
    // ==========================================================================
    const quizCard = document.querySelector('.js-quiz-card');
    const resultsCard = document.querySelector('.js-results-card');
    
    const progressBar = document.querySelector('.js-progress-bar');
    const currentQuestionNumEl = document.querySelector('.js-current-question-num');
    const totalQuestionsNumEl = document.querySelector('.js-total-questions-num');
    
    const questionTextEl = document.querySelector('.js-question-text');
    const optionsContainer = document.querySelector('.js-options-container');
    
    const submitBtn = document.querySelector('.js-submit-btn');
    const nextBtn = document.querySelector('.js-next-btn');
    const restartBtn = document.querySelector('.js-restart-btn');
    
    const finalScoreEl = document.querySelector('.js-final-score');
    const resultsTotalEl = document.querySelector('.js-results-total');
    const feedbackMsgEl = document.querySelector('.js-feedback-msg');
    const correctCountEl = document.querySelector('.js-correct-count');

    // Set static count totals
    if (totalQuestionsNumEl) {
        totalQuestionsNumEl.textContent = quizQuestions.length.toString();
    }
    if (resultsTotalEl) {
        resultsTotalEl.textContent = quizQuestions.length.toString();
    }

    // ==========================================================================
    // CORE FUNCTIONS (IPO Loop)
    // ==========================================================================

    // OUTPUT: Load and render current question details
    const loadQuestion = () => {
        // Reset answer tracking states
        state.selectedAnswerIndex = null;
        state.hasSubmitted = false;

        const currentQuestion = quizQuestions[state.currentQuestionIndex];

        // 1. Update progress bar width
        const progressPercentage = (state.currentQuestionIndex / quizQuestions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // 2. Update Question Number Tracker Text
        currentQuestionNumEl.textContent = (state.currentQuestionIndex + 1).toString();

        // 3. Set Question Text (Safe Mutation)
        questionTextEl.textContent = currentQuestion.question;

        // 4. Empty options container and render new options
        optionsContainer.textContent = '';
        currentQuestion.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.classList.add('option-btn');
            btn.textContent = option;
            
            // Handle option selection click (Input)
            btn.addEventListener('click', () => selectOption(index, btn));
            
            optionsContainer.appendChild(btn);
        });

        // 5. Reset controller button states
        submitBtn.classList.remove('is-hidden');
        submitBtn.classList.add('is-disabled');
        submitBtn.setAttribute('disabled', 'true');
        
        nextBtn.classList.add('is-hidden');
        nextBtn.classList.remove('is-disabled');
        nextBtn.removeAttribute('disabled');
    };

    // PROCESS & OUTPUT: Handles option selection
    const selectOption = (index, buttonEl) => {
        if (state.hasSubmitted) return;

        state.selectedAnswerIndex = index;

        // Visual state updates (Toggle selected classes)
        const optionButtons = optionsContainer.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => btn.classList.remove('is-selected'));
        buttonEl.classList.add('is-selected');

        // Enable Submit button
        submitBtn.classList.remove('is-disabled');
        submitBtn.removeAttribute('disabled');
    };

    // PROCESS: Evaluates answer correctness and updates score
    const evaluateAnswer = () => {
        state.hasSubmitted = true;
        const currentQuestion = quizQuestions[state.currentQuestionIndex];
        const isCorrect = state.selectedAnswerIndex === currentQuestion.answerIndex;

        if (isCorrect) {
            state.score++;
        }

        // OUTPUT: Apply correct / incorrect styles and block option elements
        const optionButtons = optionsContainer.querySelectorAll('.option-btn');
        optionButtons.forEach((btn, index) => {
            btn.classList.remove('is-selected');
            btn.classList.add('is-disabled'); // Block further clicks

            if (index === currentQuestion.answerIndex) {
                btn.classList.add('is-correct'); // Green styling
            } else if (index === state.selectedAnswerIndex) {
                btn.classList.add('is-incorrect'); // Red styling
            }
        });

        // Toggle action buttons
        submitBtn.classList.add('is-hidden');
        nextBtn.classList.remove('is-hidden');
        
        // Focus on next action button for accessible keyboard navigation
        nextBtn.focus();
    };

    // PROCESS: Transitions to next slide or triggers scorecard
    const transitionQuestion = () => {
        state.currentQuestionIndex++;

        if (state.currentQuestionIndex < quizQuestions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    };

    // OUTPUT: Displays final results dialog
    const showResults = () => {
        // Complete the progress bar fill
        progressBar.style.width = '100%';

        // Toggle card visibilities
        quizCard.classList.add('is-hidden');
        resultsCard.classList.remove('is-hidden');

        // Update score indicators using safe textContent mutations
        finalScoreEl.textContent = state.score.toString();
        correctCountEl.textContent = state.score.toString();

        // Calculate and render performance feedback
        const passingScore = Math.ceil(quizQuestions.length * 0.6); // 60% pass rule
        if (state.score === quizQuestions.length) {
            feedbackMsgEl.textContent = 'Outstanding! Perfect score! 🌟';
        } else if (state.score >= passingScore) {
            feedbackMsgEl.textContent = 'Great job! You passed the test! 👍';
        } else {
            feedbackMsgEl.textContent = 'Keep practicing! You can do better! 📚';
        }
        
        restartBtn.focus();
    };

    // PROCESS & OUTPUT: Resets the entire tracker state to starting values
    const resetQuiz = () => {
        state.currentQuestionIndex = 0;
        state.score = 0;
        state.selectedAnswerIndex = null;
        state.hasSubmitted = false;

        resultsCard.classList.add('is-hidden');
        quizCard.classList.remove('is-hidden');

        loadQuestion();
    };

    // ==========================================================================
    // ACTION CONTROLLER EVENT ATTACHMENTS
    // ==========================================================================
    if (submitBtn) {
        submitBtn.addEventListener('click', evaluateAnswer);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', transitionQuestion);
    }
    if (restartBtn) {
        restartBtn.addEventListener('click', resetQuiz);
    }

    // Initialize on page load
    loadQuestion();

});
