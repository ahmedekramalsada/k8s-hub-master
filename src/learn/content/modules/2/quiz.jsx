import React from 'react';
import QuizRenderer from '../../../components/QuizRenderer.jsx';

export default function QuizContent() {
    const questions = [
        {
            text: "Which Service type exposes a service on a port across each Node's IP, making it externally accessible?",
            options: [
                "ClusterIP",
                "NodePort",
                "LoadBalancer",
                "ExternalName"
            ],
            correctIndex: 1,
            explanation: "NodePort opens a specific port (between 30000-32767) on all Nodes. Traffic sent to any Node's IP on that port is forwarded to the Service."
        },
        {
            text: "What is the primary function of an Ingress Controller?",
            options: [
                "To proxy traffic between containers inside the same Pod.",
                "To create AWS Load Balancers for every Service in the cluster.",
                "To read Ingress Objects and implement their HTTP/HTTPS routing rules using a reverse proxy (like NGINX).",
                "To block all incoming traffic by default."
            ],
            correctIndex: 2,
            explanation: "An Ingress resource is just a list of routing rules. The Ingress Controller (e.g., ingress-nginx) is the actual proxy that reads those rules and routes external HTTP(S) traffic to internal cluster Services."
        },
        {
            text: "Which component is responsible for implementing the cluster's virtual IP routing rules on each Node?",
            options: [
                "kubelet",
                "CoreDNS",
                "etcd",
                "kube-proxy"
            ],
            correctIndex: 3,
            explanation: "kube-proxy runs on every node and maintains network rules (using iptables or IPVS) to forward traffic directed to the virtual IP of a Service to the backend Pods."
        },
        {
            text: "How does CoreDNS resolve Service names across different Namespaces?",
            options: [
                "It cannot; DNS only works within the same Namespace.",
                "By using the format: <service-name>.<namespace>.svc.cluster.local",
                "By querying the public internet.",
                "It uses IP multicasting to broadcast requests."
            ],
            correctIndex: 1,
            explanation: "Kubernetes automatically configures CoreDNS. To reach a service named 'database' in the 'prod' namespace, you query 'database.prod.svc.cluster.local'."
        },
        {
            text: "What does CNI stand for in Kubernetes Networking?",
            options: [
                "Container Network Interface",
                "Cluster Network Integration",
                "Control Node Interconnect",
                "Core Network Infrastructure"
            ],
            correctIndex: 0,
            explanation: "CNI (Container Network Interface) is the standard API that allows third-party networking providers (like Calico, Flannel, Cilium) to seamlessly integrate their overlay networks into Kubernetes."
        },
        {
            text: "By default, what is the Network Policy for Pods in a Kubernetes cluster?",
            options: [
                "All ingress is blocked; egress is allowed.",
                "All egress is blocked; ingress is allowed.",
                "All Pods are isolated (default deny).",
                "All Pods are non-isolated (default allow all)."
            ],
            correctIndex: 3,
            explanation: "By default, Kubernetes allows open communication across the entire cluster. Any Pod can talk to any other Pod regardless of namespace. To restrict this, you must apply NetworkPolicies."
        },
        {
            text: "When configuring a NetworkPolicy, how do you specify which Pods the policy applies to?",
            options: [
                "Using the Pod's IP address.",
                "Using the Pod's exact name.",
                "Using an Ingress Controller annotation.",
                "Using podSelector with matchLabels."
            ],
            correctIndex: 3,
            explanation: "NetworkPolicies use a `podSelector` to match the labels of the target Pods before applying the ingress and egress rules."
        },
        {
            text: "If a Pod attempts to connect to a Service but receives a 'Connection Refused', what is the most likely culprit?",
            options: [
                "The Service's Endpoints list is empty because the Service's selector doesn't match any running Pods.",
                "CoreDNS is completely down.",
                "The Pod is running in the wrong namespace.",
                "The CPU limit was reached."
            ],
            correctIndex: 0,
            explanation: "If DNS resolves but the connection is refused, the Service exists but has no Endpoints. Meaning the `selector` on the Service doesn't match the `labels` on your Pods, or the Pods are crashing/failing readiness probes."
        },
        {
            text: "Which of the following describes an 'EndpointSlice' object?",
            options: [
                "A storage volume mapped to a Pod.",
                "A scalable and more efficient version of the Endpoints resource that groups multiple network endpoints together.",
                "A slice of CPU time allocated to network packets.",
                "A DNS caching layer."
            ],
            correctIndex: 1,
            explanation: "EndpointSlices were introduced because large scale services with thousands of backend Pods caused performance issues when updating a single massive Endpoints object. EndpointSlices break these lists down into chunks."
        },
        {
            text: "What does the 'ClusterIP' Service type do?",
            options: [
                "Exposes the Service on an external Load Balancer.",
                "Allows the host machine to access the Service.",
                "Exposes the Service on a cluster-internal IP. It is only reachable from within the cluster.",
                "Exposes the Service using an SRV DNS record."
            ],
            correctIndex: 2,
            explanation: "ClusterIP is the default service type. It provides an internal, virtual IP address that load-balances traffic exclusively among pods inside the cluster."
        }
    ];
    return <QuizRenderer title="Networking & Service Discovery Quiz" questions={questions} nextModuleUrl="/learn/modules/2/labs" />;
}
