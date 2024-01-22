import { Construct } from 'constructs/lib/construct';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Stack, StackProps } from 'aws-cdk-lib';

export class ECRStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        new Repository(this, `chatapp-alphasense`, {
            repositoryName: `chatapp-alphasense`,
        });
    }
}
