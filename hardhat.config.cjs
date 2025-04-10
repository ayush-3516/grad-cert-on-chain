require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    "base-sepolia": {
      url: "https://base-sepolia.g.alchemy.com/v2/jh-v1UKy3FMGggxSC-ygy_8VD4AdwOhL",
      accounts: ["e65f83b94531e3373c04d8d8181975cf40ea57111e7d2ad2b25977656d27cc2c"],
      chainId: 84532,
    }
  },
  etherscan: {
    apiKey: {
      "base-sepolia": "E9DQEXUU6VQ1WWCGJDZY1GP2V6583MUVZ8"
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  }
};
