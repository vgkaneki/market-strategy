import { expect } from "chai";
import { ethers } from "hardhat";

describe("LiquidityTreasury", function () {
  it("allows manager to withdraw deposited tokens", async function () {
    const [, treasuryOwner, admin, manager, receiver] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MarketStrategyToken");
    const token = await Token.deploy(treasuryOwner.address, admin.address);

    const Treasury = await ethers.getContractFactory("LiquidityTreasury");
    const vault = await Treasury.deploy(admin.address, manager.address);

    await token.connect(treasuryOwner).approve(await vault.getAddress(), 1000n);
    await vault.connect(treasuryOwner).deposit(await token.getAddress(), 1000n);

    await vault.connect(manager).withdraw(await token.getAddress(), receiver.address, 500n);
    expect(await token.balanceOf(receiver.address)).to.equal(500n);
  });

  it("blocks non-manager withdrawal", async function () {
    const [, admin, manager, attacker, receiver] = await ethers.getSigners();

    const Treasury = await ethers.getContractFactory("LiquidityTreasury");
    const vault = await Treasury.deploy(admin.address, manager.address);

    await expect(
      vault.connect(attacker).withdraw(ethers.ZeroAddress, receiver.address, 1n)
    ).to.be.reverted;
  });
});
