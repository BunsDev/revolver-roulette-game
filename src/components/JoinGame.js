import "../css//App.css";
import "../css/header.css";
import React from "react";
import gameAbi from "../ABIs/revolver";
import linkAbi from "../ABIs/linkToken";
import { signer, provider } from "../web3";
import { ethers } from "ethers";
import Header from "./Header";
import { Container, Button, Input, Segment } from "semantic-ui-react";

class JoinGame extends React.Component {
  state = {
    sessionId: null,
    wager: null,
    player1: null,
    player2: "0x0000000000000000000000000000000000000000",
  };

  getWager = async () => {
    const accounts = await provider.send("eth_requestAccounts", []);
    const wager = await this.props.gameContract.wagers(
      this.state.sessionId,
      accounts[0]
    );
    const wagerInWei = ethers.BigNumber.from(wager);
    const wagerInEther = ethers.utils.formatEther(wagerInWei);

    this.setState({ wager: wagerInEther });
    return wager;
  };

  getGameInfo = async () => {
    if (!this.state.sessionId) {
      return;
    }
    const gameStruct = await this.props.gameContract.gameSessions(
      this.state.sessionId
    );

    this.setState({ player1: gameStruct[1] });
    this.setState({ player2: gameStruct[2] });
    await this.getWager();

    this.props.sessionId(this.state.sessionId);
  };

  joinGame = async () => {
    const gameStruct = await this.props.gameContract.gameSessions(
      this.state.sessionId
    );
    if (gameStruct[2] !== "0x0000000000000000000000000000000000000000") {
      console.log("Game Full!");
      return;
    }
    const wager = await this.getWager();
    if (wager > 0) {
      await this.props.linkContract.approve(
        this.props.gameContract.address,
        wager
      );
    }

    await this.props.gameContract.joinGame(this.state.sessionId);
  };

  wagerDisplay = () => {
    if (
      this.state.wager &&
      this.state.player2 !== "0x0000000000000000000000000000000000000000"
    ) {
      return <div>Wager: {this.state.wager / 2} LINK</div>;
    } else if (
      this.state.wager &&
      this.state.player2 === "0x0000000000000000000000000000000000000000"
    ) {
      return <div>Wager: {Math.trunc(this.state.wager)} LINK</div>;
    }
  };

  render() {
    return (
      <div>
        <Container className="box" style={{ marginTop: "20px" }}>
          Game ID:
          <Input
            onChange={(e) => {
              this.setState({ sessionId: e.target.value });
            }}
            placeholder="0 "
          />{" "}
          <Button color="blue" onClick={() => this.getGameInfo()}>
            Get Game Info
          </Button>
          <br />
          <br />
          {this.wagerDisplay()}
          {this.state.player1 ? `Player1: ${this.state.player1}` : null}
          <br />
          {this.state.player2 !== "0x0000000000000000000000000000000000000000"
            ? `Player2: ${this.state.player2}`
            : null}
          <br />
          {this.state.player2 !== "0x0000000000000000000000000000000000000000"
            ? `Game Full!`
            : null}
          <br />
          <Button
            style={{ marginTop: "10px" }}
            color="blue"
            onClick={() => this.joinGame()}
          >
            Join Game{" "}
          </Button>
        </Container>
      </div>
    );
  }
}
export default JoinGame;
