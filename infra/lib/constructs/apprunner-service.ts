import * as cdk from 'aws-cdk-lib';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export interface AppRunnerServiceProps {
  /**
   * Service name
   */
  serviceName: string;

  /**
   * Path to the directory containing the Dockerfile
   */
  dockerfilePath: string;

  /**
   * Environment variables for the application
   */
  environmentVariables?: { [key: string]: string };

  /**
   * Instance configuration
   */
  instanceConfig?: {
    cpu?: '0.25 vCPU' | '0.5 vCPU' | '1 vCPU' | '2 vCPU' | '4 vCPU';
    memory?: '0.5 GB' | '1 GB' | '2 GB' | '3 GB' | '4 GB' | '6 GB' | '8 GB' | '10 GB' | '12 GB';
  };

  /**
   * Health check configuration
   */
  healthCheck?: {
    path?: string;
    interval?: number;
    timeout?: number;
    healthyThreshold?: number;
    unhealthyThreshold?: number;
  };
}

export class AppRunnerService extends Construct {
  public readonly service: apprunner.CfnService;
  public readonly serviceUrl: string;
  public readonly serviceArn: string;
  public readonly instanceRole: iam.Role;

  constructor(scope: Construct, id: string, props: AppRunnerServiceProps) {
    super(scope, id);

    // Default environment variables
    const defaultEnvVars = {
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
    };

    const envVars = { ...defaultEnvVars, ...props.environmentVariables };

    // Build Docker image
    const imageAsset = new ecr_assets.DockerImageAsset(this, 'Image', {
      directory: props.dockerfilePath,
      platform: ecr_assets.Platform.LINUX_AMD64,
    });

    // Create IAM role for AppRunner instance
    this.instanceRole = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
      description: 'IAM role for AppRunner service instance',
    });

    // Add CloudWatch Logs permissions
    this.instanceRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: ['*'],
      })
    );

    // Create IAM role for AppRunner to access ECR
    const accessRole = new iam.Role(this, 'AccessRole', {
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
      description: 'IAM role for AppRunner to access ECR',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSAppRunnerServicePolicyForECRAccess'
        ),
      ],
    });

    // Health check configuration
    const healthCheckConfig = {
      protocol: 'HTTP',
      path: props.healthCheck?.path || '/',
      interval: props.healthCheck?.interval || 20,
      timeout: props.healthCheck?.timeout || 10,
      healthyThreshold: props.healthCheck?.healthyThreshold || 1,
      unhealthyThreshold: props.healthCheck?.unhealthyThreshold || 3,
    };

    // Create AppRunner service
    this.service = new apprunner.CfnService(this, 'Service', {
      serviceName: props.serviceName,
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        autoDeploymentsEnabled: false,
        imageRepository: {
          imageIdentifier: imageAsset.imageUri,
          imageRepositoryType: 'ECR',
          imageConfiguration: {
            port: '3000',
            runtimeEnvironmentVariables: Object.entries(envVars).map(([name, value]) => ({
              name,
              value,
            })),
          },
        },
      },
      instanceConfiguration: {
        cpu: props.instanceConfig?.cpu || '1 vCPU',
        memory: props.instanceConfig?.memory || '2 GB',
        instanceRoleArn: this.instanceRole.roleArn,
      },
      healthCheckConfiguration: healthCheckConfig,
      // Observability configuration disabled by default
      // To enable, create an ObservabilityConfiguration and pass the ARN
      // observabilityConfiguration: {
      //   observabilityEnabled: true,
      //   observabilityConfigurationArn: 'arn:aws:apprunner:...',
      // },
    });

    this.serviceUrl = `https://${this.service.attrServiceUrl}`;
    this.serviceArn = this.service.attrServiceArn;

    // Outputs
    new cdk.CfnOutput(this, 'ServiceUrl', {
      value: this.serviceUrl,
      description: 'AppRunner service URL',
    });

    new cdk.CfnOutput(this, 'ServiceArn', {
      value: this.serviceArn,
      description: 'AppRunner service ARN',
    });

    new cdk.CfnOutput(this, 'ServiceId', {
      value: this.service.attrServiceId,
      description: 'AppRunner service ID',
    });
  }
}
