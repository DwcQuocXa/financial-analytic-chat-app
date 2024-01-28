import { Stack, Duration, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Vpc, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Repository, IRepository } from 'aws-cdk-lib/aws-ecr';
import {
    Cluster, ICluster,
    ContainerImage,
    PropagatedTagSource,
    FargateTaskDefinition,
    Protocol as ecsProtocol,
    LogDriver,
    DeploymentControllerType,
    FargateService,
    Secret as ecsSecret,
} from 'aws-cdk-lib/aws-ecs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import {
    ApplicationProtocol,
    ApplicationLoadBalancer,
    ApplicationTargetGroup,
    SslPolicy,
    TargetType,
    ListenerAction, Protocol, IApplicationTargetGroup,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs/lib/construct';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class EcsCluster extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const getExistingVpc: IVpc = Vpc.fromLookup(this, 'PersonalProjectsVpc', { tags: { Name: 'VpcStack/PersonalProjects' } });
        const cluster = new Cluster(this, 'chatapp-alphasense-cluster', {
            clusterName: 'chatapp-alphasense-cluster',
            containerInsights: true,
            vpc: getExistingVpc,
        });

        const repo = Repository.fromRepositoryName(this, 'repo', 'chatapp-alphasense');

        const frontendTargetGroup = new ApplicationTargetGroup(this, 'FrontendTargetGroup', {
            vpc: getExistingVpc,
            port: 80,
            protocol: ApplicationProtocol.HTTP,
            targetType: TargetType.IP,
        });
        frontendTargetGroup.configureHealthCheck({
            path: '/',
            port: '80',
            protocol: Protocol.HTTP,
            healthyHttpCodes: '200',
            interval: Duration.minutes(2),
        });

        const backendTargetGroup = new ApplicationTargetGroup(this, 'BackendTargetGroup', {
            vpc: getExistingVpc,
            port: 4000,
            protocol: ApplicationProtocol.HTTP,
            targetType: TargetType.IP,
        });

        backendTargetGroup.configureHealthCheck({
            path: '/',
            port: '4000',
            protocol: Protocol.HTTP,
            healthyHttpCodes: '200',
            interval: Duration.minutes(2),
        });

        const frontendLb = this.createApplicationLoadBalancer(getExistingVpc, 'ChatAppAlphaSense_Frontend_ALB',  frontendTargetGroup);
        const backendLb = this.createApplicationLoadBalancer(getExistingVpc, 'ChatAppAlphaSense_Backend_ALB',  backendTargetGroup);

        const backendSecret = Secret.fromSecretCompleteArn(
            this,
            `chatapp-alphasense-backend-secrets`,
            `arn:aws:secretsmanager:eu-west-1:476194719932:secret:chatapp-alphasense-MAcSmc`,
        );

        const backendEnv = {
            ALPHA_VANTAGE_API_KEY: ecsSecret.fromSecretsManager(backendSecret, 'ALPHA_VANTAGE_API_KEY'),
            OPENAI_API_KEY: ecsSecret.fromSecretsManager(backendSecret, 'OPENAI_API_KEY')
        }

        const backendFargateService = this.createFargateService(cluster, repo, backendTargetGroup, 4000, 'backend', backendEnv);

        const backendLbUrl = backendLb.loadBalancerDnsName;

        const frontendFargateService = this.createFargateService(cluster, repo, frontendTargetGroup, 80, 'frontend', {});

        new CfnOutput(this, 'BackendLBUrl', { value: backendLbUrl });
        new CfnOutput(this, 'FrontendLBUrl', { value: frontendLb.loadBalancerDnsName });
    }

    createApplicationLoadBalancer(
        vpc: IVpc,
        id: string,
        targetGroup: ApplicationTargetGroup
    ): ApplicationLoadBalancer {
        const loadBalancer = new ApplicationLoadBalancer(this, id, {
            vpc,
            internetFacing: true
        });

        loadBalancer.addListener('HttpListener', {
            port: 80,
            open: true,
            defaultTargetGroups: [targetGroup]
        });

        /*loadBalancer.addListener('HttpsListener', {
            port: 443,
            open: true,
            protocol: ApplicationProtocol.HTTPS,
            sslPolicy: SslPolicy.RECOMMENDED,
            defaultTargetGroups: [targetGroup]
        });

        loadBalancer.addListener('HttpListener', {
            port: 80,
            open: true,
            defaultAction: ListenerAction.redirect({
                protocol: 'HTTPS',
                port: '443',
                permanent: true
            }),
        });*/

        return loadBalancer;
    }

    createFargateService(
        cluster: ICluster,
        repo: IRepository,
        targetGroup: IApplicationTargetGroup,
        containerPort: number,
        serviceName: string,
        environment: any
    ): FargateService {
        const fargateTask = new FargateTaskDefinition(this, `${serviceName}-taskDefinition`, {
            memoryLimitMiB: 2048,
            cpu: 1024,
            family: serviceName
        });

        const container = fargateTask.addContainer(`${serviceName}-container`, {
            image: ContainerImage.fromEcrRepository(repo, `latest_${serviceName}`),
            containerName: `${serviceName}-container`,
            essential: true,
            logging: LogDriver.awsLogs({
                streamPrefix: `ecs/${serviceName}-fargate`,
                logRetention: RetentionDays.ONE_MONTH
            }),
            secrets: environment
        });

        container.addPortMappings({
            containerPort,
            protocol: ecsProtocol.TCP
        });

        const fargateService = new FargateService(this, `${serviceName}-service`, {
            cluster,
            taskDefinition: fargateTask,
            desiredCount: 1,
            serviceName: `${serviceName}-fargate`,
            deploymentController: { type: DeploymentControllerType.ECS },
            healthCheckGracePeriod: Duration.minutes(5),
            enableExecuteCommand: true,
            propagateTags: PropagatedTagSource.SERVICE,
            enableECSManagedTags: true,
        });

        fargateService.attachToApplicationTargetGroup(targetGroup);

        return fargateService;
    }
}
