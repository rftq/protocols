document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const keywordsInput = document.getElementById('keywords');
    const resultsDiv = document.getElementById('results');
    
    let fileContent = '';
    let lines = [];
    
    // Загрузка текстового файла
    fetch('text.txt')
        .then(response => response.text())
        .then(data => {
            fileContent = data;
            lines = data.split('\n');
        })
        .catch(error => {
            console.error('Ошибка загрузки файла:', error);
            resultsDiv.innerHTML = '<div class="no-results">Не удалось загрузить текстовый файл</div>';
        });
    
    // Обработчик кнопки поиска
    searchBtn.addEventListener('click', performSearch);
    
    // Также можно искать при нажатии Enter в поле ввода
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
            
            html += `
                <div class="result-item">
                    <span class="line-number">Строка ${item.lineNumber}:</span>
                    ${text}
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
    }
});