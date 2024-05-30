import "../css//App.css";
import "../css/header.css";
import React from "react";
import gameAbi from "../ABIs/revolver";
import linkAbi from "../ABIs/linkToken";
import { signer, provider } from "../web3";
import { ethers } from "ethers";
import Header from "./Header";
import { Container } from "semantic-ui-react";
import StartGame from "./StartGame";
import Game from "./Game";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameContract: null,
      linkContract: null,
      sessionId: null,
      account: undefined,
      network: null,
    };
  }

  async componentDidMount() {
    if (window.ethereum) {
      try {
        //contract instances
        let gameContract = new ethers.Contract(
          "0x1a6cf933E81890D5C16b47309Aa6853296e25B29",
          gameAbi,
          signer
        );
        let linkContract = new ethers.Contract(
          "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
          linkAbi,
          signer
        );
        this.setState({ gameContract, linkContract });

        // connect wallet
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log(accounts[0]);
        this.setState({ account: ethers.utils.getAddress(accounts[0]) });

        // listen for the connect event
        window.ethereum.on("connect", async () => {
          const networkId = await provider.getNetwork();
          console.log(networkId.chainId);
          this.setState({ network: networkId.chainId });
          console.log(networkId.chainId);
        });

        // listen for chain changes
        window.ethereum.on("chainChanged", async () => {
          const networkId = await provider.getNetwork();
          this.setState({ network: networkId.chainId });
        });

        // network check
        const networkId = await provider.getNetwork();
        this.setState({ network: networkId.chainId });
      } catch (error) {
        console.error(error.message);
      }
    }
  }

  handleDataFromChild = (data) => {
    this.setState({ sessionId: data });
  };

  render() {
    return (
      <div className="app-container">
        <Container className="box">
          <Header account={this.state.account} network={this.state.network} />
          {console.log(this.state.gameContract)}
          <StartGame
            gameContract={this.state.gameContract}
            linkContract={this.state.linkContract}
            sessionId={this.handleDataFromChild}
          />

          <Game
            gameContract={this.state.gameContract}
            linkContract={this.state.linkContract}
            sessionId={this.state.sessionId}
            account={this.state.account}
          />
        </Container>
      </div>
    );
  }
}
export default App;
