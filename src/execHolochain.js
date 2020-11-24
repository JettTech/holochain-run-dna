import tmp from "tmp";
import child_process from "child_process";
import fs from "fs";
import { ADMIN_PORT_1, PROXY_URL } from "./constants"; // ADMIN_PORT_2,
import { sleep } from "./utils";

function createConfigFile(dirName) {
  if (!dirName) {
    const dbDirectory = tmp.dirSync({});
    dirName = dbDirectory.name;
  }

  let configExists = false
  const configFileName = `${dirName}/config.yaml`;

  if (fs.existsSync(configFileName)) {
    return [configFileName, false]
  }

  const configFileContents = `
---
environment_path: "${dirName}"
use_dangerous_test_keystore: false
signing_service_uri: ~
encryption_service_uri: ~
decryption_service_uri: ~
dpki: ~
keystore_path: "${dirName}/keystore"
passphrase_service: ~
admin_interfaces:
    - driver:
        type: websocket
        port: ${ADMIN_PORT_1}
network:
    bootstrap_service: https://bootstrap.holo.host
    transport_pool:
      - type: proxy
        sub_transport:
          type: quic
        proxy_config:
          type: remote_proxy_client
          proxy_url: "${PROXY_URL}"`;


  fs.writeFileSync(configFileName, configFileContents);

  return [configFileName, true];
}

export async function execHolochain() {
  const [configFilePath, configCreated] = createConfigFile(process.env.RUN_DIR);

  console.log('\nConfig File Path : ', configFilePath);

  const lair = child_process.spawn("lair-keystore", [], {
    stdio: "inherit",
    env: process.env,
  });

  console.log('Lair Keystore Process : ', lair);

  await sleep(100);

  child_process.spawn("holochain", ["-c", configFilePath], {
    stdio: "inherit",
    env: {
      ...process.env,
      RUST_LOG: process.env.RUST_LOG ? process.env.RUST_LOG : "info",
    },
  });
  await sleep(500);
  return configCreated;
}
