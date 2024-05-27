import "../css//App.css";
import React from "react";
import gameAbi from "../ABIs/revolver";
import { signer, provider } from "../web3";
import { ethers } from "ethers";
import {
  Container,
  Button,
  Input,
  Segment,
  GridRow,
  GridColumn,
  Grid,
  Image,
} from "semantic-ui-react";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      gameContract: null,
      linkContract: null,
      user: null,
      player1: null,
      player2: null,
      wager: 0,
      turn: "0x0",
    };
  }
  extractErrorReason = (errorMessage) => {
    const reasonMatch = errorMessage.match(/reason="([^"]+)"/);
    return reasonMatch ? reasonMatch[1] : "Unknown error";
  };

  spinCylinder = async () => {
    try {
      await this.props.gameContract.spinCylinder(this.props.sessionId);
    } catch (error) {
      const errorMessage = error.message;
      const extractedReason = this.extractErrorReason(errorMessage);
      this.setState({ error: extractedReason });
    }
  };

  fireRevolver = async () => {
    let lastRequestId = await this.props.gameContract.lastRequestIds(
      this.props.sessionId,
      this.state.player1
    );
    console.log(lastRequestId);
    try {
      await this.props.gameContract.fireRevolver(this.props.sessionId);
    } catch (error) {
      const errorMessage = error.message;
      const extractedReason = this.extractErrorReason(errorMessage);
      this.setState({ error: extractedReason });
    }
  };

  getWager = async () => {
    const accounts = await provider.send("eth_requestAccounts", []);
    const wager = await this.props.gameContract.wagers(
      this.props.sessionId,
      accounts[0]
    );

    const wagerInWei = ethers.BigNumber.from(wager);
    const wagerInEther = ethers.utils.formatEther(wagerInWei);

    this.setState({ wager: wagerInEther });

    return wager;
  };

  getGameInfo = async () => {
    const gameStruct = await this.props.gameContract.gameSessions(
      this.props.sessionId
    );
    console.log(gameStruct[1]);
    this.setState({ player1: gameStruct[1] });
    this.setState({ player2: gameStruct[2] });
    this.setState({ turn: gameStruct[4] });
    console.log(gameStruct);
    await this.getWager();
    console.log("game updated");
  };

  displayGame = () => {
    if (this.props.sessionId) {
      return (
        <Segment textAlign="center">
          {this.props.sessionId}
          <br />
          {`Pot: ${this.state.wager} LINK`}
          <Grid divided="vertically">
            <GridRow columns={2}>
              <GridColumn
                style={
                  this.state.turn == this.state.player1
                    ? { color: "green" }
                    : {}
                }
              >{`Player1: ${this.state.player1}`}</GridColumn>
              <GridColumn
                style={
                  this.state.turn == this.state.player2
                    ? { color: "green" }
                    : {}
                }
              >{`Player2: ${this.state.player2}`}</GridColumn>
              {console.log(this.props.sessionId)}
            </GridRow>
          </Grid>
          <Button color="blue" onClick={this.spinCylinder}>
            Spin Cylinder!
          </Button>
          <Button color="blue" onClick={this.fireRevolver}>
            Fire!
          </Button>
        </Segment>
      );
    }
  };

  render() {
    return (
      <div>
        <Container className="box" style={{ marginTop: "20px" }}>
          {this.displayGame()}
          <button onClick={() => this.getGameInfo()}>update</button>
          <div style={{ color: "red" }}>{this.state.error}</div>
        </Container>
      </div>
    );
  }
}
export default Game;
