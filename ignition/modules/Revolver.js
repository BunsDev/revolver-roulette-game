const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

//sepolia
const sepoliaSubId =
  "9961612013566380898107689663446867459687606391125128389954807124755412978422";
const sepoliaVrfCoord = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
const sepoliaKeyHash =
  "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
const sepoliaLinkToken = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

//fuji
const fujiSubId =
  "104367222493714133271091986912492840815014671444321336340341073633238803161463";
const fujiVrfCoord = "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE";
const fujiKeyHash =
  "0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887";
const fujiLinkToken = "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846";

module.exports = buildModule("Revolver", (m) => {
  const revolver = m.contract("Revolver", [
    fujiSubId,
    fujiVrfCoord,
    fujiKeyHash,
    fujiLinkToken,
  ]);

  return { revolver };
});
