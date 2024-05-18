async function main(){
    const Tickets = await ethers.getContractFactory('Tickets')
    const tickets = await Tickets.deploy()
    const txHash = tickets.deployTransaction.hash;
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    console.log("Contract deployed to Address",txReceipt.contractAddress);
}

main().then(()=>{process.exit(0)}).catch((error)=>{
    console.log(error),process.exit(1)
})