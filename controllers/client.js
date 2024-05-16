require('dotenv').config({ path: require('find-config')('.env') });
const { ethers } = require('ethers');
const clientContract = require('../artifacts/contracts/Client.sol/Clients.json');
const { CLIENT_CONTRACT, API_URL, PRIVATE_KEY } = process.env;

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

// Función para crear un nuevo cliente en el contrato
async function createClient(name, initialAmount) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CLIENT_CONTRACT, clientContract.abi, wallet);

    return sendTransaction(provider, wallet, contract, 'createClient', [name, initialAmount]);
}

// Función para modificar el monto de dinero (TD) de un cliente en el contrato
async function modifyClientTD(clientId, newAmount) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CLIENT_CONTRACT, clientContract.abi, wallet);

    return sendTransaction(provider, wallet, contract, 'modifyTD', [clientId, newAmount]);
}

// Función para obtener todos los clientes del contrato
async function getAllClients() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const contract = new ethers.Contract(CLIENT_CONTRACT, clientContract.abi, provider);

    const clients = await contract.getAllClients();
    console.log("Lista de clientes:", clients);

    return clients;
}

// Función para obtener un cliente por su ID
async function getClientById(clientId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const contract = new ethers.Contract(CLIENT_CONTRACT, clientContract.abi, provider);

    const client = await contract.getClientById(clientId);
    console.log("Información del cliente:", client);

    return client;
}

module.exports = {
    createClient,
    modifyClientTD,
    getAllClients,
    getClientById
};
