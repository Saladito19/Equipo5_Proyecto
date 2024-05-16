const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client');

// Ruta para crear un nuevo cliente
router.post('/clients', async (req, res) => {
    const { name, initialAmount } = req.body;

    try {
        await clientController.createClient(name, initialAmount);
        res.status(201).send("Cliente creado exitosamente.");
    } catch (error) {
        console.error("Error al crear el cliente:", error);
        res.status(500).send("Error al crear el cliente.");
    }
});

// Ruta para modificar el monto de dinero (TD) de un cliente
router.put('/clients/:clientId', async (req, res) => {
    const { clientId } = req.params;
    const { newAmount } = req.body;

    try {
        await clientController.modifyClientTD(clientId, newAmount);
        res.send("Monto de dinero (TD) del cliente modificado exitosamente.");
    } catch (error) {
        console.error("Error al modificar el monto del cliente:", error);
        res.status(500).send("Error al modificar el monto del cliente.");
    }
});

// Ruta para obtener todos los clientes
router.get('/clients', async (req, res) => {
    try {
        const clients = await clientController.getAllClients();
        res.json(clients);
    } catch (error) {
        console.error("Error al obtener los clientes:", error);
        res.status(500).send("Error al obtener los clientes.");
    }
});

// Ruta para obtener un cliente por su ID
router.get('/clients/:clientId', async (req, res) => {
    const { clientId } = req.params;

    try {
        const client = await clientController.getClientById(clientId);
        res.json(client);
    } catch (error) {
        console.error("Error al obtener la información del cliente:", error);
        res.status(500).send("Error al obtener la información del cliente.");
    }
});

module.exports = router;