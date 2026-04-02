import React from 'react';
import LabRenderer from '../../../components/LabRenderer.jsx';

export default function LabsContent() {
    const tasks = [
        {
            id: 1,
            title: "Lab 1: Create a Job",
            description: "Deploy a batch Job that calculates pi to 2000 places using perl.",
            command: "kubectl create job pi --image=perl:5.34 -- perl -Mbignum=bpi -wle 'print bpi(2000)'",
            expectedOutput: "Run 'kubectl get jobs' and wait for COMPLETIONS to read '1/1'. It might take 10-20 seconds."
        },
        {
            id: 2,
            title: "Lab 2: Read Job Results",
            description: "Look at the logs for the Pod created by the Job to see the output.",
            command: "kubectl logs job/pi",
            expectedOutput: "A massive block of numbers starting with '3.14159265...'"
        },
        {
            id: 3,
            title: "Lab 3: Delete the Job",
            description: "Clean up the finished job so its Pod is deleted from the cluster permanently.",
            command: "kubectl delete job pi",
            expectedOutput: "Run 'kubectl get jobs' and ensure no jobs are listed."
        },
        {
            id: 4,
            title: "Lab 4: Create a CPU-consuming Deployment",
            description: "Start a deployment of an image specifically designed to consume CPU. In a real cluster, you'd configure an HPA on this.",
            command: "kubectl create deployment stress --image=k8s.gcr.io/hpa-example --port=80",
            expectedOutput: "Run 'kubectl get deployment' to verify."
        },
        {
            id: 5,
            title: "Lab 5: Setup CPU Requests",
            description: "An HPA cannot work without a resource request. Let's patch the deployment to request 200m (20% of one CPU core).",
            command: "kubectl set resources deployment stress --requests=cpu=200m",
            expectedOutput: "Run 'kubectl describe deployment stress' and look under Containers > hpa-example > Requests > cpu: 200m."
        },
        {
            id: 6,
            title: "Lab 6: Expose the Stress App",
            description: "Before we autoscale, we must expose the application so a load generator can reach it.",
            command: "kubectl expose deployment stress --port=80",
            expectedOutput: "Run 'kubectl get svc' and make sure 'stress' exists."
        },
        {
            id: 7,
            title: "Lab 7: Run an HPA Generator",
            description: "Create the HorizontalPodAutoscaler to maintain an average of 50% CPU utilization across all pods, spanning from 1 to 10 replicas.",
            command: "kubectl autoscale deployment stress --cpu-percent=50 --min=1 --max=10",
            expectedOutput: "Run 'kubectl get hpa' and look at TARGETS. Initially it will say '<unknown>/50%'. Wait a minute, and if Metrics Server is running, it will read '0%/50%'."
        },
        {
            id: 8,
            title: "Lab 8: Clean Up",
            description: "Delete the HPA, Service, and Deployment.",
            command: "kubectl delete hpa stress && kubectl delete svc stress && kubectl delete deployment stress",
            expectedOutput: "Run 'kubectl get all' to ensure a perfectly clean default namespace."
        }
    ];

    return (
        <LabRenderer 
            title="Hands-on Labs: Advanced Workloads"
            description="Complete the following tasks to master Jobs, CronJobs, and Horizontal Pod Autoscaling."
            tasks={tasks}
        />
    );
}
