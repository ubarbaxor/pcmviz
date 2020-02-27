let currentStream = null
let currentAudioContext = null

let firstFrame = null
let sample = {
    duration: 'N/A',
    rate: 'N/A',
    buffers: [],
    min: 'N/A',
    max: 'N/A',
    avg: 'N/A'
}

jsonContainer = document.getElementById('json-container')

const updateStreamToggle = stream => {
    if (!stream)
        stream = currentStream

    const streamToggle = document.getElementById('toggleStream')

    if (stream && stream.getAudioTracks().length) {
        document.getElementById('toggleStream').innerText = "Stop recording"
        document.getElementById('toggleStream').onclick = _ => stopMicStream(stream)
    } else {
        document.getElementById('toggleStream').innerText = "Start recording"
        document.getElementById('toggleStream').onclick = _ => startMicStream(streaming)
    }
}

const startMicStream = cb => {
    if (!cb)
        cb = streaming
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
    }).then(cb)
}

const stopMicStream = stream => {
    if (!stream)
        stream = currentStream

    stream.getAudioTracks().forEach(track => {
        track.stop()
        stream.removeTrack(track)
    });

    if (stream == currentStream && !stream.getAudioTracks().length)
        currentStream = null
    
    currentAudioContext && currentAudioContext.close()
        .then(_ => { currentAudioContext = null })
        .then(updateStreamToggle)
}

const streaming = stream => {
    if (currentStream == null)
        currentStream = stream

    updateStreamToggle()

    stream.addEventListener('removetrack', e => {
        console.log(`Track removed`)
        console.log(e)
        updateStreamToggle()
    })

    processAudio(stream)
}

const processAudio = stream => {
    const audioContext = new AudioContext()
    currentAudioContext = audioContext

    const source = audioContext.createMediaStreamSource(stream)
    const processor = audioContext.createScriptProcessor(1024, 1, 1)

    source.connect(processor)
    processor.connect(audioContext.destination)

    processor.onaudioprocess = ({ playbackTime, inputBuffer }) => {
        if (!firstFrame) {
            firstFrame = inputBuffer
            console.log(firstFrame)
        }

        document.getElementById('playback').innerText = `Sample duration: ${playbackTime}`
        document.getElementById('rate').innerText = `Sampling rate: ${inputBuffer.sampleRate}`
        sample.duration = playbackTime
        sample.rate = inputBuffer.sampleRate
        sample.buffers = [...sample.buffers, inputBuffer]

        process(inputBuffer)
    }
}

const process = inputBuffer => {
    // Insert processing
    lastData = inputBuffer.getChannelData(0).reduce((acc, val, i, arr) => ({
        avg: acc.avg + val / arr.length,
        min: val < acc.min
            ? val
            : acc.min,
        max: val > acc.max
            ? val
            : acc.max,
        inversions: i && val * arr[i-1] < 0
            ? acc.inversions + 1
            : acc.inversions
    }), { avg: 0, min: 0, max: 0, frequency: 0, amplitude: 0, inversions: 0})

    // Memo: A = 440Hz, oscillation per time
    lastData.frequency = lastData.inversions / inputBuffer.duration
    lastData.amplitude = lastData.max - lastData.min

    jsonContainer.replaceChild(renderjson(lastData), jsonContainer.firstChild)
    console.log(lastData)
}