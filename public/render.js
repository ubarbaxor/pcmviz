const canvas = document.getElementById('render')
const canvasContainer = document.getElementById('canvasContainer')

const context = canvas.getContext('2d')

const resizeCanvas = (ctx = context, w, h) => {
    ctx.canvas.width = w || canvasContainer.clientWidth
    ctx.canvas.height = h || window.innerHeight - canvas.offsetTop
}

const draw = _ => {
    resizeCanvas()
    ctx = context

    const xMax = ctx.canvas.width
    const yMax = ctx.canvas.height
    const yNul = yMax / 2

    project = v => {
        const Vmax = 2
        const Y0 = yMax / 2

        const Yv = Y0 - (v / Vmax) * Y0

        return Yv
    }

    // Data representation
    // Draw a box / border
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.strokeRect(0,0,ctx.canvas.width, ctx.canvas.height)

    // Zero Y line
    ctx.beginPath()
    ctx.setLineDash([1, 4])
    ctx.moveTo(0, project(0))
    ctx.lineTo(xMax, project(0))
    ctx.stroke()
    ctx.setLineDash([])

    // sample stuff
    // Max value
    const sampleMax = project(sampleInfo.max)
    ctx.beginPath()
    ctx.moveTo(0, sampleMax)
    ctx.lineTo(xMax, sampleMax)
    ctx.strokeStyle = 'red'
    ctx.stroke()
    // min value
    const sampleMin = project(sampleInfo.min)
    ctx.beginPath()
    ctx.moveTo(0, sampleMin)
    ctx.lineTo(xMax, sampleMin)
    ctx.strokeStyle = 'blue'
    ctx.stroke()

    if (sampleInfo.buffers.length){
        bufferData = bufferInfo.data.getChannelData(0)
        bufferData.map((v, i) => {
            const y = project(v)
            const x = i * xMax / bufferData.length

            ctx.beginPath()
            ctx.moveTo(x, yNul)
            ctx.lineTo(x, y)
            ctx.stroke()
        })
    }
    window.requestAnimationFrame(draw)
}

draw()
