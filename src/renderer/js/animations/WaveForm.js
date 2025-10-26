export class RecordingAnimator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width
        this.height
        this.cx
        this.cy;
        // Create sphere points
        this.dots = [];
        this.radius = 200;
        this.count = 400;
        // Rotation and audio level variables
        this.angle = 0;
        this.audioLevel = 0.5;
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.cx = this.width / 2;
        this.cy = this.height / 2;
    }

    setResizeEventListener() {
        window.addEventListener("resize", this.resize);
        this.resize();
    }

    initAnimation() {
        this.setResizeEventListener()
        // We'll assume our analyser provides about 128 frequency bins
        const numFreqBins = 80;

        for (let i = 0; i < count; i++) {
            const theta = Math.acos(2 * Math.random() - 1);
            const phi = 2 * Math.PI * Math.random();
            dots.push({
                x: this.radius * Math.sin(theta) * Math.cos(phi),
                y: this.radius * Math.sin(theta) * Math.sin(phi),
                z: this.radius * Math.cos(theta),
                color: this.getRandomColor(),
                size: Math.random() * 3 + 1,
                // Assign a random frequency bin to this dot
                freqBin: Math.floor(Math.random() * numFreqBins)
            });
        }
    }

    getRandomColor() {
        const h = Math.floor(Math.random() * 360);
        return `hsl(${h}, 100%, 60%)`;
    }

    async SetAudioAnimation(stream) {
        try {
            // Setup Web Audio API
            console.log("Getting audio from the provided stream...");
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount; // ~128 bins
            const dataArray = new Uint8Array(bufferLength);

            function animate() {
                this.ctx.clearRect(0, 0, this.width, this.height);

                // Get current audio frequency data
                analyser.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
                audioLevel = avg / 256; // Normalize between 0 and 1

                // Adjust rotation speed based on overall audio level
                this.angle += 0.01 + audioLevel * 0.05;

                for (let dot of dots) {
                    // Rotate dot around Y axis
                    const x = dot.x * Math.cos(this.angle) - dot.z * Math.sin(this.angle);
                    const z = dot.x * Math.sin(this.angle) + dot.z * Math.cos(this.angle);
                    let y = dot.y;

                    // Perspective projection
                    const scale = 500 / (500 + z);
                    let x2d = x * scale + this.cx;
                    let y2d = y * scale + this.cy;

                    // AI-ish dynamic clustering:
                    // Get amplitude for this dot's frequency bin
                    const amplitudeForDot = dataArray[dot.freqBin] / 256;
                    // Map the frequency bin to a factor (lower bins get positive, higher negative)
                    const freqFactor = dot.freqBin / bufferLength;
                    // Calculate vertical offset (tweak the multiplier for stronger effect)
                    const yOffset = (0.5 - freqFactor) * amplitudeForDot * 50;

                    y2d += yOffset;

                    this.ctx.beginPath();
                    // Dot size can also pulse with the audio level
                    this.ctx.arc(x2d, y2d, dot.size * (1 + audioLevel), 0, Math.PI * 2);
                    this.ctx.fillStyle = dot.color;
                    this.ctx.fill();
                }

                requestAnimationFrame(animate);
            }
            animate();
        } catch (err) {
            console.error("Microphone access denied.", err);
        }
    }

}
