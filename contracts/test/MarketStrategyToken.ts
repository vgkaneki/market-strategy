import { expect } from "chai";
import { ethers } from "hardhat";

describe("MarketStrategyToken", function () {
  it("mints fixed supply to treasury", async function () {
    const [, treasury, admin] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MarketStrategyToken");
    const token = await Token.deploy(treasury.address, admin.address);

    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000000"));
    expect(await token.balanceOf(treasury.address)).to.equal(ethers.parseEther("1000000000"));
  });

  it("allows pauser role to pause transfers", async function () {
    const [, treasury, admin, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MarketStrategyToken");
    const token = await Token.deploy(treasury.address, admin.address);

    await token.connect(admin).pause();
    await expect(
      token.connect(treasury).transfer(user.address, 1n)
    ).to.be.reverted;
  });
});
