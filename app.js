document.addEventListener('DOMContentLoaded', () => {
    const timelineTrack = document.getElementById('timeline-track');
    const sleepSlider = document.getElementById('sleep-slider');
    const awakeSlider = document.getElementById('awake-slider');
    const nextSleepSlider = document.getElementById('next-sleep-slider');
    const currentTimeIndicator = document.getElementById('current-time-indicator');
    const wrapper = document.querySelector('.timeline-wrapper');
    const bedtimeDisplay = document.getElementById('bedtime-display');
    const wakeupDisplay = document.getElementById('wakeup-display');
    const bedtimeDateDisplay = document.getElementById('bedtime-date');
    const wakeupDateDisplay = document.getElementById('wakeup-date');
    const currentTimeDisplay = document.getElementById('current-time-display');
    
    // Quick Actions
    const btnSleepNow = document.getElementById('btn-sleep-now');
    const btnWake5am = document.getElementById('btn-wake-5am');
    const btnWake8am = document.getElementById('btn-wake-8am');
    const btnWake5pm = document.getElementById('btn-wake-5pm');

    // Constants
    const HOUR_WIDTH = 100; // Must match CSS --hour-width
    const MINUTE_WIDTH = HOUR_WIDTH / 60;
    const SLEEP_DURATION_HOURS = 8;
    let awakeDurationHours = 16;
    
    // 1 day before and 1 day after -> 3 days total
    const START_OFFSET_DAYS = -1;
    const TOTAL_DAYS = 3;
    
    let baseTime = new Date();
    baseTime.setHours(0, 0, 0, 0); // Start of today
    
    let timelineStartTime = new Date(baseTime);
    timelineStartTime.setDate(timelineStartTime.getDate() + START_OFFSET_DAYS);

    // Initialize Timeline
    function generateTimeline() {
        timelineTrack.innerHTML = '';
        
        for (let i = 0; i < TOTAL_DAYS * 24; i++) {
            const currentHourTime = new Date(timelineStartTime.getTime() + i * 60 * 60 * 1000);
            const hourElement = document.createElement('div');
            hourElement.className = 'hour-marker';
            
            const hour = currentHourTime.getHours();
            
            // Set Day/Night Background Class (Day is 6 AM to 6 PM)
            if (hour >= 6 && hour < 18) {
                hourElement.classList.add('day-time');
            } else {
                hourElement.classList.add('night-time');
            }

            let ampm = hour >= 12 ? 'PM' : 'AM';
            let displayHour = hour % 12 || 12;
            
            // Mark new day
            if (hour === 0) {
                hourElement.classList.add('new-day');
                const dateLabel = document.createElement('div');
                dateLabel.className = 'date-label';
                
                // Format: Mon, Jun 10
                const options = { weekday: 'short', month: 'short', day: 'numeric' };
                let dateString = currentHourTime.toLocaleDateString('en-US', options);
                
                // If it's today, say "Today"
                const today = new Date();
                today.setHours(0,0,0,0);
                if (currentHourTime.getTime() === today.getTime()) {
                    dateString = "Today - " + dateString;
                }
                
                dateLabel.textContent = dateString;
                hourElement.appendChild(dateLabel);
            }
            
            // Do not show 12 AM label if it's the start of the day to avoid overlap with date label
            if (hour !== 0) {
                const timeLabel = document.createElement('div');
                timeLabel.className = 'time-label';
                timeLabel.textContent = `${displayHour} ${ampm}`;
                hourElement.appendChild(timeLabel);
            } else {
                const timeLabel = document.createElement('div');
                timeLabel.className = 'time-label';
                timeLabel.textContent = `12 AM`;
                hourElement.appendChild(timeLabel);
            }
            
            timelineTrack.appendChild(hourElement);
        }
    }

    function formatTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    }

    function getDateLabel(date) {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const targetDate = new Date(date);
        targetDate.setHours(0,0,0,0);
        
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays === -1) return "Yesterday";
        
        return targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    function updateDisplays() {
        const sliderLeft = parseFloat(sleepSlider.style.left) || 0;
        
        // Calculate bedtime
        const bedtimeOffsetMs = (sliderLeft / MINUTE_WIDTH) * 60 * 1000;
        const bedtime = new Date(timelineStartTime.getTime() + bedtimeOffsetMs);
        
        // Calculate wakeup time
        const wakeupTime = new Date(bedtime.getTime() + SLEEP_DURATION_HOURS * 60 * 60 * 1000);
        
        bedtimeDisplay.textContent = formatTime(bedtime);
        wakeupDisplay.textContent = formatTime(wakeupTime);
        
        bedtimeDateDisplay.textContent = getDateLabel(bedtime);
        wakeupDateDisplay.textContent = getDateLabel(wakeupTime);

        // Update Next Sleep and Awake Slider
        const nextSleepLeft = parseFloat(nextSleepSlider.style.left) || (sliderLeft + (SLEEP_DURATION_HOURS + awakeDurationHours) * HOUR_WIDTH);
        
        // Ensure awake width doesn't go negative
        const awakeWidth = Math.max(0, nextSleepLeft - (sliderLeft + SLEEP_DURATION_HOURS * HOUR_WIDTH));
        
        awakeSlider.style.left = `${sliderLeft + SLEEP_DURATION_HOURS * HOUR_WIDTH}px`;
        awakeSlider.style.width = `${awakeWidth}px`;
        
        const awakeHours = awakeWidth / HOUR_WIDTH;
        awakeSlider.querySelector('.slider-content').textContent = `Awake (${Math.round(awakeHours * 10) / 10}h)`;
        
        const nextBedtimeOffsetMs = (nextSleepLeft / MINUTE_WIDTH) * 60 * 1000;
        const nextBedtime = new Date(timelineStartTime.getTime() + nextBedtimeOffsetMs);
        nextSleepSlider.querySelector('.slider-content').textContent = `Next Sleep: ${formatTime(nextBedtime)}`;
    }

    function updateCurrentTime() {
        const now = new Date();
        currentTimeDisplay.textContent = formatTime(now);
        
        const offsetMs = now.getTime() - timelineStartTime.getTime();
        const offsetMinutes = offsetMs / (60 * 1000);
        const indicatorLeft = offsetMinutes * MINUTE_WIDTH;
        
        currentTimeIndicator.style.left = `${indicatorLeft}px`;
        return indicatorLeft;
    }

    function centerTimeline(targetLeft) {
        const wrapperWidth = wrapper.clientWidth;
        wrapper.scrollTo({
            left: targetLeft - wrapperWidth / 2 + (SLEEP_DURATION_HOURS * HOUR_WIDTH) / 2,
            behavior: 'smooth'
        });
    }

    // Helper to snap wake up time
    function snapWakeUpTo(targetHour, targetAmpm) {
        let hour24 = targetHour;
        if (targetAmpm === 'PM' && targetHour < 12) hour24 += 12;
        if (targetAmpm === 'AM' && targetHour === 12) hour24 = 0;

        const now = new Date();
        
        // Start by checking today
        let targetDate = new Date(now);
        targetDate.setHours(hour24, 0, 0, 0);

        // Calculate current wake up time if we slept now
        const wakeIfSleepNow = new Date(now.getTime() + SLEEP_DURATION_HOURS * 60 * 60 * 1000);

        // We want to find the NEXT occurrence of the target time that makes sense.
        // If the target time is earlier than when we'd wake up sleeping right now, 
        // it means we probably want the target time TOMORROW (or later today if it's way later).
        // A simple rule: find the target time that is strictly in the future.
        if (targetDate.getTime() < now.getTime()) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        // Calculate bedtime by subtracting sleep duration
        const targetBedtime = new Date(targetDate.getTime() - SLEEP_DURATION_HOURS * 60 * 60 * 1000);
        
        const offsetMs = targetBedtime.getTime() - timelineStartTime.getTime();
        const offsetMinutes = offsetMs / (60 * 1000);
        let targetLeft = offsetMinutes * MINUTE_WIDTH;

        // Boundaries
        const maxLeft = (TOTAL_DAYS * 24 * HOUR_WIDTH) - (SLEEP_DURATION_HOURS * HOUR_WIDTH);
        if (targetLeft < 0) targetLeft = 0;
        if (targetLeft > maxLeft) targetLeft = maxLeft;

        sleepSlider.style.left = `${targetLeft}px`;
        nextSleepSlider.style.left = `${targetLeft + (SLEEP_DURATION_HOURS + awakeDurationHours) * HOUR_WIDTH}px`;
        updateDisplays();
        centerTimeline(targetLeft);
    }

    // Quick Actions
    btnSleepNow.addEventListener('click', () => {
        const currentPos = updateCurrentTime();
        sleepSlider.style.left = `${currentPos}px`;
        nextSleepSlider.style.left = `${currentPos + (SLEEP_DURATION_HOURS + awakeDurationHours) * HOUR_WIDTH}px`;
        updateDisplays();
        centerTimeline(currentPos);
    });

    btnWake5am.addEventListener('click', () => snapWakeUpTo(5, 'AM'));
    btnWake8am.addEventListener('click', () => snapWakeUpTo(8, 'AM'));
    btnWake5pm.addEventListener('click', () => snapWakeUpTo(5, 'PM'));

    // Slider Dragging Logic
    let isDragging = false;
    let isDraggingNext = false;
    let startX = 0;
    let sliderStartLeft = 0;

    sleepSlider.addEventListener('mousedown', (e) => {
        isDragging = true;
        sleepSlider.classList.add('dragging');
        startX = e.clientX;
        sliderStartLeft = parseFloat(sleepSlider.style.left) || 0;
        e.preventDefault(); // prevent text selection
    });

    nextSleepSlider.addEventListener('mousedown', (e) => {
        isDraggingNext = true;
        nextSleepSlider.classList.add('dragging');
        startX = e.clientX;
        sliderStartLeft = parseFloat(nextSleepSlider.style.left) || 0;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - startX;
            let newLeft = sliderStartLeft + deltaX;
            
            // Boundaries
            const maxLeft = (TOTAL_DAYS * 24 * HOUR_WIDTH) - (SLEEP_DURATION_HOURS * HOUR_WIDTH);
            if (newLeft < 0) newLeft = 0;
            if (newLeft > maxLeft) newLeft = maxLeft;
            
            sleepSlider.style.left = `${newLeft}px`;
            nextSleepSlider.style.left = `${newLeft + (SLEEP_DURATION_HOURS + awakeDurationHours) * HOUR_WIDTH}px`;
            updateDisplays();
        } else if (isDraggingNext) {
            const deltaX = e.clientX - startX;
            let newLeft = sliderStartLeft + deltaX;
            
            const minLeft = parseFloat(sleepSlider.style.left) + SLEEP_DURATION_HOURS * HOUR_WIDTH;
            if (newLeft < minLeft) newLeft = minLeft;
            
            nextSleepSlider.style.left = `${newLeft}px`;
            awakeDurationHours = (newLeft - parseFloat(sleepSlider.style.left) - SLEEP_DURATION_HOURS * HOUR_WIDTH) / HOUR_WIDTH;
            updateDisplays();
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            sleepSlider.classList.remove('dragging');
        }
        if (isDraggingNext) {
            isDraggingNext = false;
            nextSleepSlider.classList.remove('dragging');
        }
    });

    // Touch support for slider
    sleepSlider.addEventListener('touchstart', (e) => {
        isDragging = true;
        sleepSlider.classList.add('dragging');
        startX = e.touches[0].clientX;
        sliderStartLeft = parseFloat(sleepSlider.style.left) || 0;
    }, {passive: false});

    nextSleepSlider.addEventListener('touchstart', (e) => {
        isDraggingNext = true;
        nextSleepSlider.classList.add('dragging');
        startX = e.touches[0].clientX;
        sliderStartLeft = parseFloat(nextSleepSlider.style.left) || 0;
    }, {passive: false});

    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault(); // prevent scrolling while dragging
            const deltaX = e.touches[0].clientX - startX;
            let newLeft = sliderStartLeft + deltaX;
            
            const maxLeft = (TOTAL_DAYS * 24 * HOUR_WIDTH) - (SLEEP_DURATION_HOURS * HOUR_WIDTH);
            if (newLeft < 0) newLeft = 0;
            if (newLeft > maxLeft) newLeft = maxLeft;
            
            sleepSlider.style.left = `${newLeft}px`;
            nextSleepSlider.style.left = `${newLeft + (SLEEP_DURATION_HOURS + awakeDurationHours) * HOUR_WIDTH}px`;
            updateDisplays();
        } else if (isDraggingNext) {
            e.preventDefault();
            const deltaX = e.touches[0].clientX - startX;
            let newLeft = sliderStartLeft + deltaX;
            
            const minLeft = parseFloat(sleepSlider.style.left) + SLEEP_DURATION_HOURS * HOUR_WIDTH;
            if (newLeft < minLeft) newLeft = minLeft;
            
            nextSleepSlider.style.left = `${newLeft}px`;
            awakeDurationHours = (newLeft - parseFloat(sleepSlider.style.left) - SLEEP_DURATION_HOURS * HOUR_WIDTH) / HOUR_WIDTH;
            updateDisplays();
        }
    }, {passive: false});

    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            sleepSlider.classList.remove('dragging');
        }
        if (isDraggingNext) {
            isDraggingNext = false;
            nextSleepSlider.classList.remove('dragging');
        }
    });

    // Wrapper panning
    let isPanning = false;
    let panStartX = 0;
    let scrollStart = 0;

    wrapper.addEventListener('mousedown', (e) => {
        if (e.target.closest('.sleep-slider') || e.target.closest('.next-sleep-slider') || e.target.closest('.awake-slider')) return;
        isPanning = true;
        panStartX = e.clientX;
        scrollStart = wrapper.scrollLeft;
        wrapper.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        const deltaX = e.clientX - panStartX;
        wrapper.scrollLeft = scrollStart - deltaX;
    });

    document.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            wrapper.style.cursor = 'grab';
        }
    });

    // Initialization
    generateTimeline();
    const currentPos = updateCurrentTime();
    
    // Set initial slider position to current time
    sleepSlider.style.left = `${currentPos}px`;
    nextSleepSlider.style.left = `${currentPos + (SLEEP_DURATION_HOURS + awakeDurationHours) * HOUR_WIDTH}px`;
    updateDisplays();
    
    // Center the view on the current time without smooth scroll initially
    const wrapperWidth = wrapper.clientWidth;
    wrapper.scrollLeft = currentPos - wrapperWidth / 2 + (SLEEP_DURATION_HOURS * HOUR_WIDTH) / 2;

    // Update current time indicator every minute
    setInterval(updateCurrentTime, 60000);
});
