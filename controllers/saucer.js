//require('dotenv').config()
require('dotenv').config({path:require('find-config')('.env')})
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const {ethers} = require('ethers')
const contract = require('../artifacts/contracts/Saucer.sol/Saucers.json')
const { format } = require('path')
const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    SAUCER_CONTRACT
} = process.env

async function createTransaction(provider,method,params) {
    const etherInterface = new ethers.utils.Interface(contract.abi);
    const nonce = await provider.getTransactionCount(PUBLIC_KEY,'latest')
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const {chainId} = network;
    const transaction = {
        from : PUBLIC_KEY,
        to : SAUCER_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method,params)
    }
    return transaction
}

async function createSaucer(name, price) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY,provider);
    const transaction = await createTransaction(provider,"createSaucer",[name,price]);
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

async function getAllSaucers() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const saucerContract = new ethers.Contract(SAUCER_CONTRACT,contract.abi,provider)
    const result = await saucerContract.getAllSaucers()
    var saucers = []
    result.forEach(element => {
        saucers.push(formatSaucer(element))
    })
    return saucers;
}

async function getSaucerById(saucerId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const saucerContract = new ethers.Contract(SAUCER_CONTRACT,contract.abi,provider)
    const result = await saucerContract.getSaucerById(saucerId)
    return formatSaucer(result);
}

async function modifySaucerPrice(saucerId,amount){
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY,provider);
    const transaction = await createTransaction(provider,"modifySaucerPrice",[saucerId,amount]);
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

function formatSaucer(info) {
    return {
        id:ethers.BigNumber.from(info[0]).toNumber(),
        name:info[1],
        price:ethers.BigNumber.from(info[2]).toNumber()
        
    }
}

module.exports = {
    createSaucer:createSaucer,
    getAllSaucers:getAllSaucers,
    getSaucerById:getSaucerById,
    modifySaucerPrice:modifySaucerPrice
}