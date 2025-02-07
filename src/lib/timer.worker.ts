let interval: NodeJS.Timer | null = null;
let timeLeft: number = 0;

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      timeLeft = payload.duration;
      if (!interval) {
        interval = setInterval(() => {
          timeLeft -= 1;
          self.postMessage({ type: 'TICK', payload: timeLeft });
          
          if (timeLeft <= 0) {
            clearInterval(interval!);
            interval = null;
            self.postMessage({ type: 'COMPLETE' });
          }
        }, 1000);
      }
      break;

    case 'PAUSE':
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      break;

    case 'RESET':
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      timeLeft = payload.duration;
      self.postMessage({ type: 'TICK', payload: timeLeft });
      break;
  }
}; 