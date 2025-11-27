import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';

export interface MonitoringProps {
  /**
   * Service name to monitor
   */
  serviceName: string;

  /**
   * Email address for alarm notifications
   */
  alarmEmail: string;

  /**
   * CPU threshold percentage (default: 80)
   */
  cpuThreshold?: number;

  /**
   * Memory threshold percentage (default: 80)
   */
  memoryThreshold?: number;

  /**
   * 4xx error threshold (default: 50)
   */
  errorThreshold?: number;
}

export class Monitoring extends Construct {
  public readonly alarmTopic: sns.Topic;
  public readonly cpuAlarm: cloudwatch.Alarm;
  public readonly memoryAlarm: cloudwatch.Alarm;
  public readonly errorAlarm: cloudwatch.Alarm;

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    // Create SNS topic for alarms
    this.alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      displayName: `${props.serviceName} Alarms`,
    });

    // Subscribe email to topic
    new sns.Subscription(this, 'EmailSubscription', {
      topic: this.alarmTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: props.alarmEmail,
    });

    // CPU Utilization Alarm
    this.cpuAlarm = new cloudwatch.Alarm(this, 'HighCpuAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/AppRunner',
        metricName: 'CPUUtilization',
        dimensionsMap: {
          ServiceName: props.serviceName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: props.cpuThreshold || 80,
      evaluationPeriods: 2,
      alarmDescription: `Alert when CPU exceeds ${props.cpuThreshold || 80}%`,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    this.cpuAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

    // Memory Utilization Alarm
    this.memoryAlarm = new cloudwatch.Alarm(this, 'HighMemoryAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/AppRunner',
        metricName: 'MemoryUtilization',
        dimensionsMap: {
          ServiceName: props.serviceName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: props.memoryThreshold || 80,
      evaluationPeriods: 2,
      alarmDescription: `Alert when memory exceeds ${props.memoryThreshold || 80}%`,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    this.memoryAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

    // HTTP 4xx Error Rate Alarm
    this.errorAlarm = new cloudwatch.Alarm(this, 'High4xxErrorAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/AppRunner',
        metricName: '4xxStatusResponses',
        dimensionsMap: {
          ServiceName: props.serviceName,
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: props.errorThreshold || 50,
      evaluationPeriods: 1,
      alarmDescription: `Alert when 4xx errors exceed ${props.errorThreshold || 50} in 5 minutes`,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    this.errorAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

    // Outputs
    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: this.alarmTopic.topicArn,
      description: 'SNS Topic ARN for alarms',
    });
  }
}
