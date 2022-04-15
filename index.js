async function start() {
    require('dotenv').config();
    const sharp = require('sharp');
    const express = require('express');
    const fetch = (await import('node-fetch')).default;

    const { PORT } = process.env;
    const app = express();

    app.get('/', (req, res) => res.send('Hello world!'));
    app.get('/webp/*', async (req, res) => {
        let url = req.params[0];
        let arrayBuffer = await fetch(url).then(d => d.arrayBuffer());
        let buffer = Buffer.from(arrayBuffer);

        let output = await sharp(buffer).webp().toBuffer();

        res.contentType("image/webp")
        .setHeader("Cache-Control", "max-age=31536000")
        .send(output);
    });

    app.listen(PORT, () => console.log("Listening on port " + PORT));
}

start();
