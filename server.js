const express = require('express');   // back-end framework for building web APIs
const shortid = require('shortid');   // works in the same way as the Cryptography class -> generate a shorter ID
const app = express();

// middleware to parse JSON format
app.use(express.json());

// Serve HTML page with a form for URL shortening.
/**
 * form input has the required property, meaning empty or null input strings are not allowed and will throw an error message.
 */
app.get('/shorten', (req, res) => {
    res.send(`
    <html>
      <body>
        <h1>URL Shortener</h1>
        <form id="shorten-form">
          <input type="text" name="longUrl" placeholder="Enter a URL" required style="width: 400px"/>
          <button type="submit">Shorten</button>
        </form>
        <div id="shortened-url"></div>
      </body>
      <script>
        const form = document.getElementById('shorten-form');
        const shortenedUrlDiv = document.getElementById('shortened-url');

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const longUrl = form.longUrl.value;  // get the URL string inside the textfield

          // Generate a short URL
          const shortUrl = await shortenUrl(longUrl);

          // Display the shortened URL
          shortenedUrlDiv.innerHTML = 'Shortened URL: <a href="/' + shortUrl + '">' + window.location.host + '/' + shortUrl + '</a>' + '<br>' + 'Shortened ID: ' + shortUrl;
        });

        // get resource from /shorten endpoint with POST method
        async function shortenUrl(longUrl) {
          const response = await fetch('/shorten', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ longUrl }),
          });

          if (response.ok) {
            const data = await response.json();
            return data.shortUrl;
          } else {
            console.error('Error shortening URL:', response.statusText);
            return null;
          }
        }
      </script>
    </html>
  `);
});

// In-memory data store for URL mappings.
// we can use this map later to redirect the shortened URL back to the original URL's resources
const urlStore = new Map();

// Handle URL shortening form submission
app.post('/shorten', (req, res) => {
    const { longUrl } = req.body;
    const shortUrl = shortid.generate().substring(0, 6);    // fix the length of the encrypted ID to 6

    // Store the URL mapping in the in-memory store
    urlStore.set(shortUrl, longUrl);

    res.json({ shortUrl });  // format response in JSON
});

// Redirect short URLs to their corresponding long URLs
app.get('/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;
    const longUrl = urlStore.get(shortUrl);

    if (longUrl) {
        res.redirect(longUrl);
    } else {
        res.status(404).json({ error: 'URL not found' });
    }
});

const PORT = process.env.PORT || 3000;   // configure port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
