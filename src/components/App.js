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
    };
  }

  async componentDidMount() {
    let gameContract = new ethers.Contract(
      "0x61C68fd54D8290b2a1a9A9f981623a3C016b7643",
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
          <Game
            gameContract={this.state.gameContract}
            linkContract={this.state.linkContract}
          />
        </Container>
      </div>
    );
  }
}
export default App;
