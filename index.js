const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const appointmentService = require("../Projeto Agendamento com MongoDB/services/AppointmentService")
const AppointmentService = require("../Projeto Agendamento com MongoDB/services/AppointmentService")

app.use(express.static("public"))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

mongoose.connect('mongodb://127.0.0.1:27017/agendamento', { useNewUrlParser: true, useUnifiedTopology: true })

app.get("/", (req, res) => {
    res.render("index") // renderiza a view index
})

app.get('/cadastro', (req, res) => {
    res.render("create")    // vai renderizar a view "create.ejs"
})

app.post("/create", async (req, res) => {
    body = req.body
    var status = await appointmentService.Create(
        body.name,
        body.email,
        body.description,
        body.cpf,
        body.date,
        body.time
    )
    if (status) {
        res.redirect("/")
    } else {
        res.send("Erro")
    }
})

app.get("/getcalendar", async (req, res) => {
    var appointments = await AppointmentService.GetAll(false)
    res.json(appointments)
})

app.get("/event/:id", async (req, res) => {
    var appointment = await AppointmentService.GetById(req.params.id)
    console.log(appointment)
    res.render("event", {appo: appointment})
})

app.post("/finish", async (req, res) => {
    var id = req.body.id
    await AppointmentService.Finish(id)

    res.redirect("/")
})

app.get("/list", async (req, res) => {
    var appos = await AppointmentService.GetAll(true)
    res.render("list", {appos})
})

app.get("/searchresult", async (req, res) => {
    // método get -> dados passados via query
    // método post -> dados passados via body
    var appos = await AppointmentService.Search(req.query.search)
    res.render("list", {appos})
})

var pollTime = 2 * 60 * 1000    // a cada 2 min vai verificar o sistema para ver consultas
                                // perto de ocorrer

setInterval(async () => {
    await AppointmentService.SendNotification()
}, pollTime)

app.listen(3000, () => {})