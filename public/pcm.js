let currentStream = null
let currentAudioContext = null

let sampleInfo = {
    duration: 'N/A',
    min: 'N/A',
    max: 'N/A',
    avg: 'N/A',
    rate: 'N/A',
    buffers: [],
}

const reset = _ => {
    console.log('reset')
    sampleInfo = {
        duration: 'N/A',
        rate: 'N/A',
        buffers: [],
        min: 'N/A',
        max: 'N/A',
        avg: 'N/A'
    }

    bufferInfo = {
        min: 'N/A',
        max: 'N/A',
        avg: 'N/A',
        frequency: 'N/A',
        amplitude: 'N/A',
        inversions: 'N/A',
        data: []
    }

    if (currentStream) {
        stopMicStream(currentStream)
        startMicStream(streaming)
    }
    bufferElem.replaceChild(renderjson(bufferInfo), bufferElem.firstChild)
    sampleElem.replaceChild(renderjson(sampleInfo), sampleElem.firstChild)
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
        sampleInfo.duration = playbackTime.toFixed(2)
        sampleInfo.rate = inputBuffer.sampleRate

        process(inputBuffer)
    }
}

const process = inputBuffer => {
    // Insert processing
    bufferInfo = inputBuffer.getChannelData(0).reduce((acc, val, i, arr) => ({
        ...acc,
        min: val < acc.min
            ? val
            : acc.min,
        max: val > acc.max
            ? val
            : acc.max,
        avg: acc.avg + val / arr.length,
        inversions: i && val * arr[i-1] < 0
            ? acc.inversions + 1
            : acc.inversions
    }), { min: 0, max: 0, avg: 0, frequency: 0, amplitude: 0, inversions: 0, data: inputBuffer })

    // Memo: A = 440Hz, oscillation per time
    bufferInfo.frequency = bufferInfo.inversions / inputBuffer.duration
    bufferInfo.amplitude = bufferInfo.max - bufferInfo.min
    
    sampleInfo = {
        ...sampleInfo,
        min: sampleInfo.min < bufferInfo.min
            ? sampleInfo.min : bufferInfo.min,
        max: sampleInfo.max > bufferInfo.max
            ?  sampleInfo.max : bufferInfo.max,
        avg: sampleInfo.buffers.length
            ? sampleInfo.avg
                * sampleInfo.buffers.length / (sampleInfo.buffers.length + 1)
                + bufferInfo.avg / (sampleInfo.buffers.length + 1)
            : bufferInfo.avg,
        buffers: [...sampleInfo.buffers, inputBuffer]
    }
    
    bufferElem.replaceChild(renderjson(bufferInfo), bufferElem.firstChild)
    sampleElem.replaceChild(renderjson(sampleInfo), sampleElem.firstChild)
}