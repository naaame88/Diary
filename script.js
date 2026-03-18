// script.js

document.addEventListener('DOMContentLoaded', () => {
    
    const catTrigger = document.getElementById('cat-click');
    const overlay = document.getElementById('screen-overlay');

    if (catTrigger) {
        catTrigger.addEventListener('click', (event) => {
            
            // 1. 기본 링크 이동 동작을 일단 막음 (애니메이션을 먼저 보여주기 위해)
            event.preventDefault(); 
            
            // 2. 오버레이에 'active' 클래스를 추가하여 블랙 화면으로 서서히 가림
            overlay.classList.add('active');
            
            // 3. 고양이 이미지가 부드럽게 작아지며 사라지게 함
            catTrigger.style.transform = 'scale(0.8) translateY(-50px)';
            catTrigger.style.opacity = '0';
            catTrigger.style.transition = 'transform 0.8s ease-in-out, opacity 0.8s';

            // 4. 애니메이션이 끝난 후 (800ms) 실제 일기 목록 페이지로 이동
            setTimeout(() => {
                window.location.href = catTrigger.getAttribute('href'); 
            }, 800); 

        });
    }
});