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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameContract: null,
      linkContract: null,
    };
  }

  async componentDidMount() {
    const signer = await provider.getSigner();
    let gameContract = new ethers.Contract(
      "0xD84C27b8Ee076bb824095732aD9887f95D0b66C5",
      gameAbi,
      signer
    );
    let linkContract = new ethers.Contract(
      "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
      linkAbi,
      signer
    );
    this.setState({ gameContract, linkContract });
  }

  render() {
    return (
      <div className="app-container">
        <Container className="box">
          <Header />
          {console.log(this.state.gameContract)}
          <StartGame
            gameContract={this.state.gameContract}
            linkContract={this.state.linkContract}
          />
        </Container>
      </div>
    );
  }
}
export default App;
