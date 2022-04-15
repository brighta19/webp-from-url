async function start() {
    require('dotenv').config();
    const Keyv = require('keyv');
    const sharp = require('sharp');
    const express = require('express');
    const fetch = (await import('node-fetch')).default;

    const { PORT } = process.env;
    const keyv = new Keyv(); // my cache
    const app = express();

    app.get('/', (req, res) => res.send('Hello world! Go to `http://localhost:PORT/webp/URL`, where `PORT` is the port you used, and `URL` is a url to an image.'));
    app.get('/webp/*', async (req, res) => {
        let url = req.params[0];
        let image = await keyv.get(url);

        if (image !== undefined) {
            res.contentType("image/webp")
            .setHeader("Cache-Control", "max-age=31536000")
            .send(image);
            return;
        }

        let buffer;
        try {
            let arrayBuffer = await fetch(url).then(d => d.arrayBuffer());
            buffer = Buffer.from(arrayBuffer);
        }
        catch (err) {
            res.status(404)
            .send("The url is invalid.");
            return;
        }

        try {
            let output = await sharp(buffer).webp().toBuffer();
            keyv.set(url, output);

            res.contentType("image/webp")
            .setHeader("Cache-Control", "max-age=31536000")
            .send(output);
        }
        catch (err) {
            res.status(404)
            .send("The given url does not point to an image file.");
        }

    });

    app.listen(PORT, () => console.log("Listening on port " + PORT));
}

start();
