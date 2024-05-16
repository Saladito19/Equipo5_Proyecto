const express = require('express');
const router = express.Router();
const saucerController = require('../controllers/saucer');

// Ruta para crear un nuevo platillo
router.post('/saucers', async (req, res) => {
    const { name, price } = req.body;

    try {
        await saucerController.createSaucer(name, price);
        res.status(201).send("Platillo creado exitosamente.");
    } catch (error) {
        console.error("Error al crear el platillo:", error);
        res.status(500).send("Error al crear el platillo.");
    }
});

// Ruta para modificar el precio de un platillo existente
router.put('/saucers/:saucerId', async (req, res) => {
    const { saucerId } = req.params;
    const { newPrice } = req.body;

    try {
        await saucerController.modifySaucerPrice(saucerId, newPrice);
        res.send("Precio del platillo modificado exitosamente.");
    } catch (error) {
        console.error("Error al modificar el precio del platillo:", error);
        res.status(500).send("Error al modificar el precio del platillo.");
    }
});

// Ruta para obtener todos los platillos
router.get('/saucers', async (req, res) => {
    try {
        const saucers = await saucerController.getAllSaucers();
        res.json(saucers);
    } catch (error) {
        console.error("Error al obtener los platillos:", error);
        res.status(500).send("Error al obtener los platillos.");
    }
});

// Ruta para obtener un platillo por su ID
router.get('/saucers/:saucerId', async (req, res) => {
    const { saucerId } = req.params;

    try {
        const saucer = await saucerController.getSaucerById(saucerId);
        res.json(saucer);
    } catch (error) {
        console.error("Error al obtener la información del platillo:", error);
        res.status(500).send("Error al obtener la información del platillo.");
    }
});

module.exports = router;
