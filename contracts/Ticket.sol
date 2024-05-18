// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Tickets is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _ticketIds;

    struct Ticket {
        uint256 ticketId;
        uint256[] buy;
        uint256 clientId;
        uint256 totalAmount;
    }

    mapping(uint256 => Ticket) public tickets;

    // Función para crear un nuevo ticket con múltiples platillos
    function createTicket(uint256[] memory buy, uint256 clientId, uint256 totalAmount) public onlyOwner returns (uint256) {
        _ticketIds.increment();
        uint256 newTicketId = _ticketIds.current();
        Ticket memory newTicket = Ticket(newTicketId, buy, clientId, totalAmount);
        tickets[newTicketId] = newTicket;
        return newTicketId; 
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
