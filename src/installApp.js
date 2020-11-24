import { AppWebsocket, AdminWebsocket } from "@holochain/conductor-api";
import { ADMIN_PORT_1 } from "./constants";  // ADMIN_PORT_2,

export async function installApp(port, dnas, installedAppId) {
  console.log('\n Installing... \n ')

  const adminWebsocket = await AdminWebsocket.connect(
    `ws://localhost:${ADMIN_PORT_1}`
  );

  const pubKey = await adminWebsocket.generateAgentPubKey();

  const app = await adminWebsocket.installApp({
    agent_key: pubKey,
    installed_app_id: installedAppId,
    dnas: dnas.map((dna) => ({ nick: dna.nick, path: dna.path }))
  });

  console.log(' Installed App : ', JSON.stringify(app.cell_data[0][0]))

  await adminWebsocket.activateApp({ installed_app_id: installedAppId });
  await adminWebsocket.attachAppInterface({ port });

  const appWebsocket = await AppWebsocket.connect(`ws://localhost:${port}`);

  console.log(` Successfully installed app on port ${port}`);

  await appWebsocket.client.close();
  await adminWebsocket.client.close();
}

export async function attachAppInterface(port, installedAppId) {
  console.log('\n Attaching... \n ')
  const adminWebsocket = await AdminWebsocket.connect(
    `ws://localhost:${ADMIN_PORT_1}`
  );
//  await adminWebsocket.activateApp({ installed_app_id: installedAppId });
  await adminWebsocket.attachAppInterface({ port });

  const appWebsocket = await AppWebsocket.connect(`ws://localhost:${port}`);

  console.log(`Successfully attached to app interface on port ${port}`);

  await appWebsocket.client.close();
  await adminWebsocket.client.close();
}
