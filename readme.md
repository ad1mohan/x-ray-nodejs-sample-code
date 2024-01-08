This repo contains two applicataions hosted using express.js and instrumented with X-Ray such that trace map in Management Console shows folloiwng:
```
Client ---> Microservice 1 ---> Microservice 2
```
Docker commands to build image and push to ECR
```
aws ecr get-login-password --region <Region> | docker login --username AWS --password-stdin <Account-ID>.dkr.ecr.<Region>.amazonaws.com

docker buildx build --platform linux/amd64 -t <Account-ID>.dkr.ecr.<Region>.amazonaws.com/app-1:latest -f Dockerfile1 .
docker buildx build --platform linux/amd64 -t <Account-ID>.dkr.ecr.<Region>.amazonaws.com/app-2:latest -f Dockerfile2 .

docker push <Account-ID>.dkr.ecr.<Region>.amazonaws.com/app-1:latest
docker push <Account-ID>.dkr.ecr.<Region>.amazonaws.com/app-2:latest
```
Task definition for app1 (similar is for app2):
```
{
    "family": "app1",
    "containerDefinitions": [
        {
            "name": "app-1",
            "image": "<Account-ID>.dkr.ecr.ap-northeast-1.amazonaws.com/app-1:latest",
            "cpu": 0,
            "portMappings": [
                {
                    "name": "app-1-3000-tcp",
                    "containerPort": 3000,
                    "hostPort": 3000,
                    "protocol": "tcp",
                    "appProtocol": "http"
                }
            ],
            "essential": true,
            "environment": [],
            "mountPoints": [],
            "volumesFrom": [],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-create-group": "true",
                    "awslogs-group": "/ecs/app-1",
                    "awslogs-region": "ap-northeast-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        },
        {
            "name": "xray-daemon",
            "image": "amazon/aws-xray-daemon:latest",
            "cpu": 0,
            "portMappings": [
                {
                    "name": "xray-daemon-2000-tcp",
                    "containerPort": 2000,
                    "hostPort": 2000,
                    "protocol": "tcp"
                }
            ],
            "essential": false,
            "environment": [
                {
                    "name": "AWS_XRAY_DAEMON_ADDRESS",
                    "value": "0.0.0.0:2000"
                }
            ],
            "mountPoints": [],
            "volumesFrom": [],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-create-group": "true",
                    "awslogs-group": "/ecs/app-1",
                    "awslogs-region": "ap-northeast-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ],
    "taskRoleArn": "arn:aws:iam::<Account-ID>:role/ecsTaskExecutionRole",
    "executionRoleArn": "arn:aws:iam::<Account-ID>:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "1024",
    "memory": "3072",
    "runtimePlatform": {
        "cpuArchitecture": "X86_64",
        "operatingSystemFamily": "LINUX"
    }
}
```
