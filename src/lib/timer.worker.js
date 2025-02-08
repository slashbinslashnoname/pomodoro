console.log('Worker script started - VERIFYING WORKER EXECUTION');

let timerId = null;
let duration = 0;
let isRunning = false;
let timerState = 'work';

const startTimer = (initialDuration, currentTimerState) => {
    duration = initialDuration;
    timerState = currentTimerState;
    isRunning = true;

    timerId = setInterval(() => {
        if (!isRunning) return;

        duration--;
        console.log('Worker TICK - duration:', duration);
        postMessage({ type: 'TICK', payload: duration });

        if (duration <= 0) {
            clearInterval(timerId);
            timerId = null;
            isRunning = false;
            postMessage({
                type: 'COMPLETE',
                payload: {
                    title: `${timerState === 'work' ? 'Work' : 'Break'} Session Complete`,
                    body: `Time for a ${timerState === 'work' ? 'break' : 'work'} session.`,
                }
            });
        }
    }, 1000);
};

const stopTimer = () => {
    isRunning = false;
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
};

const resetTimer = (resetDuration, resetTimerState) => {
    stopTimer();
    duration = resetDuration;
    timerState = resetTimerState;
    postMessage({ type: 'TICK', payload: duration });
};

self.onmessage = (e) => {
    const { type, payload } = e.data;
    console.log('Worker received message:', type, payload);

    switch (type) {
        case 'START':
            startTimer(payload.duration, payload.timerState);
            break;
        case 'PAUSE':
            stopTimer();
            break;
        case 'RESET':
            resetTimer(payload.duration, payload.timerState);
            break;
    }
}; 