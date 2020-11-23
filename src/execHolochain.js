import tmp from "tmp";
import child_process from "child_process";
import fs from "fs";
import { ADMIN_PORT_1, PROXY_URL } from "./constants"; // ADMIN_PORT_2,
import { sleep } from "./utils";

function createConfigFile() {
  const dbDirectory = tmp.dirSync({});

  const configFileContents = `
---
environment_path: "${dbDirectory.name}"
use_dangerous_test_keystore: false
signing_service_uri: ~
encryption_service_uri: ~
decryption_service_uri: ~
dpki: ~
keystore_path: "${dbDirectory.name}/keystore"
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

  const configFile = tmp.fileSync({});

  fs.writeFileSync(configFile.name, configFileContents);

  return configFile.name;
}

export async function execHolochain() {
  const configFilePath = createConfigFile();

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

}
