// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Clients is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _clientIds;

    struct Client {
        uint256 clientId;
        string name;
        uint256 td; // TD (Monto de Dinero)
    }

    mapping(uint256 => Client) public clients;

    // Función para crear un nuevo cliente
    function createClient(string memory name, uint256 initialAmount) public onlyOwner returns (uint256) {
        _clientIds.increment();
        uint256 newClientId = _clientIds.current();
        Client memory newClient = Client(newClientId, name, initialAmount);
        clients[newClientId] = newClient;
        return newClientId;
    }

    // Función para modificar el monto de dinero (TD) de un cliente
    function modifyTD(uint256 clientId, uint256 newAmount) public onlyOwner {
        require(clientId <= _clientIds.current(), "Cliente no existe");
        clients[clientId].td = newAmount;
    }

    // Función para consultar todos los clientes
    function getAllClients() public view returns (Client[] memory) {
        Client[] memory clientsArray = new Client[](_clientIds.current());
        for (uint256 i = 1; i <= _clientIds.current(); i++) {
            clientsArray[i - 1] = clients[i];
        }
        return clientsArray;
    }

    // Función para buscar un cliente por su ID
    function getClientById(uint256 clientId) public view returns (Client memory) {
        require(clientId <= _clientIds.current(), "Cliente no existe");
        return clients[clientId];
    }
}
