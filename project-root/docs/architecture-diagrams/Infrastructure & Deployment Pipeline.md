Infrastructure & Deployment Pipeline
Description:
Shows how code is moved from repository through CI/CD pipelines onto production infrastructure and monitored.

   +---------------------+       +---------------------+
   | GitHub Repository   |       | CI/CD (GitHub       |
   | (frontend/backend)  | ----> | Actions/Jenkins)    |
   +---------+-----------+       +----------+----------+
             |                          |
             | (push code)             | (build, test, deploy)
             v                          v
       +------------+           +------------------------+
       | Docker     |           | AWS EC2 / GCP Compute  |
       | Build &    |           | Instances or Kubernetes|
       | Images     |           | Pods (if containerized)|
       +------+-----+           +-----------+------------+
              |                              |
              | (docker push images)         | (run app)
              v                              v
      +-----------------+             +-------------------+
      |  Docker Registry|             | AWS S3 (Static)   |
      |  (ECR/GCR)      |             | CDN (CloudFront)  |
      +-------+---------+             +---------+---------+
              |                              |
              v                              v
      +-------------+                 +-------------+
      |    Backend  |                 |   Frontend  |
      |    Services |                 |   (SPA)      |
      +------+------+                 +------+-------+
             |                               |
             | (monitoring, logs)             |
             v                               v
      +------------+                   +------------+
      | Monitoring |                   | Logging     |
      | (Datadog)  |                   | (CloudWatch)|
      +------------+                   +------------+
Explanation:

GitHub Repo: Source code repository for front-end and back-end.
CI/CD: Automates building, testing, and deploying code changes.
Docker Registry: Stores container images that are deployed to servers.
AWS EC2 / GCP Compute: Runs the backend application servers.
S3/CloudFront: Hosts static front-end assets.
Monitoring & Logging: Tracks performance and errors.