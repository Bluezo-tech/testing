
        // DOM Elements
        const loginModal = document.getElementById('loginModal');
        const loginForm = document.getElementById('loginForm');
        const adminLogin = document.getElementById('adminLogin');
        const mainContent = document.getElementById('mainContent');
        const logoutBtn = document.getElementById('logoutBtn');
        const dashboard = document.getElementById('dashboard');
        const examInterface = document.getElementById('examInterface');
        const adminPanel = document.getElementById('adminPanel');
        const timer = document.getElementById('timer');
        const examTimer = document.getElementById('examTimer');
        const questionContainer = document.getElementById('questionContainer');
        const prevQuestion = document.getElementById('prevQuestion');
        const nextQuestion = document.getElementById('nextQuestion');
        const currentQuestion = document.getElementById('currentQuestion');
        const examSubject = document.getElementById('examSubject');
        const studentName = document.getElementById('studentName');
        const adminSubject = document.getElementById('adminSubject');
        const manageQuestions = document.getElementById('manageQuestions');
        const startExamBtns = document.querySelectorAll('.start-exam-btn');

        // Exam Data
        let currentExam = {
            subject: '',
            questions: [],
            currentIndex: 0,
            answers: {},
            timerInterval: null,
            timeLeft: 3600 // 1 hour in seconds
        };

        // Sample Questions (in a real app, these would come from Firebase)
        const questionBank = {
            math: Array(30).fill().map((_, i) => ({
                id: `math-${i+1}`,
                question: `Math Question ${i+1}: What is ${i+1} * ${i+2}?`,
                options: [
                    `${(i+1)*(i+2)}`,
                    `${(i+1)*(i+3)}`,
                    `${(i+2)*(i+3)}`,
                    `${(i+1)*(i+4)}`
                ],
                answer: 0,
                theory: `Explanation for Math Question ${i+1}: The correct answer is ${(i+1)*(i+2)} because...`
            })),
            english: Array(30).fill().map((_, i) => ({
                id: `eng-${i+1}`,
                question: `English Question ${i+1}: Choose the correct grammar for sentence ${i+1}`,
                options: [
                    `Option A for question ${i+1}`,
                    `Option B for question ${i+1}`,
                    `Option C for question ${i+1}`,
                    `Option D for question ${i+1}`
                ],
                answer: i % 4,
                theory: `Explanation for English Question ${i+1}: The correct answer is Option ${String.fromCharCode(65 + (i % 4))} because...`
            })),
            chemistry: Array(30).fill().map((_, i) => ({
                id: `chem-${i+1}`,
                question: `Chemistry Question ${i+1}: What is the chemical formula for compound ${i+1}?`,
                options: [
                    `CH${i+1}`,
                    `C${i+1}H${i+2}`,
                    `C${i+2}H${i+1}`,
                    `C${i+1}H${i+1}`
                ],
                answer: i % 4,
                theory: `Explanation for Chemistry Question ${i+1}: The correct formula is...`
            })),
            government: Array(30).fill().map((_, i) => ({
                id: `gov-${i+1}`,
                question: `Government Question ${i+1}: What is the correct answer for government question ${i+1}?`,
                options: [
                    `Political Option A`,
                    `Political Option B`,
                    `Political Option C`,
                    `Political Option D`
                ],
                answer: i % 4,
                theory: `Explanation for Government Question ${i+1}: The correct answer is...`
            }))
        };

        // Login Functionality
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'STUDENT' && password === 'PASS123') {
                // Student login
                studentName.textContent = 'Student';
                loginModal.classList.add('hidden');
                mainContent.classList.remove('hidden');
                dashboard.classList.remove('hidden');
            } else if (username === 'admin' && password === 'enzo@738319') {
                // Admin login
                studentName.textContent = 'Admin';
                loginModal.classList.add('hidden');
                mainContent.classList.remove('hidden');
                adminPanel.classList.remove('hidden');
                dashboard.classList.add('hidden');
            } else {
                alert('Invalid credentials. Please try again.');
            }
        });

        // Admin login link
        adminLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('username').value = 'admin';
            document.getElementById('password').value = 'enzo@738319';
        });

        // Logout functionality
        logoutBtn.addEventListener('click', () => {
            mainContent.classList.add('hidden');
            loginModal.classList.remove('hidden');
            resetExam();
        });

        // Start Exam
        startExamBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const subject = btn.dataset.subject;
                startExam(subject);
            });
        });

        // Navigation buttons
        prevQuestion.addEventListener('click', () => {
            if (currentExam.currentIndex > 0) {
                currentExam.currentIndex--;
                loadQuestion();
            }
        });

        nextQuestion.addEventListener('click', () => {
            saveAnswer();
            if (currentExam.currentIndex < currentExam.questions.length - 1) {
                currentExam.currentIndex++;
                loadQuestion();
            } else {
                submitExam();
            }
        });

        // Admin functionality
        manageQuestions.addEventListener('click', () => {
            alert(`Managing questions for ${adminSubject.value}. In a real app, this would open a question management interface.`);
        });

        // Helper Functions
        function startExam(subject) {
            // Get 20 random questions from the question bank
            const allQuestions = [...questionBank[subject]];
            const shuffled = allQuestions.sort(() => 0.5 - Math.random());
            currentExam.questions = shuffled.slice(0, 20);
            currentExam.subject = subject;
            currentExam.currentIndex = 0;
            currentExam.answers = {};
            currentExam.timeLeft = 3600;

            // Update UI
            dashboard.classList.add('hidden');
            examInterface.classList.remove('hidden');
            examSubject.textContent = `${subject.charAt(0).toUpperCase() + subject.slice(1)} Exam`;

            // Start timer
            clearInterval(currentExam.timerInterval);
            updateExamTimer();
            currentExam.timerInterval = setInterval(updateExamTimer, 1000);

            // Load first question
            loadQuestion();
        }

        function loadQuestion() {
            const question = currentExam.questions[currentExam.currentIndex];
            currentQuestion.textContent = currentExam.currentIndex + 1;

            // Update navigation buttons
            prevQuestion.disabled = currentExam.currentIndex === 0;
            nextQuestion.textContent = currentExam.currentIndex === currentExam.questions.length - 1 ? 'Submit' : 'Next';

            // Create question HTML
            questionContainer.innerHTML = `
                <div class="mb-6">
                    <h4 class="text-lg font-medium text-gray-800 mb-4">${question.question}</h4>
                    <div class="space-y-3">
                        ${question.options.map((option, i) => `
                            <div class="flex items-center">
                                <input 
                                    type="radio" 
                                    id="option-${i}" 
                                    name="answer" 
                                    value="${i}" 
                                    class="h-4 w-4 text-primary focus:ring-primary"
                                    ${currentExam.answers[question.id] === i ? 'checked' : ''}
                                >
                                <label for="option-${i}" class="ml-3 text-gray-700">${option}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h5 class="text-sm font-medium text-gray-700 mb-2">Theory (Reference Only)</h5>
                    <p class="text-gray-600 text-sm">${question.theory}</p>
                </div>
            `;
        }

        function saveAnswer() {
            const selectedOption = document.querySelector('input[name="answer"]:checked');
            if (selectedOption) {
                const questionId = currentExam.questions[currentExam.currentIndex].id;
                currentExam.answers[questionId] = parseInt(selectedOption.value);
            }
        }

        function updateExamTimer() {
            currentExam.timeLeft--;
            if (currentExam.timeLeft <= 0) {
                clearInterval(currentExam.timerInterval);
                submitExam();
                return;
            }

            const hours = Math.floor(currentExam.timeLeft / 3600);
            const minutes = Math.floor((currentExam.timeLeft % 3600) / 60);
            const seconds = currentExam.timeLeft % 60;

            examTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function submitExam() {
            clearInterval(currentExam.timerInterval);
            alert(`Exam submitted! You answered ${Object.keys(currentExam.answers).length} out of ${currentExam.questions.length} questions.`);
            resetExam();
        }

        function resetExam() {
            clearInterval(currentExam.timerInterval);
            examInterface.classList.add('hidden');
            dashboard.classList.remove('hidden');
            currentExam = {
                subject: '',
                questions: [],
                currentIndex: 0,
                answers: {},
                timerInterval: null,
                timeLeft: 3600
            };
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // In a real app, we would check Firebase for authentication state
            loginModal.classList.remove('hidden');
        });