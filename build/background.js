// 캔버스에 원형 아이콘을 그리는 함수
function drawIcon(color, size) {
    let canvas = new OffscreenCanvas(size, size); // 오프스크린 캔버스 생성 [cite: 421]
    let context = canvas.getContext('2d'); // 2D 컨텍스트 [cite: 423]

    context.clearRect(0, 0, size, size); // 캔버스 지우기 [cite: 424]
    context.beginPath(); // 새로운 경로 시작 [cite: 425]
    context.fillStyle = color; // 채우기 색상 설정 [cite: 426, 427]
    
    // 원 그리기: 중심 (size/2, size/2), 반지름 size/2 [cite: 428]
    context.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI); 
    
    context.fill(); // 원 채우기 [cite: 429]
    return context.getImageData(0, 0, size, size); // 이미지 데이터 반환 [cite: 430]
}

// 메시지 리스너: 다른 스크립트에서 보낸 메시지를 수신합니다[cite: 411].
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'updateIcon') { // 'updateIcon' 액션인 경우 [cite: 412]
        let iconSizes = [16, 32, 48, 128]; 
        let imageDataDict = {};
        
        // 각 크기에 맞는 아이콘을 그립니다.
        iconSizes.forEach((size) => {
            imageDataDict[size] = drawIcon(msg.value.color, size); // 아이콘 색상으로 그리기 [cite: 417]
        });

        // 확장 프로그램 아이콘 업데이트 [cite: 419]
        chrome.action.setIcon({ imageData: imageDataDict });
    }
});