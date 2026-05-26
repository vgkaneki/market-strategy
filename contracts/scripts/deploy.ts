import { ethers } from "hardhat";

async function main() {
  const [deployer, treasury, admin, manager] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const Token = await ethers.getContractFactory("MarketStrategyToken");
  const token = await Token.deploy(treasury.address, admin.address);
  await token.waitForDeployment();

  const LiquidityTreasury = await ethers.getContractFactory("LiquidityTreasury");
  const liquidityTreasury = await LiquidityTreasury.deploy(admin.address, manager.address);
  await liquidityTreasury.waitForDeployment();

  console.log("MarketStrategyToken:", await token.getAddress());
  console.log("LiquidityTreasury:", await liquidityTreasury.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
