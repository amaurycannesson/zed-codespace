import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ImageConstruct } from "./image-construct";
import { InstanceConstruct } from "./instance-construct";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export class ZedCodespaceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { image } = new ImageConstruct(this, "ImageConstruct");

    const { instance, elasticIp } = new InstanceConstruct(
      this,
      "InstanceConstruct",
      {
        amiId: image.attrImageId,
        publicKey: fs.readFileSync(
          path.join(os.homedir(), ".ssh", "id_ed25519.pub"),
          "utf-8",
        ),
      },
    );

    new cdk.CfnOutput(this, "AmiIdOutput", {
      value: image.attrImageId,
      exportName: "zed-codespace-ami-id",
    });

    new cdk.CfnOutput(this, "InstanceIdOutput", {
      value: instance.instanceId,
      exportName: "zed-codespace-instance-id",
    });

    new cdk.CfnOutput(this, "ElasticIpOutput", {
      value: elasticIp.attrPublicIp,
      exportName: "zed-codespace-instance-ip",
    });
  }
}
