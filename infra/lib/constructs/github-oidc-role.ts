import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface GitHubOidcRoleProps {
  /**
   * GitHub repository in format: owner/repo
   * Example: 'myorg/myrepo'
   */
  githubRepo: string;

  /**
   * GitHub branches that can assume this role
   * Default: ['main', 'develop']
   */
  branches?: string[];
}

export class GitHubOidcRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: GitHubOidcRoleProps) {
    super(scope, id);

    const branches = props.branches || ['main', 'develop'];

    // Create OIDC provider for GitHub Actions
    const githubProvider = new iam.OpenIdConnectProvider(this, 'GitHubProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    // Create IAM role that GitHub Actions can assume
    this.role = new iam.Role(this, 'GitHubActionsRole', {
      assumedBy: new iam.WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': branches.map(
              (branch) => `repo:${props.githubRepo}:ref:refs/heads/${branch}`
            ),
          },
        }
      ),
      description: 'Role for GitHub Actions to deploy via CDK',
      maxSessionDuration: cdk.Duration.hours(1),
    });

    // Add permissions needed for CDK deployment
    this.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('PowerUserAccess')
    );

    // Add IAM permissions (PowerUserAccess doesn't include IAM)
    this.role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'iam:CreateRole',
          'iam:DeleteRole',
          'iam:GetRole',
          'iam:PassRole',
          'iam:AttachRolePolicy',
          'iam:DetachRolePolicy',
          'iam:PutRolePolicy',
          'iam:DeleteRolePolicy',
          'iam:GetRolePolicy',
          'iam:TagRole',
          'iam:UntagRole',
        ],
        resources: ['*'],
      })
    );

    // Output the role ARN
    new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
      value: this.role.roleArn,
      description: 'IAM Role ARN for GitHub Actions',
      exportName: 'GitHubActionsRoleArn',
    });
  }
}
