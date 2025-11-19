// index.js 파일 (수정 완료)

// index.html에서 axios가 전역으로 로드되었으므로 import 구문은 없습니다.

// --- 명언 API용 설정 ---
// ★★★ [중요] API 키를 정확한 문자열로 다시 입력했습니다. ★★★
const QUOTES_API_URL = 'https://api.api-ninjas.com/v1/quotes';

// 키가 잘못되었을 경우 서버가 401 Unauthorized를 반환할 것입니다.
// 키를 작은따옴표로 정확하게 감싸야 합니다.
const API_KEY = '7x/GFtwcSHcEEDrs//xgYA==zsistVW18iMj7Kxu'; 

// 명언 API의 카테고리에 따라 아이콘 색상을 변경하는 기준
const categoryColors = {
    'inspirational': '#2AA364', // 영감을 줄 때 (Green)
    'life': '#F5EB4D',          // 인생 관련 (Yellow)
    'wisdom': '#007bff',        // 지혜 관련 (Blue)
    'happiness': '#FF69B4',     // 행복 관련 (Pink)
    'default': '#9E4229'        // 기본값 (Brown)
};

/**
 * 명언의 카테고리에 따라 확장 프로그램 아이콘의 색상을 결정하고 background.js로 전송합니다.
 * @param {string} category - 명언의 카테고리
 */
const updateIconByQuoteCategory = (category) => {
    const closestColor = categoryColors[category] || categoryColors['default'];
    
    // background.js로 아이콘 업데이트 요청을 보냅니다.
    chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: closestColor } });
};

/**
 * 명언 API를 호출하여 데이터를 가져오고 HTML을 업데이트합니다.
 */
const fetchAndDisplayQuote = async () => {
    const loading = document.getElementById('loading');
    const container = document.getElementById('quote-container');
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    
    loading.style.display = 'block';
    container.style.display = 'none';

    // [이전의 중단 로직 제거] 이제 무조건 API를 호출합니다.
    
    try {
        // API 호출 시작: 이 시점에서 Network 탭에 요청이 잡혀야 합니다.
        console.log("--- API 호출 시도 중 ---"); // ★★★ 디버깅용 로그 추가

        const response = await axios.get(QUOTES_API_URL, { 
            headers: {
                // API-Ninjas는 'X-Api-Key' 헤더를 사용합니다.
                'X-Api-Key': API_KEY, 
            },
        });

        const quoteData = response.data[0];
        const quote = quoteData.quote;
        const author = quoteData.author;
        const category = quoteData.category;

        console.log(`--- 호출 성공, 카테고리: ${category} ---`); // ★★★ 디버깅용 로그 추가
        
        // UI 업데이트
        quoteText.textContent = quote;
        quoteAuthor.textContent = `- ${author}`;
        
        // 아이콘 업데이트
        updateIconByQuoteCategory(category); 

        loading.style.display = 'none';
        container.style.display = 'block';
        
    } catch (error) {
        // 오류가 발생하면 (주로 401 Unauthorized) 콘솔에 자세한 내용을 출력합니다.
        console.error("--- API 호출 실패 ---", error); 
        
        loading.textContent = '명언을 불러오는 데 실패했습니다. (키 또는 네트워크 문제)';
        
        // 오류 발생 시 아이콘을 빨간색으로 변경
        chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: 'red' } });
    }
};

/**
 * 확장 프로그램 초기 설정 함수: 페이지 로드 시 명언을 가져옵니다.
 */
const init = () => {
    fetchAndDisplayQuote();
};

init();