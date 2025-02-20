const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const path = require("path");
const fs = require("fs");

//..............GRACIAS.............//
const palabrasAgradecimiento = ['gracias', 'muchas gracias', 'gracias a ti', 'mil gracias'];
const flowGracias = addKeyword(palabrasAgradecimiento)
    .addAnswer([
        "😊 ¡Gracias a ti! 💖",
        "Recuerda lo que dice Filipenses 4:13:",
        "✨ Todo lo puedo en Cristo que me fortalece.",
        "🙏 ¡Dios te bendiga!"
    ], null, async (_, { flowDynamic }) => {
        await flowDynamic(['👋 ¡Hasta pronto!']);
    });

//...................OPCIONES DEL MENU................//
// Coordenadas de la ubicación

const flowServicio = addKeyword(['imagen', 'foto']) // Activa el bot al escribir "imagen" o "foto"
    .addAction(async (_, { flowDynamic }) => {
        await flowDynamic("📅 *Nuestros horarios de servicios:*");

        await flowDynamic([{ body: "🔹 *Martes:* Comunión íntima con el Espíritu Santo - ⏰ 7:00 PM", media: "https://i.imgur.com/Fmb9UIH.jpg" }]);

        await flowDynamic([{ body: "🔹 *Viernes:* Noche de Fuego - ⏰ 7:00 PM", media: "https://i.imgur.com/BdfsCwE.jpg" }]);

        await flowDynamic([{ body: "🔹 *Domingo:* Servicio de Gloria - ⏰ 9:00 AM", media: "https://i.imgur.com/OSsW9lv.jpg" }]);

        await flowDynamic([
            "📍 *Ubicación:* calle 27E #4a, Sincelejo, Colombia"+
            "\n*Ver en Google Maps* 👉(https://maps.app.goo.gl/Bxd9RMg8x198tsbK9)"+
            "\n*Como llegar* 👉 (https://youtu.be/yCSAwACGXyY?si=2K3Rj3HQkZv7oeQ7)" 
        ]);
    });



const flowConsejeria = addKeyword(EVENTS.ACTION)
    .addAnswer("Escribe volver para regresar al menú principal.")
    .addAnswer([
        '*💬 Consejería Espiritual*',
        '\n📖Mas el Consolador, el Espíritu Santo, a quien el Padre enviará en mi nombre, él os enseñará todas las cosas, y os recordará todo lo que yo os he dicho.',
        '*Juan 14:26*',
        '\n🔗 Solicita consejería aquí:',
        '👉 https://wa.me/3054012062'
    ], null, async (ctx, { gotoFlow }) => {
        if (ctx.body.toLowerCase() === "volver") {
            return gotoFlow(menuFlow);
        }
    });

const flowOracion = addKeyword(EVENTS.ACTION)
    .addAnswer("Escribe volver para regresar al menú principal.")
    .addAnswer([
        '*🙏 Pedir Oración*',
        '\n📖Porque donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos.',
        '*Mateo 18:20*',
        '\n🔗 Haz tu petición de oración aquí:',
        '👉 https://wa.me/3013829325',
    ], null, async (ctx, { gotoFlow }) => {
        if (ctx.body.toLowerCase() === "volver") {
            return gotoFlow(menuFlow);
        }
    });

//....................MENU......................//
const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf-8");
const menuFlow = addKeyword(["menu", "volver"])
    .addAnswer(menu, { capture: true }, async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        const opcionesValidas = ["1", "2", "3", "0"];
        if (!opcionesValidas.includes(ctx.body)) {
            return fallBack("❌ Opción no válida. Por favor selecciona una opción válida.");
        }

        switch (ctx.body) {
            case "1":
                return gotoFlow(flowServicio);
            case "2":
                return gotoFlow(flowConsejeria);
            case "3":
                return gotoFlow(flowOracion);
            case "0":
                return await flowDynamic("Saliendo... Puedes volver al menú escribiendo 'menu'.");
        }
    });

//..................BIENVENIDAS....................//
const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer([
        "Gracias por comunicarte con nosotros\n"+
        "\n*IGLESIA RÍOS DE AVIVAMIENTO 🙌*\n"+
        "\n📖 Enviados a Manifestar el Amor de Dios, con el Poder del Espíritu Santo en Salvación, Provisión, Crecimiento, Milagros y Sanidades. Venid a las aguas...\n "
    ], null, async (_, { gotoFlow }) => {
        return gotoFlow(menuFlow);
    });

const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer([
        "Gracias por comunicarte con nosotros\n"+
        "\n*IGLESIA RÍOS DE AVIVAMIENTO 🙌*\n"+
        "\n📖 Enviados a Manifestar el Amor de Dios, con el Poder del Espíritu Santo en Salvación, Provisión, Crecimiento, Milagros y Sanidades. Venid a las aguas...\n "
    ], null, async (_, { gotoFlow }) => {
        return gotoFlow(menuFlow);
    });


// Inicialización del Bot
const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowPrincipal, flowWelcome, menuFlow, flowServicio, flowConsejeria, flowOracion, flowGracias]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
};
main();