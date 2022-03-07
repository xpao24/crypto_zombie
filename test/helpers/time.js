//https://medium.com/fluidity/standing-the-time-of-test-b906fcc374a9

advanceTime = (time) => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [time],
        id: new Date().getTime()
        }, (err, result) => {
            if (err) { 
                return reject(err) 
            }
        return resolve(result)
        })
    })
}
  
advanceBlock = () => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: new Date().getTime()
        }, (err, result) => {
            if (err) { 
                return reject(err) 
            }
        const newBlockHash = web3.eth.getBlock('latest').hash
        return resolve(newBlockHash)
     })
    })
}
  
takeSnapshot = () => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_snapshot',
        id: new Date().getTime()
        }, (err, snapshotId) => {
            if (err) { 
                return reject(err) 
            }
            return resolve(snapshotId)
        })
    })
}
  
revertToSnapShot = (id) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_revert',
        params: [id],
        id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err) }
            return resolve(result)
        })
    })
}
  
 advanceTimeAndBlock = async (time) => {
    //first, let's increase time
    await advanceTime(time)
    //next, let's mine a new block
    await advanceBlock()
    return Promise.resolve(web3.eth.getBlock('latest'))
}
  

const duration = {

    seconds: function (val) {
        return val;
    },
    minutes: function (val) {
        return val * this.seconds(60);
    },
    hours: function (val) {
        return val * this.minutes(60);
    },
    days: function (val) {
        return val * this.hours(24);
    },
}

module.exports = {
    advanceTime,
    advanceBlock,
    advanceTimeAndBlock,
    takeSnapshot,
    revertToSnapShot,
    duration,
};
