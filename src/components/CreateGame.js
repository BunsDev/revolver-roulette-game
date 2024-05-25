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
  };

  createGame = async () => {
    await this.props.linkContract.approve(
      this.props.gameContract.getAddress(),
      ethers.parseUnits(this.state.wager)
    );
    const session = await this.props.gameContract.createGame(
      ethers.parseUnits(this.state.wager),
      this.state.timer
    );
    console.log(session);
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
          {console.log(this.state.timer)}
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
