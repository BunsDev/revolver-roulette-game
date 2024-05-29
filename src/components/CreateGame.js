import "../css//App.css";
import "../css/header.css";
import React from "react";
import gameAbi from "../ABIs/revolver";
import linkAbi from "../ABIs/linkToken";
import { signer, provider } from "../web3";
import { ethers } from "ethers";
import Header from "./Header";
import { Container, Button, Input, Segment } from "semantic-ui-react";

class CreateGame extends React.Component {
  state = {
    wager: 0,
    timer: 86400,
    sessionId: null,
  };

  createGame = async () => {
    if (this.state.wager > 0) {
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
      } catch (error) {
        console.error("Error approving tokens:", error);
      }
    }
    try {
      await this.props.gameContract.createGame(
        ethers.utils.parseUnits(this.state.wager),
        this.state.timer
      );
    } catch (error) {
      console.error("Error creating game:", error);
    }

    //wait for sessionId from chain
    const accounts = await provider.send("eth_requestAccounts", []);
    const filter = this.props.gameContract.filters.GameCreated(accounts[0]);
    this.props.gameContract.on(filter, (player1, sessionId) => {
      //send to StartGame then App for use in Game
      this.setState({ sessionId });
      this.props.sessionId(sessionId);
    });
    provider.on("error", (error) => {
      console.error("Provider error:", error);
    });
  };

  render() {
    return (
      <div>
        <Container className="box" style={{ marginTop: "20px" }}>
          LINK Wager:{" "}
          <Input
            onChange={(e) => this.setState({ wager: e.target.value })}
            placeholder="0 "
          />{" "}
          <br />
          Turn Timer :{" "}
          <Input
            onChange={(e) => this.setState({ timer: e.target.value * 60 * 60 })}
            placeholder="24 (hours)"
          />{" "}
          <br />
          <Button
            style={{ marginTop: "10px" }}
            color="blue"
            onClick={() => this.createGame()}
          >
            Create Game
          </Button>
        </Container>
      </div>
    );
  }
}
export default CreateGame;
