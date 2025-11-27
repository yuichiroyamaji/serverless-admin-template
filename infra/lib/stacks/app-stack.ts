import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import { AppRunnerService } from '../constructs/apprunner-service';
import { Monitoring } from '../constructs/monitoring';

export interface AppStackProps extends cdk.StackProps {
  /**
   * Custom domain name (optional)
   * Example: 'admin.example.com'
   */
  customDomain?: string;

  /**
   * Environment variables for the application
   */
  environmentVariables?: { [key: string]: string };

  /**
   * Email for CloudWatch alarms (optional)
   */
  alarmEmail?: string;

  /**
   * Instance configuration
   */
  instanceConfig?: {
    cpu?: '0.25 vCPU' | '0.5 vCPU' | '1 vCPU' | '2 vCPU' | '4 vCPU';
    memory?: '0.5 GB' | '1 GB' | '2 GB' | '3 GB' | '4 GB' | '6 GB' | '8 GB' | '10 GB' | '12 GB';
  };
}

export class AppStack extends cdk.Stack {
  public readonly serviceUrl: string;

  constructor(scope: Construct, id: string, props?: AppStackProps) {
    super(scope, id, props);

    const serviceName = 'nextjs-admin-dashboard';

    // Create AppRunner service
    // Use process.cwd() to get the infra directory, then go up one level to project root
    const infraDir = process.cwd();
    const projectRoot = path.resolve(infraDir, '..');
    const frontendPath = path.join(projectRoot, 'frontend');
    
    const appRunnerService = new AppRunnerService(this, 'AppRunnerService', {
      serviceName,
      dockerfilePath: frontendPath,
      environmentVariables: props?.environmentVariables,
      instanceConfig: props?.instanceConfig,
      healthCheck: {
        path: '/',
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
    });

    this.serviceUrl = appRunnerService.serviceUrl;

    // Custom domain configuration (if provided)
    // Note: Custom domains must be configured manually via AWS Console or CLI
    // after the service is deployed. See documentation for details.
    if (props?.customDomain) {
      new cdk.CfnOutput(this, 'CustomDomainName', {
        value: props.customDomain,
        description: 'Custom domain to configure (manual setup required)',
      });

      new cdk.CfnOutput(this, 'CustomDomainInstructions', {
        value: `Run: aws apprunner associate-custom-domain --service-arn ${appRunnerService.serviceArn} --domain-name ${props.customDomain}`,
        description: 'Command to associate custom domain',
      });
    }

    // Set up monitoring and alarms (if email provided)
    if (props?.alarmEmail) {
      new Monitoring(this, 'Monitoring', {
        serviceName,
        alarmEmail: props.alarmEmail,
        cpuThreshold: 80,
        memoryThreshold: 80,
        errorThreshold: 50,
      });
    }

    // Output instance role ARN for reference
    new cdk.CfnOutput(this, 'InstanceRoleArn', {
      value: appRunnerService.instanceRole.roleArn,
      description: 'IAM role ARN for AppRunner instance',
    });
  }
}
