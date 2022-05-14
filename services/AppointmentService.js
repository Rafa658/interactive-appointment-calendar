var mongoose = require("mongoose")
var appointment = require("../models/Appointment")
var AppointmentFactory = require("../factories/AppointmentFactory")
const mailer = require("nodemailer")

const Appo = mongoose.model("Appointment", appointment)

class AppointmentService {

    async Create(name, email, description, cpf, date, time) {
        var newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
            notified: false
        })
        try {
            await newAppo.save()
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    async GetAll(showFinished) {
        if (showFinished) {
            return await Appo.find()
        } else {
            var appos = await Appo.find({ "finished": false })
            var appointments = []

            appos.forEach(appointment => {

                if (appointment.date != undefined) {
                    appointments.push(AppointmentFactory.Build(appointment))
                }
            })

            return appointments
        }
    }

    async GetById(id) {
        try {
            var event = await Appo.findOne({ "_id": id })
            return event
        } catch (error) {
            console.log(error)
        }
    }

    async Finish(id) {
        try {
            await Appo.findByIdAndUpdate(id, { finished: true })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    async Search(query) {
        try {
            var appos = await Appo.find({ $or: [{ email: query }, { cpf: query }] })
            return appos
        } catch (error) {
            console.log(error)
            return []
        }
    }

    async SendNotification() {

        var transporter = mailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 25,
            auth: {
                user: "58a2cfd2b35e1d",
                pass: "e5907c0b9da1af"
            }
        })

        var appos = await this.GetAll(false)

        appos.forEach(async app => {
            var date = app.start.getTime()
            var hour = 1000 * 60 * 60
            var gap = date - Date.now()

            if (gap <= hour && !app.notified) {

                await Appo.findByIdAndRemove(app.id, {notified: true})

                transporter.sendMail({
                    from: "Rafael Silva <rafael@teste.com.br>",
                    to: app.email,
                    subject: "Sua consulta vai acontecer em breve!",
                    text: "Sua consulta ocorrerá em uma hora."
                })
                .then(() => {

                })
                .catch(err => {

                })
            }
        })
    }
}

module.exports = new AppointmentService()   // já cria um objeto na hora do require