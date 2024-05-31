import "../css//App.css";
import "../css/header.css";
import React from "react";
import { signer, provider } from "../web3";
import { ethers } from "ethers";
import { Container, Button, Input, Segment } from "semantic-ui-react";

class JoinGame extends React.Component {
  state = {
    sessionId: null,
    wager: 0,
    player1: null,
    player2: "0x0000000000000000000000000000000000000000",
  };

  getGameInfo = async () => {
    if (!this.state.sessionId) {
      return;
    }
    const gameStruct = await this.props.gameContract.gameSessions(
      this.state.sessionId
    );
    const wager = gameStruct[7];
    const wagerInWei = ethers.BigNumber.from(wager);
    const wagerInEther = ethers.utils.formatEther(wagerInWei);

    this.setState({ player1: gameStruct[1] });
    this.setState({ player2: gameStruct[2] });
    this.setState({ wager: wagerInEther });

    this.props.sessionId(this.state.sessionId);
  };

  joinGame = async () => {
    const gameStruct = await this.props.gameContract.gameSessions(
      this.state.sessionId
    );
    if (gameStruct[2] !== "0x0000000000000000000000000000000000000000") {
      return;
    }
    const wager = gameStruct[7];
    if (wager > 0) {
      try {
        const gasEstimate = await this.props.linkContract.estimateGas.approve(
          this.props.gameContract.address,
          ethers.utils.parseUnits(this.state.wager)
        );

        const tx = await this.props.linkContract.approve(
          this.props.gameContract.address,
          ethers.utils.parseUnits(this.state.wager),
          { gasLimit: gasEstimate }
        );
        await tx.wait();
        console.log("Transaction successful");
      } catch (error) {
        console.error("Error approving tokens:", error);
      }
    }

    await this.props.gameContract.joinGame(this.state.sessionId);
  };

  wagerDisplay = () => {};

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
          {this.state.wager
            ? `Wager: ${Math.trunc(this.state.wager)} LINK`
            : null}
          <br />
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
