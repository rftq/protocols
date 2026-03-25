document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const keywordsInput = document.getElementById('keywords');
    const resultsDiv = document.getElementById('results');
    
    let textsData = [];
    
    // Загрузка JSON-файла с текстами
    fetch('texts.json')
        .then(response => response.json())
        .then(data => {
            textsData = data;
        })
        .catch(error => {
            console.error('Ошибка загрузки JSON:', error);
            resultsDiv.innerHTML = '<div class="no-results">Не удалось загрузить данные для поиска</div>';
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
        
        // Поиск по текстам
        const results = textsData.filter(item => {
            // Проверяем, содержит ли текст или заголовок все ключевые слова
            const content = (item.title ? item.title + ' ' : '') + (item.content || '');
            return searchTerms.every(term => 
                content.toLowerCase().includes(term.toLowerCase())
            );
        });
        
        displayResults(results, searchTerms);
    }
    
    function displayResults(results, searchTerms) {
        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results">Ничего не найдено</div>';
            return;
        }
        
        let html = '';
        
        results.forEach(item => {
            let content = item.content || '';
            let title = item.title || '';
            
            // Подсветка ключевых слов в заголовке
            searchTerms.forEach(term => {
                const regex = new RegExp(term, 'gi');
                title = title.replace(regex, match => `<span class="highlight">${match}</span>`);
            });
            
            // Подсветка ключевых слов в содержимом (первые 200 символов)
            let preview = content.substring(0, 200);
            if (content.length > 200) preview += '...';
            
            searchTerms.forEach(term => {
                const regex = new RegExp(term, 'gi');
                preview = preview.replace(regex, match => `<span class="highlight">${match}</span>`);
            });
            
            html += `
                <div class="result-item">
                    <h3>${title || 'Без названия'}</h3>
                    <p>${preview}</p>
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
    }
});