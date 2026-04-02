import React from 'react';
import QuizRenderer from '../../../components/QuizRenderer.jsx';

export default function QuizContent() {
    const questions = [
        {
            text: "What is the smallest and simplest Kubernetes object? A piece of the puzzle that represents a single instance of a running process.",
            options: ["Node", "Container", "Pod", "Deployment"],
            correctIndex: 2,
            explanation: "A Pod is the smallest deployable compute unit in Kubernetes. It encapsulates one or more containers, storage resources, a unique network IP, and options that govern how the container(s) should run."
        },
        {
            text: "Which control plane component acts as the 'source of truth' and stores all cluster state?",
            options: ["kube-scheduler", "etcd", "kube-apiserver", "kube-controller-manager"],
            correctIndex: 1,
            explanation: "etcd is a consistent and highly-available key-value store used as Kubernetes' backing store for all cluster data. Only the API server talks directly to etcd."
        },
        {
            text: "Which controller manages stateless applications and allows for zero-downtime rolling updates?",
            options: ["StatefulSet", "DaemonSet", "Job", "Deployment"],
            correctIndex: 3,
            explanation: "A Deployment provides declarative updates for Pods and ReplicaSets. It is the standard way to deploy stateless applications, allowing for scaling and rolling updates."
        },
        {
            text: "How does a Kubernetes Service know which Pods to route traffic to?",
            options: [
                "By matching the Pod's IP address.",
                "By using Label Selectors to match Pod labels.",
                "By using the Pod's name.",
                "Services route to all Pods in the same Namespace."
            ],
            correctIndex: 1,
            explanation: "Services use Label Selectors (e.g., app: backend) to dynamically find Pods. Any Pod bearing that label will instantly receive traffic from the Service."
        },
        {
            text: "What is the difference between a ConfigMap and a Secret?",
            options: [
                "ConfigMaps are for environment variables; Secrets are exclusively for files.",
                "ConfigMaps store non-confidential data; Secrets store confidential/sensitive data (like passwords).",
                "ConfigMaps are mutable; Secrets are immutable.",
                "There is no difference, both are encrypted."
            ],
            correctIndex: 1,
            explanation: "ConfigMaps are used to store non-sensitive configuration data in key-value pairs. Secrets are specifically designed to hold sensitive information like passwords, OAuth tokens, and ssh keys, and are base64-encoded."
        },
        {
            text: "What happens if a container exceeds its memory `limit`?",
            options: [
                "It is throttled (slowed down).",
                "It is OOMKilled (Out Of Memory Killed) and restarted.",
                "It borrows memory from the node.",
                "Nothing happens, limits are just guidelines."
            ],
            correctIndex: 1,
            explanation: "While CPU limits result in throttling, exceeding a memory limit forces the node's kernel to terminate the process with an OOMKilled status. The kubelet will then restart it."
        },
        {
            text: "What happens if a Pod's `livenessProbe` fails multiple times?",
            options: [
                "The Pod is removed from the Service endpoints.",
                "The kubelet restarts the container.",
                "The entire Node is marked as NotReady.",
                "The Pod is evicted to another Node."
            ],
            correctIndex: 1,
            explanation: "A livenessProbe indicates whether the container is running. If the liveness probe fails, the kubelet kills the container, and the container is subjected to its restart policy."
        },
        {
            text: "Which object ensures that if a Pod dies, a replacement is automatically created to maintain the desired count?",
            options: ["ReplicaSet", "PodManager", "Kubelet", "Scheduler"],
            correctIndex: 0,
            explanation: "A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time. (Note: Deployments manage ReplicaSets automatically)."
        },
        {
            text: "What is a Kubernetes Namespace used for?",
            options: [
                "Physical server isolation",
                "Logical isolation and dividing cluster resources between multiple users or teams",
                "Encrypting traffic between pods",
                "Assigning dedicated IP blocks to applications"
            ],
            correctIndex: 1,
            explanation: "Namespaces are a way to divide cluster resources between multiple users (via resource quotas) and environments (e.g., dev, staging, prod)."
        },
        {
            text: "If you want a Pod to be given the lowest priority for eviction when a node runs out of memory, what QoS class should it be?",
            options: [
                "Guaranteed (Requests == Limits)",
                "Burstable (Requests < Limits)",
                "BestEffort (No Requests or Limits)",
                "Critical"
            ],
            correctIndex: 0,
            explanation: "Guaranteed QoS pods (where requests exactly match limits for all resources) are the absolute last to be evicted. BestEffort pods are evicted first."
        },
        {
            text: "What component runs on EVERY worker node to communicate with the control plane and start containers?",
            options: ["kube-proxy", "etcd", "kubelet", "containerd"],
            correctIndex: 2,
            explanation: "The kubelet is the primary 'node agent'. It registers the node with the apiserver and ensures the containers described in PodSpecs are running and healthy."
        },
        {
            text: "Which command would you use to see why a Pod is stuck in the 'Pending' state?",
            options: [
                "kubectl logs pod-name",
                "kubectl describe pod pod-name",
                "kubectl get pod pod-name -o yaml",
                "kubectl explain pod"
            ],
            correctIndex: 1,
            explanation: "A Pending pod hasn't started containers yet, so `logs` won't work. `kubectl describe` shows the 'Events' at the bottom, which will reveal scheduling errors (like missing resources or node affinities)."
        }
    ];
    return <QuizRenderer title="Core Concepts Quiz" questions={questions} nextModuleUrl="/learn/modules/1/labs" />;
}
