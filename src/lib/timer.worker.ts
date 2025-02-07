let timeLeft = 0;
let timerId: NodeJS.Timeout | null = null;

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      if (payload.duration) {
        timeLeft = payload.duration;
      }
      if (timerId) {
        clearInterval(timerId);
      }
      timerId = setInterval(() => {
        timeLeft--;
        self.postMessage({ type: 'TICK', payload: timeLeft });
        if (timeLeft <= 0) {
          if (timerId) clearInterval(timerId);
          timerId = null;
          self.postMessage({ type: 'COMPLETE' });
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
      timeLeft = payload.duration;
      self.postMessage({ type: 'TICK', payload: timeLeft });
      break;
  }
}; 