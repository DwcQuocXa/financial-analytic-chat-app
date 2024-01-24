import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Artifact, Pipeline, ArtifactPath } from 'aws-cdk-lib/aws-codepipeline';
import {
    BuildEnvironmentVariableType,
    Cache,
    ComputeType,
    LinuxBuildImage,
    LocalCacheMode,
    PipelineProject,
} from 'aws-cdk-lib/aws-codebuild';
import {
    CodeBuildAction,
    CodeBuildActionType,
    CodeStarConnectionsSourceAction,
    EcsDeployAction,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import { BaseService } from 'aws-cdk-lib/aws-ecs';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const buildRole = Role.fromRoleArn(this, 'Role', 'arn:aws:iam::476194719932:role/CodeDeployRole');

        const sourceOutput = new Artifact();
        const frontendBuildOutput = new Artifact('frontendArtifact');
        const backendBuildOutput = new Artifact('backendArtifact');

        const frontendService = BaseService.fromServiceArnWithCluster(this, 'ChatAppAlphaSenseFrontendService',
            'arn:aws:ecs:eu-west-1:476194719932:service/chatapp-alphasense-cluster/frontend-fargate'
        );

        const backendService = BaseService.fromServiceArnWithCluster(this, 'ChatAppAlphaSenseBackendService',
            'arn:aws:ecs:eu-west-1:476194719932:service/chatapp-alphasense-cluster/backend-fargate'
        );

        const project = new PipelineProject(this, 'chatapp-alphasense-project', {
            description: 'CodePipeline for Chatapp Alphasense',
            projectName: 'chatapp-alphasense-code-pipeline',
            role: buildRole,
            environment: {
                computeType: ComputeType.MEDIUM,
                buildImage: LinuxBuildImage.AMAZON_LINUX_2_5,
                privileged: true,
            },
            environmentVariables: {},
            concurrentBuildLimit: 1,
            cache: Cache.local(LocalCacheMode.DOCKER_LAYER, LocalCacheMode.CUSTOM),
        });

        const sourceAction = new CodeStarConnectionsSourceAction({
            actionName: 'Github_Source',
            owner: 'DwcQuocXa',
            repo: 'chatapp-alphasense',
            branch: 'master',
            triggerOnPush: true,
            connectionArn: 'arn:aws:codestar-connections:eu-west-1:476194719932:connection/ba9d1c18-01fb-4251-a515-91434c8dfee0',
            output: sourceOutput,
        });

        const buildAction = new CodeBuildAction({
            actionName: 'code-build',
            project,
            input: sourceOutput,
            outputs: [frontendBuildOutput, backendBuildOutput],
            executeBatchBuild: false,
            type: CodeBuildActionType.BUILD,
            environmentVariables: {
                REACT_APP_API_URL: {
                    value: 'arn:aws:secretsmanager:eu-west-1:476194719932:secret:chatapp-alphasense-MAcSmc:REACT_APP_API_URL',
                    type: BuildEnvironmentVariableType.SECRETS_MANAGER,
                },
            },
        });

        const deployToFrontendAction = new EcsDeployAction({
            actionName: 'DeployToFrontend',
            service: frontendService,
            deploymentTimeout: Duration.minutes(15),
            imageFile: new ArtifactPath(frontendBuildOutput, 'imagedefinitions-frontend.json'),
        });

        const deployToBackendAction = new EcsDeployAction({
            actionName: 'DeployToBackend',
            service: backendService,
            deploymentTimeout: Duration.minutes(15),
            imageFile: new ArtifactPath(backendBuildOutput, 'imagedefinitions-backend.json'),
        });

        new Pipeline(this, 'chatapp-alphasense-code-pipeline', {
            pipelineName: 'chatapp-alphasense-code-pipeline',
            stages: [
                {
                    stageName: 'Source',
                    actions: [sourceAction],
                },
                {
                    stageName: 'Build',
                    actions: [buildAction],
                },
                {
                    stageName: 'Deploy',
                    actions: [deployToFrontendAction, deployToBackendAction],
                },
            ],
        });
    }
}
