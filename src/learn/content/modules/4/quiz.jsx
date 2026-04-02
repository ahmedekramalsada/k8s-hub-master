import React from 'react';
import QuizRenderer from '../../../components/QuizRenderer.jsx';

export default function QuizContent() {
    const questions = [
        {
            text: "What is the primary difference between a Role and a ClusterRole?",
            options: [
                "Roles are assigned to Users, ClusterRoles belong to Groups.",
                "Roles grant permissions within a specific Namespace; ClusterRoles grant permissions cluster-wide or across all Namespaces.",
                "Roles deal with Nodes, ClusterRoles deal with Pods.",
                "Roles map to IAM roles; ClusterRoles run locally."
            ],
            correctIndex: 1,
            explanation: "In Kubernetes RBAC, a Role inherently applies only to the Namespace it was created in. A ClusterRole is a non-namespaced resource used for cluster-scoped permissions (e.g., getting all Nodes)."
        },
        {
            text: "How do you give a Pod specific permissions to read from the Kubernetes API?",
            options: [
                "Create a ServiceAccount, bind a Role to it via RoleBinding, and assign the `serviceAccountName` to the Pod.",
                "Pass an IAM Token into a `ConfigMap`.",
                "Configure a kubeconfig file directly inside the container image.",
                "Set `hostNetwork: true` on the Pod."
            ],
            correctIndex: 0,
            explanation: "ServiceAccounts are Kubernetes identities for workloads. You bind a Role (defining permissions) to a ServiceAccount (an identity) and assign it to the Pod instance in its configuration."
        },
        {
            text: "Which of the following describes the Principle of Least Privilege in Kubernetes RBAC?",
            options: [
                "Assigning `cluster-admin` globally.",
                "Giving a user a Role exactly tailored to delete Pods in the `dev` namespace, and absolutely nothing more.",
                "Using the `--anonymous-auth=true` flag on kube-apiserver.",
                "Letting all ServiceAccounts share the same default token."
            ],
            correctIndex: 1,
            explanation: "The Principle of Least Privilege states that a subject should only be granted the minimum permissions necessary to perform their stated operational tasks."
        },
        {
            text: "Which Pod Security feature prevents a container from gaining more privileges than its parent process?",
            options: [
                "fsGroup",
                "runAsUser",
                "allowPrivilegeEscalation: false",
                "readOnlyRootFilesystem"
            ],
            correctIndex: 2,
            explanation: "When you set `allowPrivilegeEscalation: false` in a container's SecurityContext, the kernel prevents the `setuid` bit from granting root privileges back to a process running as a non-root user."
        },
        {
            text: "What does Kubernetes use to replace the deprecated PodSecurityPolicies (PSP)?",
            options: [
                "Open Policy Agent (OPA) Gatekeeper",
                "RoleBasedAccessControl",
                "Pod Security Admission (PSA)",
                "SELinux options"
            ],
            correctIndex: 2,
            explanation: "Pod Security Admission is the built-in admission controller replacing PSP. It relies on labels placed on Namespaces that enforce Pod Security Standards (Privileged, Baseline, Restricted)."
        },
        {
            text: "Why is it best practice to specify `readOnlyRootFilesystem: true` in your container's security context?",
            options: [
                "To speed up container startup time.",
                "To mount volumes much faster.",
                "To prevent attackers who exploit the application from downloading and saving malware to the container's disk.",
                "To share the filesystem across nodes."
            ],
            correctIndex: 2,
            explanation: "A read-only root restricts an attacker's ability to mutate binaries, install tools (like curl or wget), or write malicious scripts if your application is ever compromised."
        },
        {
            text: "What happens when you set `.automountServiceAccountToken: false` on a Pod spec?",
            options: [
                "The Pod immediately restarts in CrashLoopBackOff.",
                "The API server issues a new X.509 certificate instead.",
                "The container is prevented from automatically receiving the default `/var/run/secrets/.../token` file.",
                "The Node stops reporting metrics."
            ],
            correctIndex: 2,
            explanation: "By default, Kubernetes injects an API token into every Pod if you don't declare a specific ServiceAccount. Disabling this is an excellent security measure when the application does not need to talk back to the Kubernetes API."
        },
        {
            text: "Which statement about Kubernetes Secrets is TRUE by default?",
            options: [
                "Data is encrypted using military-grade AES-256 before being stored in etcd.",
                "Data is simply base64-encoded, but not automatically encrypted at rest in etcd unless explicitly configured.",
                "Secrets can only be read once.",
                "Secrets are tied exclusively to the host machine's IP address."
            ],
            correctIndex: 1,
            explanation: "By default, Kubernetes Secrets are base64-encoded plain text strings. An administrator must specifically enable EncryptionConfiguration (encryption data at rest) to secure them inside etcd."
        },
        {
            text: "Consider a highly restricted production cluster. If you need to drop all Linux capabilities and add only the specific one your app requires to bind to a low port (like 80), you would configure:",
            options: [
                "securityContext.capabilities: { drop: ['ALL'], add: ['NET_BIND_SERVICE'] }",
                "securityContext.capabilities: { runAsPrivileged: true }",
                "role.capabilities.allow: ['NET_DEFAULT']",
                "hostNetwork: true"
            ],
            correctIndex: 0,
            explanation: "Capabilities allow fine-grained control over what a container can do without full root privileges. The best practice is dropping `ALL` capabilities and selectively adding back (e.g., `NET_BIND_SERVICE`)."
        },
        {
            text: "By default, how do Pods on different nodes in a Kubernetes cluster encrypt their inter-pod network traffic?",
            options: [
                "They use IPsec automatically.",
                "They use Mutual TLS via kube-proxy.",
                "They do not encrypt traffic by default.",
                "Traffic is hashed into base64 packets."
            ],
            correctIndex: 2,
            explanation: "Out-of-the-box Kubernetes does not encrypt pod-to-pod communications. If you need encryption in transit, you must install a Service Mesh (like Istio/Linkerd) or configure your CNI plugin (like Calico with WireGuard) to provide mTLS/IPsec."
        }
    ];
    return <QuizRenderer title="Security & Policies Quiz" questions={questions} nextModuleUrl="/learn/modules/4/labs" />;
}
