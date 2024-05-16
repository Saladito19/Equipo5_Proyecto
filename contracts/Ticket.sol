// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Client.sol";
import "./Saucer.sol";

contract Tickets is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _ticketIds;

    Clients public clientsContract;
    Saucers public saucersContract;

    struct Ticket {
        uint256 ticketId;
        uint256[] saucerIds;
        uint256 clientId;
        uint256 totalAmount;
    }

    mapping(uint256 => Ticket) public tickets;

    constructor(address _clientsAddress, address _saucersAddress) {
        clientsContract = Clients(_clientsAddress);
        saucersContract = Saucers(_saucersAddress);
    }

    // Función para crear un nuevo ticket con múltiples platillos
    function createTicket(uint256[] memory saucerIds, uint256 clientId) public {
        require(saucerIds.length > 0, "Debe seleccionar al menos un platillo");
        require(clientId <= clientsContract.getAllClients().length, "Cliente no existe");

        uint256 totalAmount = 0;

        for (uint256 i = 0; i < saucerIds.length; i++) {
            uint256 saucerId = saucerIds[i];
            require(saucerId <= saucersContract.getNumberOfSaucers(), "Platillo no existe");
            Saucers.Saucer memory saucer = saucersContract.getSaucerById(saucerId);
            totalAmount += saucer.price;
        }

        Clients.Client memory client = clientsContract.getClientById(clientId);
        require(client.td >= totalAmount, "Saldo insuficiente para comprar los platillos seleccionados");

        // Actualizar el monto total
        uint256 newMonto = client.td - totalAmount;

        _ticketIds.increment();
        uint256 newTicketId = _ticketIds.current();

        Ticket memory newTicket = Ticket(newTicketId, saucerIds, clientId, totalAmount);
        tickets[newTicketId] = newTicket;

        // Actualizar el monto de dinero (TD) del cliente
        clientsContract.modifyTD(clientId, newMonto);
    }

    // Función para consultar un ticket por su ID
    function getTicketById(uint256 ticketId) public view returns (Ticket memory) {
        require(ticketId <= _ticketIds.current(), "Ticket no existe");
        return tickets[ticketId];
    }

    // Función para consultar todos los tickets
    function getAllTickets() public view returns (Ticket[] memory) {
        Ticket[] memory allTickets = new Ticket[](_ticketIds.current());
        for (uint256 i = 1; i <= _ticketIds.current(); i++) {
            allTickets[i - 1] = tickets[i];
        }
        return allTickets;
    }
}
