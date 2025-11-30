// js/json-loader.js
class JSONLoader {
    constructor() {
        this.allQuestions = [];
    }

    // Загрузка JSON файла
    async loadQuestionsFromJSON(jsonPath) {
        try {
            console.log('Начинаем загрузку вопросов из:', jsonPath);
            const response = await fetch(jsonPath);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jsonData = await response.json();
            return this.parseJSON(jsonData);
        } catch (error) {
            console.error('Ошибка загрузки JSON:', error);
            throw error;
        }
    }

    // Парсинг JSON
    parseJSON(jsonData) {
        try {
            if (!jsonData.questions || !Array.isArray(jsonData.questions)) {
                throw new Error("Некорректная структура JSON: отсутствует массив questions");
            }

            this.allQuestions = jsonData.questions.map((q, index) => {
                // Валидация данных
                if (!q.id) {
                    console.warn(`Вопрос ${index} не имеет ID, будет использован индекс`);
                    q.id = index + 1;
                }

                if (!q.question || typeof q.question !== 'string') {
                    throw new Error(`Вопрос ${q.id} имеет некорректный текст вопроса`);
                }

                // ИСПРАВЛЕНИЕ: теперь 3 варианта ответа вместо 4
                if (!q.options || !Array.isArray(q.options) || q.options.length !== 3) {
                    throw new Error(`Вопрос ${q.id} должен иметь 3 варианта ответа, а имеет: ${q.options ? q.options.length : 'нет options'}`);
                }

                // ИСПРАВЛЕНИЕ: correctAnswer теперь 0-2 вместо 0-3
                if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 2) {
                    throw new Error(`Вопрос ${q.id} имеет некорректный correctAnswer: ${q.correctAnswer}. Должен быть от 0 до 2`);
                }

                if (!q.explanation || typeof q.explanation !== 'string') {
                    console.warn(`Вопрос ${q.id} не имеет объяснения`);
                    q.explanation = "Объяснение отсутствует";
                }

                return {
                    id: parseInt(q.id),
                    question: q.question.trim(),
                    options: q.options.map(opt => opt.trim()),
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation.trim()
                };
            });

            console.log(`Успешно загружено вопросов: ${this.allQuestions.length}`);
            return this.allQuestions;

        } catch (error) {
            console.error('Ошибка парсинга JSON:', error);
            throw error;
        }
    }

    // Получение всех вопросов
    getAllQuestions() {
        return this.allQuestions;
    }

    // Получение вопроса по ID
    getQuestionById(id) {
        return this.allQuestions.find(q => q.id === id);
    }

    // Получение количества вопросов
    getQuestionsCount() {
        return this.allQuestions.length;
    }

    // Проверка наличия вопросов
    hasQuestions() {
        return this.allQuestions.length > 0;
    }

    // Получение случайных вопросов
    getRandomQuestions(count, excludeIds = []) {
        const availableQuestions = this.allQuestions.filter(q => !excludeIds.includes(q.id));

        if (availableQuestions.length < count) {
            console.warn(`Запрошено ${count} вопросов, но доступно только ${availableQuestions.length}`);
            return availableQuestions;
        }

        // Перемешиваем и берем нужное количество
        return [...availableQuestions]
            .sort(() => 0.5 - Math.random())
            .slice(0, count);
    }
}