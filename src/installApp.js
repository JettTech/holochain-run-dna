import { AppWebsocket, AdminWebsocket } from "@holochain/conductor-api";
import { ADMIN_PORT_1 } from "./constants";  // ADMIN_PORT_2,

export async function installApp(port, dnas, appId) {
  console.log('\n Installing... \n ')

  const adminWebsocket = await AdminWebsocket.connect(
    `ws://localhost:${ADMIN_PORT_1}`
  );

  const pubKey = await adminWebsocket.generateAgentPubKey();

  const app = await adminWebsocket.installApp({
    agent_key: pubKey,
    app_id: appId,
    dnas: dnas.map((dna) => ({ nick: dna.nick, path: dna.path }))
  });
  
  console.log(' Installed App : ', JSON.stringify(app.cell_data[0][0]))

  await adminWebsocket.activateApp({ app_id: appId });
  await adminWebsocket.attachAppInterface({ port });

  const appWebsocket = await AppWebsocket.connect(`ws://localhost:${port}`);

  console.log(` Successfully installed app on port ${port}`);

  await appWebsocket.client.close();
  await adminWebsocket.client.close();
}
