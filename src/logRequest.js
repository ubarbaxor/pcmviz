const middleware = (req, res, next) => {
    const date = new Date()

    const dd = ('0' + date.getDate()).slice(-2)
    const mm = ('0' + date.getMonth()).slice(-2)
    const yy = ('' + date.getFullYear()).slice(-2)
    const HH = ('' + date.getHours()).slice(-2)
    const MM = ('' + date.getMinutes()).slice(-2)
    const SS = ('' + date.getSeconds()).slice(-2)

    const format = `${dd}/${mm}/${yy} ${HH}:${MM}:${SS} ${req.ip} ${req.method} ${req.path}`

    console.log(format)
    next()
}

module.exports = middleware