{
    "chunks": [
        {
            "type": "txt",
            "chunk_number": 1,
            "lines": [
                {
                    "line_number": 1,
                    "text": ""
                },
                {
                    "line_number": 2,
                    "text": "const CACHE_NAME = \"calculadora-salario-v1\";"
                },
                {
                    "line_number": 3,
                    "text": "const urlsToCache = ["
                },
                {
                    "line_number": 4,
                    "text": "\"/Calculadora-de-salario/\","
                },
                {
                    "line_number": 5,
                    "text": "\"/Calculadora-de-salario/index.html\","
                },
                {
                    "line_number": 6,
                    "text": "\"/Calculadora-de-salario/style.css\","
                },
                {
                    "line_number": 7,
                    "text": "\"/Calculadora-de-salario/script.js\","
                },
                {
                    "line_number": 8,
                    "text": "\"/Calculadora-de-salario/icon-192.png\","
                },
                {
                    "line_number": 9,
                    "text": "\"/Calculadora-de-salario/icon-512.png\","
                },
                {
                    "line_number": 10,
                    "text": "];"
                },
                {
                    "line_number": 11,
                    "text": ""
                },
                {
                    "line_number": 12,
                    "text": "self.addEventListener(\"install\", event => {"
                },
                {
                    "line_number": 13,
                    "text": "event.waitUntil("
                },
                {
                    "line_number": 14,
                    "text": "caches.open(CACHE_NAME).then(cache => {"
                },
                {
                    "line_number": 15,
                    "text": "return cache.addAll(urlsToCache);"
                },
                {
                    "line_number": 16,
                    "text": "})"
                },
                {
                    "line_number": 17,
                    "text": ");"
                },
                {
                    "line_number": 18,
                    "text": "});"
                },
                {
                    "line_number": 19,
                    "text": ""
                },
                {
                    "line_number": 20,
                    "text": "self.addEventListener(\"fetch\", event => {"
                },
                {
                    "line_number": 21,
                    "text": "event.respondWith("
                },
                {
                    "line_number": 22,
                    "text": "caches.match(event.request).then(response => {"
                },
                {
                    "line_number": 23,
                    "text": "return response || fetch(event.request);"
                },
                {
                    "line_number": 24,
                    "text": "})"
                },
                {
                    "line_number": 25,
                    "text": ");"
                },
                {
                    "line_number": 26,
                    "text": "});"
                }
            ],
            "token_count": 61
        }
    ]
}