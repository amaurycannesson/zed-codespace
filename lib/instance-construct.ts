import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export type InstanceConstructProps = {
  readonly amiId: string;
  readonly publicKey: string;
};

export class InstanceConstruct extends Construct {
  public readonly instance: ec2.Instance;
  public readonly elasticIp: ec2.CfnEIP;

  constructor(scope: Construct, id: string, props: InstanceConstructProps) {
    super(scope, id);

    const { vpc, sg } = this.createVpcAndSg();

    const keyPair = this.createKeyPair(props.publicKey);

    this.instance = new ec2.Instance(this, "Instance", {
      instanceName: "zed-codespace",
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.XLARGE,
      ),
      machineImage: ec2.MachineImage.genericLinux({
        [`${cdk.Stack.of(this).region}`]: props.amiId,
      }),
      securityGroup: sg,
      keyName: keyPair.keyName,
    });

    this.elasticIp = new ec2.CfnEIP(this, "EIP");

    new ec2.CfnEIPAssociation(this, "EIPAssociation", {
      allocationId: this.elasticIp.attrAllocationId,
      instanceId: this.instance.instanceId,
    });
  }

  private createVpcAndSg() {
    const vpc = ec2.Vpc.fromLookup(this, "DefaultVPC", { isDefault: true });

    const sg = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      allowAllOutbound: true,
    });

    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "Allow SSH");

    return { vpc, sg };
  }

  private createKeyPair(publicKey: string) {
    const keyPair = new ec2.CfnKeyPair(this, "KeyPair", {
      keyName: "zed-codespace-key",
      publicKeyMaterial: publicKey,
    });

    keyPair.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    return keyPair;
  }
}
