import "../css//App.css";
import React from "react";
import gameAbi from "../ABIs/revolver";
import { signer, provider } from "../web3";
import { ethers } from "ethers";
import { Container, Button, Input, Segment } from "semantic-ui-react";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameContract: null,
      linkContract: null,
      sessionId: null,
    };
  }
  async componentDidMount() {
    const accounts = await provider.send("eth_requestAccounts", []);
    const filter = this.props.gameContract.filters.GameCreated(accounts[0]);
    this.props.gameContract.on(filter, (player1, sessionId) => {
      console.log(
        `Filtered GameCreated event: Player1 - ${player1}, SessionId - ${sessionId}`
      );
      this.setState({ sessionId });
    });
    provider.on("error", (error) => {
      console.error("Provider error:", error);
    });
  }

  displayGame = () => {
    if (this.state.sessionId) {
      return (
        <Segment textAlign="center">
          {this.state.sessionId}
          <br />
          <Button color="blue">Spin Cylinder!</Button>
          <Button color="blue">Fire!</Button>
        </Segment>
      );
    }
  };

  render() {
    return (
      <div>
        <Container className="box" style={{ marginTop: "20px" }}>
          {this.displayGame()}
        </Container>
      </div>
    );
  }
}
export default Game;
