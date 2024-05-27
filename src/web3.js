const ethers = require("ethers");
let provider;
let signer;

if (window.ethereum) {
  //v6
  // provider = new ethers.BrowserProvider(window.ethereum);
  //v5
  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  signer = await provider.getSigner();
} else {
  alert("Please install MetaMask!");
}

export { provider, signer };
