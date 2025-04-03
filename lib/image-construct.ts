import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as imageBuilder from "aws-cdk-lib/aws-imagebuilder";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as fs from "fs";
import * as path from "path";

export class ImageConstruct extends Construct {
  public readonly image: imageBuilder.CfnImage;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const imageRecipe = this.createImageRecipe();

    const infraConfig = this.createInfrastructureConfiguration();

    this.image = new imageBuilder.CfnImage(this, "Image", {
      imageRecipeArn: imageRecipe.attrArn,
      infrastructureConfigurationArn: infraConfig.attrArn,
    });

    this.image.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }

  private createImageRecipe() {
    const amazonLinuxImage = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
      cpuType: ec2.AmazonLinuxCpuType.ARM_64,
    });

    const setupComponent = this.createSetupComponent();

    const imageRecipe = new imageBuilder.CfnImageRecipe(this, "ImageRecipe", {
      name: "zed-codespace-image-recipe",
      version: "1.0.0",
      parentImage: amazonLinuxImage.getImage(this).imageId,
      components: [
        {
          componentArn: `arn:aws:imagebuilder:eu-west-3:aws:component/update-linux/x.x.x`,
        },
        {
          componentArn: `arn:aws:imagebuilder:eu-west-3:aws:component/aws-cli-version-2-linux/x.x.x`,
        },
        {
          componentArn: setupComponent.attrArn,
        },
      ],
    });

    return imageRecipe;
  }

  private createSetupComponent() {
    const setupComponentFile = fs.readFileSync(
      path.join(__dirname, "components", "zed-codespace-setup.yaml"),
      "utf-8",
    );

    const basePackagesComponent = new imageBuilder.CfnComponent(
      this,
      "SetupComponent",
      {
        name: "zed-codespace-setup",
        version: "1.0.0",
        platform: "Linux",
        data: setupComponentFile,
      },
    );

    return basePackagesComponent;
  }

  private createInstanceProfile() {
    const instanceProfile = new iam.InstanceProfile(this, "InstanceProfile", {
      role: new iam.Role(this, "InstanceProfileRole", {
        assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "EC2InstanceProfileForImageBuilder",
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonSSMManagedInstanceCore",
          ),
        ],
      }),
    });

    return instanceProfile;
  }

  private createInfrastructureConfiguration() {
    const instanceProfile = this.createInstanceProfile();

    const infraConfig = new imageBuilder.CfnInfrastructureConfiguration(
      this,
      "InfraConfig",
      {
        name: "zed-codespace-infra-config",
        instanceTypes: ["t4g.xlarge"],
        instanceProfileName: instanceProfile.instanceProfileName!,
      },
    );

    return infraConfig;
  }
}
