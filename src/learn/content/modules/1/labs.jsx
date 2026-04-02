import React from 'react';
import LabRenderer from '../../../components/LabRenderer.jsx';

export default function LabsContent() {
    const tasks = [
        {
            id: 1,
            title: "Lab 1: Create a Pod Imperatively",
            description: "Run a simple NGINX pod named 'web' without using a YAML file.",
            command: "kubectl run web --image=nginx:alpine --port=80",
            expectedOutput: "Run 'kubectl get pods' and wait for 'web' to show STATUS: Running."
        },
        {
            id: 2,
            title: "Lab 2: Check Pod Details",
            description: "Describe the pod you just created to see its IP address, labels, and event history.",
            command: "kubectl describe pod web",
            expectedOutput: "Look for the 'IP:' field, usually an address like 10.42.0.x, and the 'Events:' section at the bottom showing successful scheduling and container start."
        },
        {
            id: 3,
            title: "Lab 3: Expose the Pod",
            description: "Expose the 'web' pod quickly using an imperative port-forward to test it locally.",
            command: "kubectl port-forward pod/web 8080:80",
            expectedOutput: "Open another terminal or browser and curl http://localhost:8080. You should see 'Welcome to nginx!'. (Press Ctrl+C to stop port-forwarding)."
        },
        {
            id: 4,
            title: "Lab 4: Dry-Run a Deployment",
            description: "Instead of creating a namespace directly, generate the YAML and save it to a file. This is how you transition from imperative to declarative.",
            command: "kubectl create deployment backend --image=redis --dry-run=client -o yaml > redis-deploy.yaml",
            expectedOutput: "Run 'cat redis-deploy.yaml' to see the generated Deployment object."
        },
        {
            id: 5,
            title: "Lab 5: Apply Declarative YAML",
            description: "Apply the Deployment file you just created.",
            command: "kubectl apply -f redis-deploy.yaml",
            expectedOutput: "Run 'kubectl get deployment backend' inside your cluster."
        },
        {
            id: 6,
            title: "Lab 6: Scale the Deployment",
            description: "Scale the Redis deployment horizontally to 3 replicas.",
            command: "kubectl scale deployment backend --replicas=3",
            expectedOutput: "Run 'kubectl get pods'. You should see three 'backend-xxxx' pods spinning up or already running."
        },
        {
            id: 7,
            title: "Lab 7: Read Container Logs",
            description: "Read the logs for one of the Redis pods. Provide the exact pod name.",
            command: "kubectl logs deploy/backend",
            expectedOutput: "You'll see the Redis startup ASCII art logo and 'Ready to accept connections'. By using deploy/backend, kubectl automatically picks the first pod in that deployment."
        },
        {
            id: 8,
            title: "Lab 8: Clean Up",
            description: "Delete the pod and deployment you created.",
            command: "kubectl delete pod web && kubectl delete deployment backend",
            expectedOutput: "Run 'kubectl get pods'. Both the 'web' pod and the 3 'backend' pods will terminate and disappear."
        }
    ];

    return (
        <LabRenderer 
            title="Hands-on Labs: Core Concepts"
            description="Complete the following tasks to master the basics of deploying, managing, and troubleshooting workloads."
            tasks={tasks}
        />
    );
}
