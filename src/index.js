import { getAppToInstall, sleep } from "./utils";
import { execHolochain } from "./execHolochain";
import { installApp, attachAppInterface } from "./installApp";

async function execAndInstall(appToInstall) {
  // Execute holochain
  const configCreated = await execHolochain();

  // If the config file was created assume we also need to install everything
  if (configCreated) {
    await sleep(100);
    installApp(appToInstall.port, appToInstall.dnas, appToInstall.installedAppId);
  } else {
    await sleep(200);
    attachAppInterface(appToInstall.port, appToInstall.installedAppId);
  }
}

try {
  const appToInstall = getAppToInstall();
  execAndInstall(appToInstall).catch(console.error);
} catch (e) {
  console.error(e);
}
