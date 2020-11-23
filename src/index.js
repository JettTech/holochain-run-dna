import { getDnasToInstall, sleep } from "./utils";
import { execHolochain } from "./execHolochain";
import { installApp } from "./installApp";

async function execAndInstall(dnasToInstall) {
  // Execute holochain
  await execHolochain();

  await sleep(100);

  for (const dnasPorts of dnasToInstall) {
    installApp(dnasPorts.port, [dnasPorts.dnaPath], "test-app");
  }
}

try {
  const dnasToInstall = getDnasToInstall();
  execAndInstall(dnasToInstall).catch(console.error);
} catch (e) {
  console.error(e.message);
}
