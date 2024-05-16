// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Saucers is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _saucerIds;

    struct Saucer {
        uint256 saucerId;
        string name;
        uint256 price;
    }

    mapping(uint256 => Saucer) public saucers;

    // Función para crear un nuevo platillo
    function createSaucer(string memory name, uint256 price) public onlyOwner returns (uint256) {
        _saucerIds.increment();
        uint256 newSaucerId = _saucerIds.current();
        Saucer memory newSaucer = Saucer(newSaucerId, name, price);
        saucers[newSaucerId] = newSaucer;
        return newSaucerId;
    }

    // Función para modificar el precio de un platillo existente
    function modifySaucerPrice(uint256 saucerId, uint256 newPrice) public onlyOwner {
        require(saucerId <= _saucerIds.current(), "Platillo no existe");
        saucers[saucerId].price = newPrice;
    }

    // Función para consultar todos los platillos
    function getAllSaucers() public view returns (Saucer[] memory) {
        Saucer[] memory saucersArray = new Saucer[](_saucerIds.current());
        for (uint256 i = 1; i <= _saucerIds.current(); i++) {
            saucersArray[i - 1] = saucers[i];
        }
        return saucersArray;
    }

    // Función para buscar un platillo por su ID
    function getSaucerById(uint256 saucerId) public view returns (Saucer memory) {
        require(saucerId <= _saucerIds.current(), "Platillo no existe");
        return saucers[saucerId];
    }

    function getNumberOfSaucers() public view returns (uint256) {
    return _saucerIds.current();
}

}
