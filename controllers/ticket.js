//require('dotenv').config()
require('dotenv').config({path:require('find-config')('.env')})
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const {ethers} = require('ethers')
const contract = require('../artifacts/contracts/Ticket.sol/Tickets.json')
const { format } = require('path')
const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    TICKET_CONTRACT
} = process.env

async function createTransaction(provider,method,params) {
    const etherInterface = new ethers.utils.Interface(contract.abi);
    const nonce = await provider.getTransactionCount(PUBLIC_KEY,'latest')
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const {chainId} = network;
    const transaction = {
        from : PUBLIC_KEY,
        to : TICKET_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method,params)
    }
    return transaction
}

async function createTicket(saucerIds, clientId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY,provider);
    const transaction = await createTransaction(provider,"createTicket",[saucerIds,clientId]);
    const estimateGas = await provider.estimateGas(transaction);
    transaction["gasLimit"] = estimateGas;
    const singedTx = await wallet.signTransaction(transaction);
    const transactionRecepit = await provider.sendTransaction(singedTx);
    await transactionRecepit.wait();
    const hash = transactionRecepit.hash;
    console.log("Transaction Hash",hash)
    const receipt = await provider.getTransactionReceipt(hash)
    return receipt
}

async function getAllTickets() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const ticketContract = new ethers.Contract(TICKET_CONTRACT,contract.abi,provider)
    const result = await ticketContract.getAllTickets()
    var tickets = []
    result.forEach(element => {
        tickets.push(formatTicket(element))
    })
    return tickets;
}

async function getTicketById(ticketId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const ticketContract = new ethers.Contract(TICKET_CONTRACT,contract.abi,provider)
    const result = await ticketContract.getClientsById(ticketId)
    return formatTicket(result);
}

function formatTicket(info) {
    return {
        id:ethers.BigNumber.from(info[0]).toNumber(),
        items:info[1],
        clientId:ethers.BigNumber.from(info[2]).toNumber(),
        totalAmount:ethers.BigNumber.from(info[3]).toNumber()
    }
}

module.exports = {
    createTicket:createTicket,
    getAllTickets:getAllTickets,
    getTicketById:getTicketById
}