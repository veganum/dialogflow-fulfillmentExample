'use strict';
const express = require('express');
const app = express();
const dfff = require('dialogflow-fulfillment');
const nodemailer = require("nodemailer");
const axios = require('axios');

const bbdd = require('./db/bbdd');

//Mensaje principal endpoint
app.get('/', (req, res) => {
    //res.send("¡¡En directoo!!")
    res.sendFile('index.html', { root: __dirname })

});

app.post('/', express.json(), (req, res) => {

    const agent = new dfff.WebhookClient({
        request: req,
        response: res
    });

    //Para ver cabeceras
    //console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
    //Para ver el body
    //console.log('Dialogflow Request body: ' + JSON.stringify(req.body));


    //Ejemplo de mensaje simple
    function demo(agent) {
        agent.add("Enviando respuesta al Wekhook server");
    }

    //Ejemplo de mensaje enriquecido
    function customPayloadDemo(agent) {
        var payloadData = {
            "richContent": [
                [{
                    "type": "accordion",
                    "title": "Accordion titulo",
                    "subtitle": "Accordion subtitulo",
                    "image": {
                        "src": {
                            "rawUrl": "https://example.com/images/logo.png"
                        }
                    },
                    "text": "Aqui se pone el texto "
                }]
            ]
        }

        agent.add(new dfff.Payload(agent.UNSPECIFIED, payloadData, {
            sendAsMessage: true,
            rawPayload: true
        }))
    }

    //Ejemplo de mensajes capturando entidad del intent
    function getQuestionYes(agent) {
        var parametros = req.body.queryResult.parameters;
        console.log("respuesta: " + JSON.stringify(parametros));
        var afirmativo = parametros.afirmativo;
        agent.context.set({ 'name': 'getQuestion - yes', 'lifespan': 1, 'parameters': { 'afirmativo': afirmativo } });
        agent.add("Todo bien");
    }

    function getQuestionNo(agent) {
        var parametros = req.body.queryResult.parameters;
        console.log("respuesta: " + JSON.stringify(parametros));
        var negativo = parametros.negativo;
        agent.context.set({ 'name': 'getQuestion - no', 'lifespan': 1, 'parameters': { 'negativo': negativo } });
        agent.add("Todo mal, Es una pena");
    }

    //Nodemailer
    //Es conveniente en google/seguridad habilitar la opcion de "Acceso de aplicaciones poco seguras"
    //https://myaccount.google.com/u/5/security
    var transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: "fulgencioPruebas@gmail.com",
            pass: "Bots.ia77"
        },
        tls: {
            rejectUnauthorized: false
        }
    });


    function sendEmailHandler(agent) {
        const { email, name } = agent.parameters;
        console.log(email);
        //Para el mail que se va a enviar
        const mailOptions = {
            from: '"José Franco Nieto 👻" <foo@example.com>',
            to: email,
            subject: "Email para bots",
            text: "Hello world?",
            html: `<p> hola ${name}. Esto es un email de prueba </p>`
        };
        //controlar errores
        transport.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                console.log("Mensaje enviado a: %s", info.messageId);
            }

        });

        console.log("correo enviado");

        agent.add(`Tu correo ha sido enviado ${name} por favor mira la bandeja de tu correo`);
    }


    //Usar Excel como BBDD con sheetDB y axios para las peticiones http
    function saveOrder(agent) {
        const pizza = agent.parameters.menu;
        var d = Date();
        fecha = d.toString()

        axios.post('https://sheetdb.io/api/v1/pikq7r2f1d3xu', {
            "data": { "name": pizza, "created_at": fecha }
        }).then(res => {
            console.log(res.data);
        });

        axios.get('https://sheetdb.io/api/v1/pikq7r2f1d3xu')
            .then(res => {
                console.log(res.data);
            });

        agent.add(`Okay, tu ` + pizza + ` estara lista en 40 minutos. `);

    }


    async function loginInsert(agent) {
        const user = agent.parameters.user;
        const password = agent.parameters.password;
        console.log("usuario: " + user + " contraseña: " + password);

        insert_BBDD(user, password);

        agent.add("usuario: " + user + " contraseña: " + password);
        agent.add("Registro completado");

    }

    async function loginDelete(agent) {
        const user = agent.parameters.eliminar;
        console.log("usuario: " + user);

        delete_BBDD(user);

        agent.add("El usuario " + user + " ha sido eliminado");
    }

    async function loginConsultar(agent) {
        const resultado = agent.parameters.resultado;
        var resp = await query_BBDD(resultado);

        console.log(resp[0].user);
        console.log(resp[0].password);

        agent.add("El usuario: " + resp[0].user);
        agent.add("La contraseña: " + resp[0].password);
    }


    //-------------------------------------------------------------------------------------
    //Conexion de intent con la funccion con la que van a interactuar
    var intentMap = new Map();
    //Intent y funcion para interactuar
    intentMap.set('webhookDemo', demo);
    intentMap.set('customPayloadDemo', customPayloadDemo);
    intentMap.set('getQuestion - yes', getQuestionYes);
    intentMap.set('getQuestion - no', getQuestionNo);
    intentMap.set('sendEmail', sendEmailHandler);
    intentMap.set('Order a pizza', saveOrder);
    intentMap.set('login_Registrar', loginInsert);
    intentMap.set('login_Eliminar', loginDelete);
    intentMap.set('login_query', loginConsultar);

    //
    agent.handleRequest(intentMap);
})


async function insert_BBDD(user, password) {
    var q = `INSERT INTO login (user, password) VALUES ('${user}','${password}')`;
    console.log(q);
    await bbdd.ejecutaQuery(q);
}

async function delete_BBDD(user) {
    var q1 = `DELETE FROM login WHERE user = '${user}'`;
    console.log(q1);
    await bbdd.ejecutaQuery(q1);
}

async function query_BBDD(user) {
    var q1 = `SELECT * FROM login WHERE user = '${user}'`;
    var respuesta = await bbdd.ejecutaQuery(q1);  
    return respuesta;
}



//-------------------------------------------------------------------------------------
// ARRANCAMOS EL SERVICIO
const port = 3000;
const dateTime = Date.now();

app.listen(process.env.PORT || port, function() {
    console.log('\x1b[36m' + '------------------------------------------------ ');
    console.log('\x1b[35m' + '          ** Puerto ' + (process.env.PORT || port + ' activo **'));
    console.log('\x1b[0m' + " [ " + Date() + " ] ");
    console.log(`  Ejemplo escuchando en: ( http://localhost:${port} )`);
    console.log('\x1b[36m' + '------------------------------------------------ ');
    console.log('\x1b[0m');
});
//Correr en nodemon --> npm run dev