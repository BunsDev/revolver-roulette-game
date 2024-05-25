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
  state = {};

  render() {
    return (
      <div>
        <Container className="box">
          <div>join game </div>
        </Container>
      </div>
    );
  }
}
export default JoinGame;
