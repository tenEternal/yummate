document.addEventListener('DOMContentLoaded', () => {
    const categoryFilters = document.getElementById('categoryFilters');
    const recommendBtn = document.getElementById('recommendBtn');
    const seasonalBtn = document.getElementById('seasonalBtn');
    const fridgeToggleBtn = document.getElementById('fridgeToggleBtn');
    const fridgeSection = document.getElementById('fridgeSection');
    const weeklyPlanBtn = document.getElementById('weeklyPlanBtn');
    
    // Single Result Card elements
    const resultCard = document.getElementById('resultCard');
    const resultCategory = document.getElementById('resultCategory');
    const resultName = document.getElementById('resultName');
    const resultIngredients = document.getElementById('resultIngredients');

    // Fridge section elements
    const fridgeBtn = document.getElementById('fridgeBtn');
    const fridgeInput = document.getElementById('fridgeInput');
    const fridgeResultCard = document.getElementById('fridgeResultCard');
    const fridgeList = document.getElementById('fridgeList');
    const ingredientSuggestions = document.getElementById('ingredientSuggestions');
    const tagsContainer = document.getElementById('tagsContainer');

    // 냉장고 털기 버튼 토글
    fridgeToggleBtn.addEventListener('click', () => {
        const isHidden = fridgeSection.classList.contains('hidden');
        if (isHidden) {
            fridgeSection.classList.remove('hidden');
            fridgeToggleBtn.classList.add('active');
            fridgeInput.focus();
        } else {
            fridgeSection.classList.add('hidden');
            fridgeToggleBtn.classList.remove('active');
        }
        resultCard.classList.add('hidden');
    });
    const tagsInputWrapper = document.getElementById('tagsInputWrapper');

    let currentCategory = 'all';
    let selectedIngredients = [];

    // 모든 고유 재료 추출 (자동완성용)
    const allIngredientsSet = new Set();
    foodData.forEach(food => {
        if (food.재료) {
            food.재료.split(',').forEach(ing => {
                allIngredientsSet.add(ing.trim());
            });
        }
    });
    const allIngredients = Array.from(allIngredientsSet).filter(Boolean).sort((a, b) => a.localeCompare(b, 'ko'));

    // 1. 카테고리 동적 생성
    const categories = [...new Set(foodData.map(item => item.카테고리))];
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.category = category;
        btn.textContent = category;
        categoryFilters.appendChild(btn);
    });

    // 2. 카테고리 필터 클릭 이벤트
    categoryFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
        }
    });

    // 3. 단일 추천 버튼 클릭 이벤트
    recommendBtn.addEventListener('click', () => {
        fridgeResultCard.classList.add('hidden');
        
        const filteredData = currentCategory === 'all' 
            ? foodData.filter(item => item.카테고리 !== '간단식')
            : foodData.filter(item => item.카테고리 === currentCategory && item.카테고리 !== '간단식');

        if (filteredData.length === 0) {
            alert('해당 조건에 맞는 메뉴가 없습니다. (간단식은 제외됩니다)');
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredData.length);
        const selectedFood = filteredData[randomIndex];

        updateUI(selectedFood);
    });

    // --- 제철 메뉴 판별 로직 ---
    function isInSeason(seasonString) {
        if (!seasonString || seasonString === "사계절") return false;

        const currentMonth = new Date().getMonth() + 1; // 1 ~ 12

        // 1. 월 범위 파싱 (예: "9월~11월", "10월~2월")
        const monthMatch = seasonString.match(/(\d+)월~(\d+)월/);
        if (monthMatch) {
            const startMonth = parseInt(monthMatch[1], 10);
            const endMonth = parseInt(monthMatch[2], 10);
            
            if (startMonth <= endMonth) {
                return currentMonth >= startMonth && currentMonth <= endMonth;
            } else {
                // 연도를 넘어가는 경우 (예: 10월~2월)
                return currentMonth >= startMonth || currentMonth <= endMonth;
            }
        }

        // 2. 계절 단어 파싱
        if (seasonString === "봄") return [3, 4, 5].includes(currentMonth);
        if (seasonString === "여름") return [6, 7, 8].includes(currentMonth);
        if (seasonString === "가을") return [9, 10, 11].includes(currentMonth);
        if (seasonString === "겨울") return [12, 1, 2].includes(currentMonth);

        // 3. 단일 월 파싱 (예: "9월")
        const singleMonthMatch = seasonString.match(/(\d+)월/);
        if (singleMonthMatch) {
            return currentMonth === parseInt(singleMonthMatch[1], 10);
        }

        return false;
    }

    // 3.5 제철 메뉴 추천 버튼 클릭 이벤트
    seasonalBtn.addEventListener('click', () => {
        fridgeResultCard.classList.add('hidden');
        
        const filteredData = foodData.filter(item => {
            const categoryMatch = currentCategory === 'all' 
                ? item.카테고리 !== '간단식'
                : (item.카테고리 === currentCategory && item.카테고리 !== '간단식');
            
            return categoryMatch && isInSeason(item.제철);
        });

        if (filteredData.length === 0) {
            const currentMonth = new Date().getMonth() + 1;
            alert(`현재 선택하신 조건에 맞는 ${currentMonth}월 제철 메뉴가 없습니다.`);
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredData.length);
        const selectedFood = filteredData[randomIndex];

        updateUI(selectedFood);
    });

    // 4. 일주일 식단표 버튼 클릭 이벤트
    weeklyPlanBtn.addEventListener('click', () => {
        window.location.href = `weekly.html?category=${currentCategory}`;
    });

    // --- 태그 입력 및 자동완성 로직 ---
    function renderTags() {
        tagsContainer.innerHTML = selectedIngredients.map((ing, idx) => `
            <div class="tag-item">
                ${ing}
                <button type="button" class="tag-remove" data-idx="${idx}">&times;</button>
            </div>
        `).join('');
    }

    function addIngredient(ing) {
        let trimmed = ing.trim();
        // 달걀 입력 시 계란으로 자동 치환
        if (trimmed === '달걀') {
            trimmed = '계란';
        } else {
            trimmed = trimmed.replace(/달걀/g, '계란');
        }

        if (trimmed && !selectedIngredients.includes(trimmed)) {
            selectedIngredients.push(trimmed);
            renderTags();
        }
        fridgeInput.value = '';
        ingredientSuggestions.classList.add('hidden');
    }

    // 태그 삭제 이벤트
    tagsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-remove')) {
            const idx = parseInt(e.target.dataset.idx);
            selectedIngredients.splice(idx, 1);
            renderTags();
        }
    });

    // Input 이벤트 (자동완성)
    fridgeInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();

        if (!val) {
            ingredientSuggestions.classList.add('hidden');
            return;
        }

        // '달걀'을 '계란'으로 변환하여 검색
        const searchVal = val.replace(/달걀/g, '계란');

        const matches = allIngredients.filter(ing => ing.includes(searchVal) && !selectedIngredients.includes(ing));

        if (matches.length > 0) {
            ingredientSuggestions.innerHTML = matches.map(match => `<li>${match}</li>`).join('');
            ingredientSuggestions.classList.remove('hidden');
        } else {
            ingredientSuggestions.classList.add('hidden');
        }
    });

    // 자동완성 목록 클릭
    ingredientSuggestions.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            addIngredient(e.target.textContent);
            fridgeInput.focus();
        }
    });

    // 키보드 이벤트 (엔터로 추가, 백스페이스로 삭제)
    fridgeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!ingredientSuggestions.classList.contains('hidden') && ingredientSuggestions.querySelector('li')) {
                // 드롭다운이 열려있으면 첫 번째 항목 추가
                addIngredient(ingredientSuggestions.querySelector('li').textContent);
            } else if (fridgeInput.value.trim()) {
                // 직접 입력한 내용 추가
                addIngredient(fridgeInput.value);
            } else {
                // 빈 입력창에서 엔터 시 검색 실행
                fridgeBtn.click();
            }
        } else if (e.key === 'Backspace' && fridgeInput.value === '') {
            if (selectedIngredients.length > 0) {
                selectedIngredients.pop();
                renderTags();
            }
        }
    });

    // 래퍼 클릭 시 인풋에 포커스
    tagsInputWrapper.addEventListener('click', (e) => {
        if (e.target === tagsInputWrapper || e.target === tagsContainer) {
            fridgeInput.focus();
        }
    });

    // 외부 클릭 시 자동완성 닫기
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.tags-input-wrapper')) {
            ingredientSuggestions.classList.add('hidden');
        }
    });

    // --- 냉장고 털기 (메뉴 찾기) 로직 ---
    fridgeBtn.addEventListener('click', () => {
        // 입력창에 남아있는 텍스트도 추가 처리
        if (fridgeInput.value.trim()) {
            addIngredient(fridgeInput.value);
        }

        if (selectedIngredients.length === 0) {
            alert('냉장고에 있는 재료를 입력해주세요. (예: 양파)');
            return;
        }

        resultCard.classList.add('hidden'); 
        ingredientSuggestions.classList.add('hidden');

        // 매칭 점수 계산
        const scoredFoods = foodData.map(food => {
            let score = 0;
            const foodIngredients = food.재료 ? food.재료.split(',').map(i => i.trim()) : [];
            
            selectedIngredients.forEach(uIng => {
                foodIngredients.forEach(fIng => {
                    if (fIng.includes(uIng)) {
                        score++;
                    }
                });
            });
            return { ...food, score };
        }).filter(item => item.score > 0);

        if (scoredFoods.length === 0) {
            alert('입력하신 재료가 포함된 메뉴를 찾을 수 없습니다.');
            fridgeResultCard.classList.add('hidden');
            return;
        }

        scoredFoods.sort((a, b) => b.score - a.score);

        let html = '';
        scoredFoods.slice(0, 5).forEach(food => {
            html += `
                <li>
                    <span class="category-badge">${food.카테고리}</span>
                    <strong style="margin-left: 0.5rem;">${food.음식}</strong> 
                    <span style="color:#fde047; font-size:0.9rem; margin-left: 0.5rem;">(일치 재료: ${food.score}개)</span>
                    <small style="color:var(--text-muted);">${food.재료}</small>
                </li>
            `;
        });
        
        fridgeList.innerHTML = html;
        fridgeResultCard.classList.remove('hidden');
    });

    function updateUI(food) {
        resultCard.classList.remove('pop');
        
        setTimeout(() => {
            resultCategory.textContent = food.카테고리;
            resultName.textContent = food.음식;
            resultIngredients.textContent = food.재료 || '정보 없음';

            resultCard.classList.remove('hidden');
            void resultCard.offsetWidth; 
            resultCard.classList.add('pop');
        }, 50);
    }
});
