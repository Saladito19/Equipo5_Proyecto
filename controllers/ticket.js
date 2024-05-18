require('dotenv').config({ path: require('find-config')('.env') });
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { ethers } = require('ethers');
const ticketContractArtifact = require('../artifacts/contracts/Ticket.sol/Tickets.json');
const clientContractArtifact = require('../artifacts/contracts/Client.sol/Clients.json');
const saucerContractArtifact = require('../artifacts/contracts/Saucer.sol/Saucers.json');
const { format } = require('path');

const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    TICKET_CONTRACT,
    CLIENT_CONTRACT,
    SAUCER_CONTRACT
} = process.env;

async function createTransaction(provider, method, params) {
    const etherInterface = new ethers.utils.Interface(ticketContractArtifact.abi);
    const nonce = await provider.getTransactionCount(PUBLIC_KEY, 'latest');
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const { chainId } = network;
    const transaction = {
        from: PUBLIC_KEY,
        to: TICKET_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method, params)
    };
    return transaction;
}

async function createTransactionClient(provider, method, params) {
    const etherInterface = new ethers.utils.Interface(clientContractArtifact.abi);
    const nonce = await provider.getTransactionCount(PUBLIC_KEY, 'latest');
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const { chainId } = network;
    const transaction = {
        from: PUBLIC_KEY,
        to: CLIENT_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method, params)
    };
    return transaction;
}

async function createTicket(buy, clientId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Inicializar los contratos
    const clientContract = new ethers.Contract(CLIENT_CONTRACT, clientContractArtifact.abi, provider);
    const saucerContract = new ethers.Contract(SAUCER_CONTRACT, saucerContractArtifact.abi, provider);

    // Verificar que el clientId existe
    const clientData = await clientContract.getClientById(clientId);
    if (!clientData.clientId.eq(clientId)) {
        throw new Error(`El clientId ${clientId} no existe`);
    }

    // Verificar que los saucersIds existen y sumar el precio total
    let calculatedTotalAmount = 0;
    for (const id of buy) {
        const saucerData = await saucerContract.getSaucerById(id);
        if (!saucerData.saucerId.eq(id)) {
            throw new Error(`El Saucer con id ${id} no existe`);
        } else {
            calculatedTotalAmount += saucerData.price.toNumber();
        }
    }

    // Verificar si el cliente tiene suficiente saldo
    let tdNew = clientData.td.toNumber() - calculatedTotalAmount;
    if (tdNew < 0) {
        throw new Error(`No tienes suficiente dinero en tu tarjeta de crédito`);
    }

    // Crear la transacción para modificar TD Client
    const transactionClient = await createTransactionClient(provider, "modifyTD", [clientId, tdNew]);
    const estimateGasClient = await provider.estimateGas(transactionClient);
    transactionClient["gasLimit"] = estimateGasClient;
    const signedTxClient = await wallet.signTransaction(transactionClient);
    const transactionReceiptClient = await provider.sendTransaction(signedTxClient);
    await transactionReceiptClient.wait();
    const hashClient = transactionReceiptClient.hash;
    console.log("Transaction Hash Client", hashClient);
    const receiptClient = await provider.getTransactionReceipt(hashClient);

    // Crear la transacción para el Ticket
    const transaction = await createTransaction(provider, "createTicket", [buy, clientId, calculatedTotalAmount]);
    const estimateGas = await provider.estimateGas(transaction);
    transaction["gasLimit"] = estimateGas;
    const signedTx = await wallet.signTransaction(transaction);
    const transactionReceipt = await provider.sendTransaction(signedTx);
    await transactionReceipt.wait();
    const hash = transactionReceipt.hash;
    console.log("Transaction Hash Ticket", hash);
    const receipt = await provider.getTransactionReceipt(hash);

    return { receipt, receiptClient };
}

async function getAllTickets() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const ticketContract = new ethers.Contract(TICKET_CONTRACT, ticketContractArtifact.abi, provider);
    const result = await ticketContract.getAllTickets();
    var tickets = [];
    result.forEach(element => {
        tickets.push(formatTicket(element));
    });
    return tickets;
}

async function getTicketById(ticketId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const ticketContract = new ethers.Contract(TICKET_CONTRACT, ticketContractArtifact.abi, provider);
    const result = await ticketContract.getTicketById(ticketId);
    return formatTicket(result);
}

function formatTicket(info) {
    return {
        id: ethers.BigNumber.from(info[0]).toNumber(),
        buy: info[1].map(id => ethers.BigNumber.from(id).toNumber()),
        clientId: ethers.BigNumber.from(info[2]).toNumber(),
        totalAmount: ethers.BigNumber.from(info[3]).toNumber()
    };
}

module.exports = {
    createTicket:createTicket,
    getAllTickets:getAllTickets,
    getTicketById:getTicketById
};