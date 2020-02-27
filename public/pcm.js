let currentStream = null
let currentAudioContext = null

let sampleInfo = {
    duration: 'N/A',
    rate: 'N/A',
    buffers: [],
    min: 0,
    max: 0,
    avg: 0
}

sampleElem = document.getElementById('sample')
bufferElem = document.getElementById('buffer')

const updateStreamToggle = stream => {
    if (!stream)
        stream = currentStream

    const streamToggle = document.getElementById('toggleStream')

    if (stream && stream.getAudioTracks().length) {
        streamToggle.innerText = "Stop recording"
        streamToggle.onclick = _ => stopMicStream(stream)
    } else {
        streamToggle.innerText = "Start recording"
        streamToggle.onclick = _ => startMicStream(streaming)
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
        sampleInfo.duration = playbackTime
        sampleInfo.rate = inputBuffer.sampleRate
        sampleInfo.buffers = [...sampleInfo.buffers, inputBuffer]

        process(inputBuffer)
    }
}

const process = inputBuffer => {
    // Insert processing
    bufferInfo = inputBuffer.getChannelData(0).reduce((acc, val, i, arr) => ({
        ...acc,
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
    }), { avg: 0, min: 0, max: 0, frequency: 0, amplitude: 0, inversions: 0, data: inputBuffer})

    // Memo: A = 440Hz, oscillation per time
    bufferInfo.frequency = bufferInfo.inversions / inputBuffer.duration
    bufferInfo.amplitude = bufferInfo.max - bufferInfo.min

    sampleElem.replaceChild(renderjson(sampleInfo), sampleElem.firstChild)
    
    sampleInfo = {
        ...sampleInfo,
        min: bufferInfo.min < sampleInfo.min
            ? bufferInfo.min : sampleInfo.min,
        max: bufferInfo.max > sampleInfo.max
            ? bufferInfo.max : sampleInfo.max,
        buffers: [...sampleInfo.buffers, inputBuffer]
        // Avg(n) = sig(dn) / n
        // avg: ???PROFIT???
    }
    
    bufferElem.replaceChild(renderjson(bufferInfo), bufferElem.firstChild)
}