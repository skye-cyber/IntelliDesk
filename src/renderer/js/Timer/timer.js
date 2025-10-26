
export class Timer {
	constructor() {
		this.startTime = null;
	}

	trackTime(action) {
		// Store the start time
		if (action === 'start') {
			if (this.startTime !== null) {
				//console.log('Timer has already been started. Restarting');
				//return null;
			}
			this.startTime = performance.now();
			//console.log('Timer started at:', this.startTime);
		}
		// Calculate the elapsed time
		else if (action === 'stop') {
			if (this.startTime === null) {
				console.log('Timer was not started.');
				return null;
			}
			const endTime = performance.now();
			const timeTaken = endTime - this.startTime;
			//console.log(`Time taken: ${timeTaken} milliseconds.`);
			//console.log('Stop time:', endTime)
			this.startTime = null; // Clean up

			// Ensure window.Notify is defined before calling it
			if (typeof window.Notify === 'function') {
				const seconds = Math.floor(timeTaken / 1000) % 60;
				const milliseconds = Math.floor(timeTaken % 1000);
				window.Notify(null, `${seconds} seconds and ${milliseconds} ms`);
				// Call app systewide notify
				window.electron.send('Notify', { message: timeTaken });
			} else {
				console.error('window.Notify is not defined.');
			}

			return timeTaken;
		}
		// Interrupt the timer
		else if (action === 'interrupt') {
			//console.log("Timer Interrupted")
			this.startTime = null;
		}
		// Invalid action
		else {
			console.log('Invalid action. Use "start" to start the timer and "stop" to stop the timer.');
			return null;
		}
	}
}

window.Timer = Timer
