let completedLevels = JSON.parse(localStorage.getItem('levels'));
const rewardCounter = document.getElementById('rewardsCounter');
const rewardContainer = document.getElementById('rewardsWrapper');

if (completedLevels && completedLevels.length) {
    rewardContainer.innerHTML = '';
    rewardCounter.textContent = completedLevels.length;
    completedLevels.sort((a, b) => a - b);

    const levelCards = completedLevels.map((level) => {
        const card = document.createElement('div');
        card.classList.add('reward-card');
        const image = document.createElement('img');
        image.src = `../assets/img/${level}.png`;
        image.alt = `level ${level} reward`;

        const span = document.createElement('span');
        span.textContent = `level ${level}`;
        
        card.appendChild(image);
        card.appendChild(span);

        return card;
    });

    rewardContainer.append(...levelCards);
} else {
    rewardCounter.textContent = 0;
}