require('dotenv').config({ path: require('find-config')('.env') });
const { ethers } = require('ethers');
const saucersContract = require('../artifacts/contracts/Saucer.sol/Saucers.json');
const { SAUCERS_CONTRACT, API_URL, PRIVATE_KEY } = process.env;

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

// Función para crear un nuevo platillo en el contrato
async function createSaucer(name, price) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(SAUCERS_CONTRACT, saucersContract.abi, wallet);

    return sendTransaction(provider, wallet, contract, 'createSaucer', [name, price]);
}

// Función para modificar el precio de un platillo existente en el contrato
async function modifySaucerPrice(saucerId, newPrice) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(SAUCERS_CONTRACT, saucersContract.abi, wallet);

    return sendTransaction(provider, wallet, contract, 'modifySaucerPrice', [saucerId, newPrice]);
}

// Función para obtener todos los platillos del contrato
async function getAllSaucers() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const contract = new ethers.Contract(SAUCERS_CONTRACT, saucersContract.abi, provider);

    const saucers = await contract.getAllSaucers();
    var formattedSaucers = [];

    saucers.forEach((saucer) => {
        formattedSaucers.push(formatSaucer(saucer)); // Aquí asumiendo que tienes una función formatSaucer para formatear cada platillo
    });

    console.log("Lista de platillos:", formattedSaucers);

    return formattedSaucers;
}


// Función para obtener un platillo por su ID
async function getSaucerById(saucerId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const contract = new ethers.Contract(SAUCERS_CONTRACT, saucersContract.abi, provider);

    const saucer = await contract.getSaucerById(saucerId);
    console.log("Información del platillo:", saucer);

    return saucer;
}

module.exports = {
    createSaucer,
    modifySaucerPrice,
    getAllSaucers,
    getSaucerById
};
