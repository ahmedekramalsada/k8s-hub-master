import React from 'react';
import LabRenderer from '../../../components/LabRenderer.jsx';

export default function LabsContent() {
    const tasks = [
        {
            id: 1,
            title: "Lab 1: Deploy a Test Application",
            description: "Create a deployment running a simple echoserver. This application responds with information about the HTTP request it receives.",
            command: "kubectl create deployment echo --image=k8s.gcr.io/echoserver:1.4",
            expectedOutput: "Run 'kubectl get pods' and wait until the echo pod is Running."
        },
        {
            id: 2,
            title: "Lab 2: Create a ClusterIP Service",
            description: "Expose the 'echo' deployment internally using a ClusterIP service on port 8080.",
            command: "kubectl expose deployment echo --port=8080 --target-port=8080 --type=ClusterIP",
            expectedOutput: "Run 'kubectl get svc echo'. Notice it has a CLUSTER-IP assigned, but no EXTERNAL-IP."
        },
        {
            id: 3,
            title: "Lab 3: Test Internal Connectivity",
            description: "Start a temporary busybox pod to run a curl test from INSIDE the cluster, hitting the CoreDNS service name.",
            command: "kubectl run -it --rm test-pod --image=busybox -- wget -O- http://echo:8080",
            expectedOutput: "You should see the HTTP response text from the echoserver, proving DNS resolution ('echo') and the ClusterIP network are working."
        },
        {
            id: 4,
            title: "Lab 4: Create a NodePort Service",
            description: "Change the service design so you can hit it externally by patching the Service type to NodePort.",
            command: "kubectl patch svc echo -p '{\"spec\": {\"type\": \"NodePort\"}}'",
            expectedOutput: "Run 'kubectl get svc echo'. Under PORT(S), you will see '8080:3xxxx/TCP'. Make note of that 30000+ port."
        },
        {
            id: 5,
            title: "Lab 5: Test External Connectivity",
            description: "Hit the NodePort you found in the previous step using your machine's localhost.",
            command: "curl http://localhost:<YOUR-NODE-PORT>', replacing <YOUR-NODE-PORT> with the actual 3xxxx port.",
            expectedOutput: "You should receive the same echoserver response from outside the cluster!"
        },
        {
            id: 6,
            title: "Lab 6: Apply a Deny-All Network Policy",
            description: "Generate a default deny-all NetworkPolicy that blocks all incoming traffic in the default namespace.",
            command: "echo \"apiVersion: networking.k8s.io/v1\\nkind: NetworkPolicy\\nmetadata:\\n  name: default-deny-ingress\\nspec:\\n  podSelector: {}\\n  policyTypes:\\n  - Ingress\" | kubectl apply -f -",
            expectedOutput: "Run 'kubectl get networkpolicy' to verify it created. The podSelector `{}` means it applies to all pods."
        },
        {
            id: 7,
            title: "Lab 7: Verify Traffic Blocked",
            description: "Try curling the NodePort again exactly like you did in Lab 5.",
            command: "curl --connect-timeout 5 http://localhost:<YOUR-NODE-PORT>",
            expectedOutput: "The curl command should hang and eventually timeout because your NetworkPolicy is actively dropping the packets."
        },
        {
            id: 8,
            title: "Lab 8: Clean Up",
            description: "Delete the resources you created to reset your environment.",
            command: "kubectl delete deployment echo && kubectl delete svc echo && kubectl delete networkpolicy default-deny-ingress",
            expectedOutput: "Run 'kubectl get svc,deploy,networkpolicy' and ensure 'echo' and 'default-deny' are gone."
        }
    ];

    return (
        <LabRenderer 
            title="Hands-on Labs: Networking"
            description="Complete the following tasks to master Service exposing, CoreDNS resolution, NodePorts, and basic Network Policies."
            tasks={tasks}
        />
    );
}
