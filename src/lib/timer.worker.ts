let duration = 0;
let timerId: NodeJS.Timeout | null = null;

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      if (payload.duration) {
        duration = payload.duration;
      }
      if (timerId) {
        clearInterval(timerId);
      }
      timerId = setInterval(() => {
        duration--;
        postMessage({ type: 'TICK', payload: duration });
        if (duration <= 0) {
          clearInterval(timerId);
          timerId = null;
          postMessage({ type: 'COMPLETE', payload: {
            title: "Session Complete",
            body: "Time for a break!" // Or customize based on work/break
          }});
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
      postMessage({ type: 'TICK', payload: duration });
      break;
  }
};

// Example for a "20% remaining" notification (you'd need to add logic to trigger this)
postMessage({
  type: 'NOTIFICATION',
  payload: {
    title: '20% Remaining',
    body: 'You have 20% of your time left.',
  },
}); 