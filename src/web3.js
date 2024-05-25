const ethers = require("ethers");
let provider;
let signer;

if (window.ethereum) {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
} else {
  alert("Please install MetaMask!");
}

export { provider, signer };
