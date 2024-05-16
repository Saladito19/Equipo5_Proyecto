const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket');

// Ruta para crear un nuevo ticket con múltiples platillos
router.post('/tickets', async (req, res) => {
    const { saucerIds, clientId } = req.body;

    try {
        await ticketController.createTicket(saucerIds, clientId);
        res.status(201).send("Ticket creado exitosamente.");
    } catch (error) {
        console.error("Error al crear el ticket:", error);
        res.status(500).send("Error al crear el ticket.");
    }
});

// Ruta para obtener un ticket por su ID
router.get('/tickets/:ticketId', async (req, res) => {
    const { ticketId } = req.params;

    try {
        const ticket = await ticketController.getTicketById(ticketId);
        res.json(ticket);
    } catch (error) {
        console.error("Error al obtener la información del ticket:", error);
        res.status(500).send("Error al obtener la información del ticket.");
    }
});

// Ruta para obtener todos los tickets
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await ticketController.getAllTickets();
        res.json(tickets);
    } catch (error) {
        console.error("Error al obtener los tickets:", error);
        res.status(500).send("Error al obtener los tickets.");
    }
});

module.exports = router;
