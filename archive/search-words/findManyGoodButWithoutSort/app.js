document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const searchBtn = document.getElementById('search-btn');
    const resetBtn = document.getElementById('reset-btn');
    const keywordsInput = document.getElementById('keywords');
    const resultsDiv = document.getElementById('results');
    const fileInfoDiv = document.getElementById('file-info');
    
    let lines = [];
    let fileName = '';
    
    // Обработчик выбора файла
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        fileName = file.name;
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            lines = content.split('\n');
            fileInfoDiv.textContent = `Загружен файл: ${fileName} (${lines.length} строк)`;
            keywordsInput.disabled = false;
            searchBtn.disabled = false;
            resultsDiv.innerHTML = '';
        };
        
        reader.onerror = function() {
            fileInfoDiv.textContent = 'Ошибка при чтении файла';
            console.error('Ошибка при чтении файла');
        };
        
        reader.readAsText(file);
    });
    
    // Обработчик кнопки поиска
    searchBtn.addEventListener('click', performSearch);
    
    // Обработчик кнопки сброса
    resetBtn.addEventListener('click', function() {
        keywordsInput.value = ''; // Очищаем поле ввода
        resultsDiv.innerHTML = ''; // Очищаем результаты поиска
    });
    
    // Поиск при нажатии Enter
    keywordsInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    function performSearch() {
        const keywords = keywordsInput.value.trim();
        
        if (!keywords) {
            resultsDiv.innerHTML = '<div class="no-results">Введите ключевые слова для поиска</div>';
            return;
        }
        
        if (lines.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results">Файл не загружен</div>';
            return;
        }
        
        // Разделяем ключевые слова по запятым или пробелам
        const searchTerms = keywords.split(/[,\s]+/).filter(term => term.length > 0);
        
        if (searchTerms.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results">Введите корректные ключевые слова</div>';
            return;
        }
        
        // Поиск по строкам текста
        const results = [];
        
        lines.forEach((line, index) => {
            if (line.trim() === '') return;
            
            // Проверяем, содержит ли строка все ключевые слова
            const hasAllTerms = searchTerms.every(term => 
                line.toLowerCase().includes(term.toLowerCase())
            );
            
            if (hasAllTerms) {
                results.push({
                    lineNumber: index + 1,
                    text: line
                });
            }
        });
        
        displayResults(results, searchTerms);
    }
    
    function displayResults(results, searchTerms) {
        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results">Ничего не найдено</div>';
            return;
        }
        
        let html = `<p>Найдено совпадений: ${results.length}</p>`;
        
        results.forEach(item => {
            let text = item.text;
            
            // Подсветка ключевых слов в тексте
            searchTerms.forEach(term => {
                const regex = new RegExp(term, 'gi');
                text = text.replace(regex, match => `<span class="highlight">${match}</span>`);
            });
            
            const resultId = `result-${item.lineNumber}`;
            html += `
                <div class="result-item" id="${resultId}">
                    <button class="copy-btn" onclick="copyResult('${resultId}')">Копировать</button>
                    <span class="copied-notice">Скопировано!</span>
                    <span class="line-number">Строка ${item.lineNumber}:</span>
                    ${text}
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
    }
});

// Глобальная функция для копирования результата
function copyResult(resultId) {
    const resultElement = document.getElementById(resultId);
    // Создаём временный элемент для извлечения только текста
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = resultElement.innerHTML;
    
    // Удаляем ненужные элементы
    tempDiv.querySelectorAll('.copy-btn, .copied-notice, .line-number').forEach(el => el.remove());
    
    // Удаляем подсветку (если есть)
    tempDiv.querySelectorAll('.highlight').forEach(el => {
        el.replaceWith(el.textContent);
    });
    
    const textToCopy = tempDiv.innerText.trim();
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            const notice = resultElement.querySelector('.copied-notice');
            notice.style.display = 'block';
            setTimeout(() => {
                notice.style.display = 'none';
            }, 2000);
        })
        .catch(err => {
            console.error('Ошибка при копировании: ', err);
            alert('Не удалось скопировать текст. Попробуйте ещё раз.');
        });
}