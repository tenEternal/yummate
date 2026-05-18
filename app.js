document.addEventListener('DOMContentLoaded', () => {
    const categoryFilters = document.getElementById('categoryFilters');
    const recommendBtn = document.getElementById('recommendBtn');
    const resultCard = document.getElementById('resultCard');
    
    // Result elements
    const resultCategory = document.getElementById('resultCategory');
    const resultName = document.getElementById('resultName');
    const resultSeason = document.getElementById('resultSeason');
    const resultIngredients = document.getElementById('resultIngredients');

    let currentCategory = 'all';

    // 1. 카테고리 동적 생성 (data.js의 foodData 기반)
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
            // 활성화 상태 변경
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // 현재 카테고리 업데이트
            currentCategory = e.target.dataset.category;
        }
    });

    // 3. 추천 버튼 클릭 이벤트
    recommendBtn.addEventListener('click', () => {
        // 필터링된 데이터 가져오기
        const filteredData = currentCategory === 'all' 
            ? foodData 
            : foodData.filter(item => item.카테고리 === currentCategory);

        if (filteredData.length === 0) {
            alert('해당 카테고리에 데이터가 없습니다. data.js를 확인해주세요.');
            return;
        }

        // 랜덤 선택
        const randomIndex = Math.floor(Math.random() * filteredData.length);
        const selectedFood = filteredData[randomIndex];

        // UI 업데이트
        updateUI(selectedFood);
    });

    // 4. UI 업데이트 및 애니메이션
    function updateUI(food) {
        // 애니메이션 리셋을 위해 클래스 제거
        resultCard.classList.remove('pop');
        
        // 약간의 딜레이 후 데이터 변경 및 애니메이션 적용 (더 자연스러운 효과)
        setTimeout(() => {
            resultCategory.textContent = food.카테고리;
            resultName.textContent = food.음식;
            resultSeason.textContent = food.제철 || '정보 없음';
            resultIngredients.textContent = food.재료 || '정보 없음';

            resultCard.classList.remove('hidden');
            // 애니메이션 재트리거
            void resultCard.offsetWidth; 
            resultCard.classList.add('pop');
        }, 50);
    }
});
