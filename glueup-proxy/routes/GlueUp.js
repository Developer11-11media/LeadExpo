const fetch = require('node-fetch');
const express = require('express');
const CryptoJS = require('crypto-js');
const app = express();
const PORT = 4000;

app.use(express.json());

app.get('/proxy', async (req, res) => {

    const endpoint = 'https://api-services.glueup.com/v2/';

    const Type = 'event/list';

    glueUpUrl = endpoint + Type;

    console.log(glueUpUrl);

    let params = {
        projection: [
            "id",
            "language.code",
            "defaultLanguage.code",
            "title",
            "template",
            "startDateTime",
            "endDateTime",
            "venueInfo",
            "eventTag",
            "workingGroup",
            "eventType.code",
            "eventType.name",
        ],
        offset: 0,
        limit: 1000,
        order: {
            startDateTime: "asc",
        },
        filter: [
            {
                projection: "openToPublic",
                operator: "eq",
                values: [true],
            },
            {
                projection: "published",
                operator: "eq",
                values: [true],
            },
        ],
    };

    try {

        const auth = generateApiAuth();

        const headers = {
            'Content-Type': 'application/json',
            'a': `v=${auth.version};k=${auth.k};ts=${auth.ts};d=${auth.d}`,
        };

        console.log(headers);
        const response = await fetch(glueUpUrl, {
             method: 'POST',
            headers: headers,
            body: JSON.stringify(params),
        });

        const data = await response.json();
        console.log("Datos recibidos:", data);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(data);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error en el proxy');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy corriendo en http://localhost:${PORT}`);
});

function generateApiAuth() {
    const publicKey = 'nahica';
    const privateKey = 'MF4CAQACEADOlnuVcEe9qkcCH6vSpF0CAwEAAQIQAJ8xqw4fNclF9O3tmwAFgQIIDnbu6NmcXm0CCA5IRjd+5eexAggIpSkR3s5I2QIIAnSxBjfexnECCAukgW/0aOcF';
    const requestMethod = 'POST';
    const version = '1.0';

    const { digest, timestamp } = getDigest(publicKey, privateKey, requestMethod, version);

    return {
        version,
        k: publicKey,
        ts: timestamp,
        d: digest,
    };
}



function getDigest(publicKey, privateKey, requestMethod, version, timestamp = Date.now()) {
    const baseString = `${requestMethod}${publicKey}${version}${timestamp}`;

    // Convertir la clave privada a WordArray por UTF-8 (igual que getBytes())
    const privateKeyWordArray = CryptoJS.enc.Utf8.parse(privateKey);

    const hash = CryptoJS.HmacSHA256(baseString, privateKeyWordArray);
    const digest = CryptoJS.enc.Hex.stringify(hash);

    return { digest, timestamp };
}
