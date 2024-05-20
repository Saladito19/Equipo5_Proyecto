const express = require('express');
const app = express();
const path = require('path');

const clientRoutes = require('./routes/client.js');
const saucerRoutes = require('./routes/saucer.js');
const ticketRoutes = require('./routes/ticket.js');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', clientRoutes);
app.use('/api', saucerRoutes);
app.use('/api', ticketRoutes);

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));