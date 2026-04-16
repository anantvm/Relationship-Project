document.addEventListener("DOMContentLoaded", () => {
    // 1. Time Together Counter
    // Using a dummy start date: January 1, 2023 at 00:00:00
    let startDate = new Date("2023-01-01T00:00:00").getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCounter() {
        const now = new Date().getTime();
        const difference = now - startDate;

        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Update DOM safely
        if (daysEl.innerText !== days.toString()) daysEl.innerText = days;
        if (hoursEl.innerText !== hours.toString().padStart(2, '0')) hoursEl.innerText = hours.toString().padStart(2, '0');
        if (minutesEl.innerText !== minutes.toString().padStart(2, '0')) minutesEl.innerText = minutes.toString().padStart(2, '0');
        if (secondsEl.innerText !== seconds.toString().padStart(2, '0')) secondsEl.innerText = seconds.toString().padStart(2, '0');
    }

    // Initialize and set interval
    updateCounter();
    setInterval(updateCounter, 1000);

    // 2. Floating Hearts Background Animation
    const heartsContainer = document.getElementById('hearts-container');
    const heartEmojis = ['❤️', '💖', '💕', '💗', '💓', '💘', '💝'];

    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        
        // Randomize heart appearance and start position
        heart.innerText = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        
        // Randomize size and animation duration for varied effect
        const size = Math.random() * 1.5 + 0.8; // 0.8rem to 2.3rem
        heart.style.fontSize = `${size}rem`;
        
        const floatDuration = Math.random() * 6 + 7; // 7s to 13s
        const swayDuration = Math.random() * 3 + 3; // 3s to 6s
        
        heart.style.animationDuration = `${floatDuration}s, ${swayDuration}s`;
        
        // Randomize opacity
        heart.style.opacity = Math.random() * 0.4 + 0.3;

        heartsContainer.appendChild(heart);

        // Remove heart after animation to keep DOM clean
        setTimeout(() => {
            heart.remove();
        }, floatDuration * 1000);
    }

    // Create a new heart every 400ms
    setInterval(createHeart, 600);

    // Initial burst of hearts so the screen isn't empty at start
    for (let i = 0; i < 15; i++) {
        setTimeout(createHeart, Math.random() * 3000);
    }

    // 3. Fetch Data and Populate Stats
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.totalMessages !== undefined) {
                document.getElementById('totalMessages').innerText = data.totalMessages.toLocaleString();
            }
            if (data.topSender) {
                document.getElementById('topSender').innerText = data.topSender;
            }
            if (data.mostActiveHour) {
                const hour = parseInt(data.mostActiveHour, 10);
                if (!isNaN(hour)) {
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    // Adding a generic range, since it's an hour
                    document.getElementById('activeHour').innerText = `${displayHour} ${ampm} - ${displayHour === 12 ? 1 : displayHour + 1} ${displayHour === 11 ? (ampm === 'AM' ? 'PM' : 'AM') : ampm}`;
                } else {
                    document.getElementById('activeHour').innerText = data.mostActiveHour;
                }
            }
            if (data.messagesPerDay !== undefined) {
                document.getElementById('messagesPerDay').innerText = data.messagesPerDay.toLocaleString();
            }
            if (data.firstDate) {
                startDate = new Date(data.firstDate).getTime();
            }
            if (data.mostUsedEmoji) {
                document.getElementById('mostUsedEmoji').innerText = data.mostUsedEmoji;
            }
            if (data.firstTexter) {
                document.getElementById('firstTexter').innerText = data.firstTexter;
            }
            if (data.totalDaysChatted !== undefined) {
                document.getElementById('totalDaysChatted').innerText = `${data.totalDaysChatted} Days`;
            }
            if (data.longestStreak !== undefined) {
                document.getElementById('longestStreak').innerText = `${data.longestStreak} Days`;
            }
            if (data.firstMessage) {
                document.getElementById('firstSender').innerText = data.firstMessage.sender + " says:";
                document.getElementById('firstMessageText').innerText = `"${data.firstMessage.message}"`;
            }
        })
        .catch(error => console.error("Error fetching data:", error));
});
