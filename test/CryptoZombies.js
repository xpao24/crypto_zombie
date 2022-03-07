const ZombieOwnership = artifacts.require("ZombieOwnership");
const utils = require("./helpers/utils");
const time = require("./helpers/time");
//  引入 断言工具 chai，提升 case 可读性 https://www.chaijs.com/guide/styles/#expect
var expect = require('chai').expect;

const zombieNames = ["Zombie 1", "Zombie 2"];
contract("ZombieOwnership", () => {
    let alice;
    let bob;
    
    let contractInstance;
    
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        alice = accounts[0];
        bob = accounts[1];
        contractInstance = await ZombieOwnership.new();
    });

    it("should be able to create a new zombie", async () => {
        const result = await contractInstance.createRandomZombie(zombieNames[0],{"from":alice});
        expect(result.receipt.status).to.equal(true);
        expect(result.logs[0].args.name).to.equal(zombieNames[0]);
    })

    context("with the single-step transfer scenario", async () => {
        it("should transfer a zombie", async () => {
            const result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
            const zombieId = result.logs[0].args.zombieId.toNumber();
            await contractInstance.transferFrom(alice, bob, zombieId, {from: alice});
            const newOwner = await contractInstance.ownerOf(zombieId);
            expect(newOwner).to.equal(bob);
        })
    })
    context("with the two-step transfer scenario", async () => {
        it("should approve and then transfer a zombie when the approved address calls transferFrom", async () => {
            const result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
            const zombieId = result.logs[0].args.zombieId.toNumber();
            await contractInstance.approve(bob, zombieId, {from: alice});
            await contractInstance.transferFrom(alice, bob, zombieId, {from: bob});
            const newOwner = await contractInstance.ownerOf(zombieId);
            expect(newOwner).to.equal(bob);
        })
        it("should approve and then transfer a zombie when the owner calls transferFrom", async () => {
            // TODO: Test the two-step scenario.  The owner calls transferFrom
            const result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
            const zombieId = result.logs[0].args.zombieId.toNumber();
            await contractInstance.approve(bob, zombieId, {from: alice});
            await contractInstance.transferFrom(alice, bob, zombieId, {from: alice});
            const newOwner = await contractInstance.ownerOf(zombieId);
            expect(newOwner).to.equal(bob);
        })
        it("zombies should be able to attack another zombie", async () => {
            let result;
            result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
            const firstZombieId = result.logs[0].args.zombieId.toNumber();
            result = await contractInstance.createRandomZombie(zombieNames[1], {from: bob});
            const secondZombieId = result.logs[0].args.zombieId.toNumber();
            await time.advanceTimeAndBlock(time.duration.days(1))
            await contractInstance.attack(firstZombieId, secondZombieId, {from: alice});
            expect(result.receipt.status).to.equal(true);
        })
    })

    afterEach(async () => {
        await contractInstance.kill();
    });
})
