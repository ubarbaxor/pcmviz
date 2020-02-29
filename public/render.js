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

    ctx.moveTo(0,0)
    ctx.lineTo(ctx.canvas.width, 0)
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height)
    ctx.lineTo(0, ctx.canvas.height)
    ctx.lineTo(0,0)
    ctx.stroke()

    window.requestAnimationFrame(draw)
}

draw()
