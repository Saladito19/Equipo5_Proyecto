// async function main(){
//     const Tickets = await ethers.getContractFactory('Tickets')
//     const tickets = await Tickets.deploy()
//     const txHash = tickets.deployTransaction.hash;
//     const txReceipt = await ethers.provider.waitForTransaction(txHash);
//     console.log("Contract deployed to Address",txReceipt.contractAddress);
// }

// main().then(()=>{process.exit(0)}).catch((error)=>{
//     console.log(error),process.exit(1)
// })

const { ethers } = require("hardhat");

async function main() {
    // Direcciones de los contratos Clients y Saucers en la red 'sepolia'
    const clientsAddress = "0x1D4078EE583f6464a385c12C6295245572b1dbBA"; // Dirección del contrato Clients
    const saucersAddress = "0xF5d4DF211bA957b193ce50E1593C9Ff21D848a1A"; // Dirección del contrato Saucers

    // Obtener la fábrica del contrato Tickets
    const Tickets = await ethers.getContractFactory('Tickets');

    // Desplegar el contrato Tickets y pasar las direcciones de los contratos Clients y Saucers
    const tickets = await Tickets.deploy(clientsAddress, saucersAddress);

    // Esperar a que se complete la transacción de despliegue
    const txHash = tickets.deployTransaction.hash;
    const txReceipt = await ethers.provider.waitForTransaction(txHash);

    // Mostrar la dirección del contrato desplegado
    console.log("Contract deployed to Address", txReceipt.contractAddress);
}

// Ejecutar la función 'main' y manejar errores
main().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
