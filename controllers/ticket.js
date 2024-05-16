require('dotenv').config({ path: require('find-config')('.env') });
const { ethers } = require('ethers');
const ticketsContract = require('../artifacts/contracts/Ticket.sol/Tickets.json');
const { TICKETS_CONTRACT, API_URL, PRIVATE_KEY } = process.env;

// Función para crear una transacción y enviarla
async function sendTransaction(provider, wallet, contract, method, args) {
    const transaction = await contract.connect(wallet)[method](...args);
    const estimateGas = await provider.estimateGas(transaction);
    transaction.gasLimit = estimateGas;

    const signedTx = await wallet.signTransaction(transaction);
    const transactionReceipt = await provider.sendTransaction(signedTx);
    await transactionReceipt.wait();

    console.log(`Transacción ${method} exitosa. Hash: ${transactionReceipt.hash}`);

    return transactionReceipt.hash;
}

// Función para crear un nuevo ticket con múltiples platillos
async function createTicket(saucerIds, clientId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(TICKETS_CONTRACT, ticketsContract.abi, wallet);

    return sendTransaction(provider, wallet, contract, 'createTicket', [saucerIds, clientId]);
}

// Función para obtener un ticket por su ID
async function getTicketById(ticketId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const contract = new ethers.Contract(TICKETS_CONTRACT, ticketsContract.abi, provider);

    const ticket = await contract.getTicketById(ticketId);
    console.log("Información del ticket:", ticket);

    return ticket;
}

// Función para obtener todos los tickets
async function getAllTickets() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const contract = new ethers.Contract(TICKETS_CONTRACT, ticketsContract.abi, provider);

    const tickets = await contract.getAllTickets();
    console.log("Lista de tickets:", tickets);

    return tickets;
}

module.exports = {
    createTicket,
    getTicketById,
    getAllTickets
};
