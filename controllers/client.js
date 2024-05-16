//require('dotenv').config()
require('dotenv').config({path:require('find-config')('.env')})
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const {ethers} = require('ethers')
const contract = require('../artifacts/contracts/Client.sol/Clients.json')
const { format } = require('path')
const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    CLIENT_CONTRACT
} = process.env

async function createTransaction(provider,method,params) {
    const etherInterface = new ethers.utils.Interface(contract.abi);
    const nonce = await provider.getTransactionCount(PUBLIC_KEY,'latest')
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const {chainId} = network;
    const transaction = {
        from : PUBLIC_KEY,
        to : CLIENT_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method,params)
    }
    return transaction
}

async function createClient(name, td) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY,provider)
    const transaction = await createTransaction(provider,"createClient",[name,td]);
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

async function getAllClients() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const clientContract = new ethers.Contract(CLIENT_CONTRACT,contract.abi,provider)
    const result = await clientContract.getAllClients()
    var clients = []
    result.forEach(element => {
        clients.push(formatClient(element))
    })
    return clients;
}

async function getClientById(clientId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const clientContract = new ethers.Contract(CLIENT_CONTRACT,contract.abi,provider)
    const result = await clientContract.getClientById(clientId)
    return formatClient(result);
}

async function modifyTD(clientId,amount){
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY,provider);
    const transaction = await createTransaction(provider,"modifyTD",[clientId,amount]);
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

function formatClient(info) {
    return {
        id:ethers.BigNumber.from(info[0]).toNumber(),
        name:info[1],
        td:ethers.BigNumber.from(info[2]).toNumber()
        
    }
}

module.exports = {
    createClient:createClient,
    getAllClients:getAllClients,
    getClientById:getClientById,
    modifyTD:modifyTD
}