import * as fs from "fs";
import { exec } from "child_process";

const data = JSON.parse(fs.readFileSync("outputs.json", "utf-8"));
const instanceId = data.ZedCodespaceStack.InstanceIdOutput;

const action = process.argv[2];
if (!["start", "stop"].includes(action)) {
  console.error("Usage: node script.js <start|stop>");
  process.exit(1);
}

const command = `aws ec2 ${action}-instances --instance-ids ${instanceId}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
