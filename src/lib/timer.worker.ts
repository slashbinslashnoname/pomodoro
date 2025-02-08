let duration = 0;
let timerId: number | null | NodeJS.Timeout = null;
let timerState: 'work' | 'break' = 'work';

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      if (payload.duration) {
        duration = payload.duration;
      }
      if (payload.timerState) {
        timerState = payload.timerState;
      }
      if (timerId) {
        clearInterval(timerId);
      }
      timerId = setInterval(() => {
        duration--;
        postMessage({ type: 'TICK', payload: duration });
        if (duration <= 0) {
          if (timerId) {
            clearInterval(timerId);
          }
          timerId = null;
          const nextState = timerState === 'work' ? 'break' : 'work';
          postMessage({
            type: 'COMPLETE', payload: {
              title: `${timerState === 'work' ? 'Work' : 'Break'} Session Complete`,
              body: `Time for a ${nextState === 'work' ? 'work' : 'break'} session.`,
            }
          });
        }
      }, 1000);
      break;

    case 'PAUSE':
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      break;

    case 'RESET':
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      duration = payload.duration;
      if (payload.timerState) {
        timerState = payload.timerState;
      }
      postMessage({ type: 'TICK', payload: duration });
      break;
  }
};

