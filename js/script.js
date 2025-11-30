// js/script.js
class TestApplication {
    constructor() {
        this.jsonLoader = new JSONLoader();
        this.currentQuestions = [];
        this.userAnswers = [];
        this.currentQuestionIndex = 0;
        this.usedQuestionIds = new Set();

        this.initializeElements();
        this.bindEvents();
        this.loadQuestions();
    }

    initializeElements() {
        // Экраны
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.testScreen = document.getElementById('test-screen');
        this.resultScreen = document.getElementById('result-screen');

        // Кнопки
        this.startBtn = document.getElementById('start-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.submitBtn = document.getElementById('submit-btn');
        this.restartBtn = document.getElementById('restart-btn');

        // Элементы интерфейса
        this.questionContainer = document.getElementById('question-container');
        this.currentQuestionEl = document.getElementById('current-question');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.progressBar = document.getElementById('progress-bar');
        this.resultMessage = document.getElementById('result-message');
        this.correctAnswersEl = document.getElementById('correct-answers');
        this.totalAnsweredEl = document.getElementById('total-answered');
        this.percentageEl = document.getElementById('percentage');
        this.reviewContainer = document.getElementById('review-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.loadingStatus = document.getElementById('loading-status');

        console.log('✅ Элементы инициализированы');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startTest());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.prevBtn.addEventListener('click', () => this.prevQuestion());
        this.submitBtn.addEventListener('click', () => this.submitTest());
        this.restartBtn.addEventListener('click', () => this.restartTest());

        console.log('✅ События привязаны');
    }

    async loadQuestions() {
        try {
            this.showLoading('🔍 Поиск файла с вопросами...');
            console.log('🚀 Начинаем загрузку вопросов...');

            this.updateLoadingStatus('Запрос к серверу...');
            await new Promise(resolve => setTimeout(resolve, 100)); // Небольшая задержка для отображения

            const questions = await this.jsonLoader.loadQuestionsFromJSON('data/questions.json');
            const count = questions.length;

            console.log(`✅ Загрузка завершена: ${count} вопросов`);
            this.hideLoading();

            this.totalQuestionsEl.textContent = '45';
            this.startBtn.textContent = `🎯 Начать тестирование (доступно: ${count} вопросов)`;
            this.startBtn.disabled = false;

            if (count < 45) {
                this.showWarning(`⚠️ Внимание: загружено ${count} вопросов из 425. Для полноценного тестирования рекомендуется добавить все вопросы.`);
            }

            if (count === 0) {
                this.showWarning('❌ В файле не найдено ни одного вопроса. Проверьте структуру данных.');
            }

        } catch (error) {
            console.error('💥 Критическая ошибка загрузки вопросов:', error);
            this.showError(`❌ Ошибка загрузки вопросов: ${error.message}`);
        }
    }

    showLoading(message = 'Загрузка...') {
        console.log('🔄 Показываем индикатор загрузки:', message);
        this.loadingIndicator.style.display = 'flex';
        this.startBtn.disabled = true;
        this.updateLoadingStatus(message);
    }

    hideLoading() {
        console.log('✅ Скрываем индикатор загрузки');
        this.loadingIndicator.style.display = 'none';
        this.startBtn.disabled = false;
    }

    updateLoadingStatus(message) {
        if (this.loadingStatus) {
            this.loadingStatus.textContent = message;
        }
        console.log('📢 Статус загрузки:', message);
    }

    showError(message) {
        console.error('❌ Показываем ошибку:', message);
        this.loadingIndicator.innerHTML = `
            <div style="text-align: center; padding: 30px; max-width: 600px; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div style="font-size: 48px; margin-bottom: 20px;">😞</div>
                <div style="color: #e74c3c; font-size: 20px; margin-bottom: 20px; font-weight: bold;">${message}</div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px; text-align: left;">
                    <strong style="color: #2c3e50;">Возможные причины и решения:</strong>
                    <ul style="margin: 15px 0; padding-left: 25px; color: #555;">
                        <li>Файл <code>data/questions.json</code> не существует</li>
                        <li>Ошибка в структуре JSON файла</li>
                        <li>Файл пустой или содержит невалидный JSON</li>
                        <li>Проблемы с доступом к файлу</li>
                    </ul>
                </div>

                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                        🔄 Обновить страницу
                    </button>
                    <button onclick="window.testApp.checkFileExistence()" style="background: #2ecc71; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                    📁 Проверить файл
                    </button>
                    <button onclick="window.testApp.hideLoading()" style="background: #95a5a6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                        ✖️ Закрыть
                    </button>
                </div>
            </div>
        `;
    }

    // Проверка существования файла
    async checkFileExistence() {
        try {
            this.showLoading('🔍 Проверяем существование файла...');

            const testResponse = await fetch('data/questions.json', { method: 'HEAD' });
            const exists = testResponse.ok;

            if (!exists) {
                this.showError('❌ Файл data/questions.json не найден на сервере');
                return;
            }

            const response = await fetch('data/questions.json');
            const content = await response.text();

            this.showFileAnalysis(content, exists);

        } catch (error) {
            this.showError(`❌ Ошибка проверки файла: ${error.message}`);
        }
    }

    showFileAnalysis(content, exists) {
        const fileSize = new Blob([content]).size;
        const lines = content.split('\n').length;

        this.loadingIndicator.innerHTML = `
            <div style="text-align: center; padding: 30px; max-width: 700px; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div style="font-size: 48px; margin-bottom: 20px;">📊</div>
                <div style="font-size: 24px; margin-bottom: 25px; color: #2c3e50; font-weight: bold;">Анализ файла questions.json</div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                    <div style="background: #e8f6f3; padding: 15px; border-radius: 8px;">
                        <div style="font-size: 14px; color: #27ae60;">Файл существует</div>
                        <div style="font-size: 18px; font-weight: bold;">${exists ? '✅ Да' : '❌ Нет'}</div>
                    </div>
                    <div style="background: #e8f6f3; padding: 15px; border-radius: 8px;">
                        <div style="font-size: 14px; color: #27ae60;">Размер файла</div>
                        <div style="font-size: 18px; font-weight: bold;">${fileSize} байт</div>
                    </div>
                    <div style="background: #e8f6f3; padding: 15px; border-radius: 8px;">
                        <div style="font-size: 14px; color: #27ae60;">Строк кода</div>
                        <div style="font-size: 18px; font-weight: bold;">${lines}</div>
                    </div>
                    <div style="background: #e8f6f3; padding: 15px; border-radius: 8px;">
                        <div style="font-size: 14px; color: #27ae60;">Пустой файл</div>
                        <div style="font-size: 18px; font-weight: bold;">${content.trim() === '' ? '✅ Да' : '❌ Нет'}</div>
                    </div>
                </div>

                <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin-bottom: 25px; text-align: left;">
                    <strong style="color: #856404;">Первые 200 символов файла:</strong>
                    <pre style="background: white; padding: 15px; border-radius: 5px; margin-top: 10px; overflow: auto; font-size: 12px; max-height: 150px;">${content.substring(0, 200)}</pre>
                </div>

                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                        🔄 Обновить
                    </button>
                    <button onclick="window.testApp.hideLoading()" style="background: #95a5a6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                        ✖️ Закрыть
                    </button>
                </div>
            </div>
        `;
    }

    showWarning(message) {
        console.warn('⚠️ Показываем предупреждение:', message);
        const warningEl = document.createElement('div');
        warningEl.style.cssText = `
            background: #fff3cd;
            border: 2px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            text-align: center;
            font-size: 16px;
            font-weight: 500;
        `;
        warningEl.innerHTML = `⚠️ ${message}`;
        this.welcomeScreen.insertBefore(warningEl, this.startBtn.parentNode);
    }

    startTest() {
        console.log('🎯 Начинаем тестирование');

        if (!this.jsonLoader.hasQuestions()) {
            alert('❌ Вопросы не загружены. Пожалуйста, проверьте файл questions.json');
            return;
        }

        const totalQuestions = this.jsonLoader.getQuestionsCount();
        const testQuestionsCount = Math.min(45, totalQuestions);

        console.log(`📊 Доступно вопросов: ${totalQuestions}, будет использовано: ${testQuestionsCount}`);

        if (totalQuestions < 45) {
            if (!confirm(`⚠️ Внимание: доступно только ${totalQuestions} вопросов. Будет использовано ${testQuestionsCount} вопросов. Продолжить тестирование?`)) {
                return;
            }
        }

        this.welcomeScreen.classList.remove('active');
        this.testScreen.classList.add('active');
        this.initializeTest();
    }

    // ... остальные методы без изменений ...
    initializeTest() {
        const totalQuestions = this.jsonLoader.getQuestionsCount();
        const testQuestionsCount = Math.min(45, totalQuestions);

        console.log(`🎲 Выбираем ${testQuestionsCount} случайных вопросов`);
        this.currentQuestions = this.getRandomQuestions(testQuestionsCount);
        this.userAnswers = new Array(this.currentQuestions.length).fill(null);
        this.currentQuestionIndex = 0;

        console.log(`✅ Выбрано вопросов: ${this.currentQuestions.length}`);
        this.displayQuestion();
        this.updateNavigation();
        this.updateProgress();
    }

    getRandomQuestions(count) {
        const allQuestions = this.jsonLoader.getAllQuestions();
        const maxRepeatedQuestions = Math.floor(count * 0.25);
        let repeatedQuestions = [];
        let newQuestions = [];

        if (this.usedQuestionIds.size > 0) {
            const usedQuestionsArray = Array.from(this.usedQuestionIds);
            const shuffledUsed = [...usedQuestionsArray].sort(() => 0.5 - Math.random());
            repeatedQuestions = shuffledUsed.slice(0, maxRepeatedQuestions).map(id =>
                allQuestions.find(q => q.id === id)
            ).filter(q => q !== undefined);
        }

        const unusedQuestions = allQuestions.filter(q => !this.usedQuestionIds.has(q.id));
        const shuffledUnused = [...unusedQuestions].sort(() => 0.5 - Math.random());
        const questionsNeeded = count - repeatedQuestions.length;
        newQuestions = shuffledUnused.slice(0, questionsNeeded);

        const selectedQuestions = [...repeatedQuestions, ...newQuestions]
            .sort(() => 0.5 - Math.random())
            .map(q => this.shuffleOptions(q));

        selectedQuestions.forEach(q => this.usedQuestionIds.add(q.id));

        return selectedQuestions;
    }

    shuffleOptions(question) {
        const shuffledQuestion = {...question};
        const correctAnswerText = shuffledQuestion.options[shuffledQuestion.correctAnswer];
        const shuffledOptions = [...shuffledQuestion.options].sort(() => 0.5 - Math.random());
        const newCorrectAnswerIndex = shuffledOptions.indexOf(correctAnswerText);

        shuffledQuestion.options = shuffledOptions;
        shuffledQuestion.correctAnswer = newCorrectAnswerIndex;

        return shuffledQuestion;
    }

    displayQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        this.currentQuestionEl.textContent = this.currentQuestionIndex + 1;

        const optionLetters = ['A', 'B', 'C'];

        this.questionContainer.innerHTML = `
            <div class="question fade-in">
                <div class="question-text">
                    <span class="question-number">${this.currentQuestionIndex + 1}</span>
                    ${question.question}
                </div>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <div class="option ${this.userAnswers[this.currentQuestionIndex] === index ? 'selected' : ''}"
                             data-index="${index}">
                            <span class="option-letter">${optionLetters[index]}</span>
                            <div class="option-text">${option}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.bindOptionEvents();
    }

    bindOptionEvents() {
        const options = this.questionContainer.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                console.log('🖱️ Клик по варианту:', option.dataset.index);

                options.forEach(opt => {
                    opt.classList.remove('selected');
                });

                option.classList.add('selected');

                const selectedIndex = parseInt(option.dataset.index);
                this.userAnswers[this.currentQuestionIndex] = selectedIndex;

                console.log('✅ Выбран ответ:', selectedIndex);
                this.updateNavigation();
            });
        });
    }

    updateNavigation() {
        this.prevBtn.disabled = this.currentQuestionIndex === 0;
        const isLastQuestion = this.currentQuestionIndex === this.currentQuestions.length - 1;
        this.nextBtn.style.display = isLastQuestion ? 'none' : 'block';
        this.submitBtn.style.display = isLastQuestion ? 'block' : 'none';
        this.nextBtn.disabled = this.userAnswers[this.currentQuestionIndex] === null;
        this.submitBtn.disabled = this.userAnswers[this.currentQuestionIndex] === null;
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuestions.length) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.updateNavigation();
            this.updateProgress();
        }
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.updateNavigation();
            this.updateProgress();
        }
    }

    submitTest() {
        this.testScreen.classList.remove('active');
        this.resultScreen.classList.add('active');
        this.displayResults();
    }

    calculateResults() {
        let correctCount = 0;
        const results = [];

        this.currentQuestions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            if (isCorrect) {
                correctCount++;
            }

            results.push({
                question: question.question,
                userAnswer: userAnswer !== null ? question.options[userAnswer] : 'Не отвечено',
                correctAnswer: question.options[question.correctAnswer],
                explanation: question.explanation,
                isCorrect: isCorrect,
                questionNumber: index + 1
            });
        });

        return {
            correctCount: correctCount,
            totalQuestions: this.currentQuestions.length,
            percentage: (correctCount / this.currentQuestions.length) * 100,
            details: results
        };
    }

    displayResults() {
        const results = this.calculateResults();

        this.correctAnswersEl.textContent = results.correctCount;
        this.totalAnsweredEl.textContent = results.totalQuestions;
        this.percentageEl.textContent = results.percentage.toFixed(1);

        const isPassed = results.percentage >= 50;
        this.resultMessage.textContent = isPassed ? '🎉 ПРОЙДЕНО' : '❌ НЕ ПРОЙДЕНО';
        this.resultMessage.className = `result ${isPassed ? 'passed' : 'failed'}`;

        this.displayReview(results.details);
    }

    displayReview(details) {
        this.reviewContainer.innerHTML = '';
        const incorrectAnswers = details.filter(result => !result.isCorrect);

        if (incorrectAnswers.length === 0) {
            this.reviewContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 4rem; color: #27ae60; margin-bottom: 20px;">🎉</div>
                    <div style="font-size: 2rem; color: #27ae60; margin-bottom: 10px; font-weight: bold;">Идеальный результат!</div>
                    <div style="font-size: 1.2rem; color: #666;">Все ответы правильные! Вы отлично справились с тестированием.</div>
                </div>
            `;
            return;
        }

        incorrectAnswers.forEach((result) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="question-text">${result.questionNumber}. ${result.question}</div>
                <div class="incorrect-answer">❌ Ваш ответ: ${result.userAnswer}</div>
                <div class="correct-answer">✅ Правильный ответ: ${result.correctAnswer}</div>
                <div class="explanation"><strong>Объяснение:</strong> ${result.explanation}</div>
            `;
            this.reviewContainer.appendChild(reviewItem);
        });

        const statsHeader = document.createElement('div');
        statsHeader.innerHTML = `
            <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <strong style="font-size: 1.2rem;">📊 Нужно поработать над ${incorrectAnswers.length} вопросом(ами)</strong>
            </div>
        `;
        this.reviewContainer.insertBefore(statsHeader, this.reviewContainer.firstChild);
    }

    restartTest() {
        this.resultScreen.classList.remove('active');
        this.welcomeScreen.classList.add('active');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Приложение запускается...');
    window.testApp = new TestApplication();
});