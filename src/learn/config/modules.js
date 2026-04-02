export const MODULES = [
    {
        id: 0,
        emoji: "🐳",
        title: "Docker Fundamentals",
        shortTitle: "Docker Fun...",
        description: "Master the basics of containerization. Before learning Kubernetes, you must understand how Docker builds, ships, and runs containers.",
        level: "Beginner",
        estTimeMin: 45,
        labCount: 6,
    },
    {
        id: 1,
        emoji: "📦",
        title: "Core Concepts",
        shortTitle: "Core Concepts",
        description: "Learn the fundamental building blocks of Kubernetes: Pods, Deployments, Services, and Replicasets.",
        level: "Beginner",
        estTimeMin: 45,
        labCount: 5,
    },
    {
        id: 2,
        emoji: "🌐",
        title: "Networking",
        shortTitle: "Networking",
        description: "Master ClusterIP, NodePort, LoadBalancers, Ingress controllers, and NetworkPolicies.",
        level: "Intermediate",
        estTimeMin: 45,
        labCount: 4,
    },
    {
        id: 3,
        emoji: "💾",
        title: "Storage",
        shortTitle: "Storage",
        description: "Understand Volumes, PersistentVolumes (PV), PersistentVolumeClaims (PVC), and StorageClasses.",
        level: "Intermediate",
        estTimeMin: 30,
        labCount: 3,
    },
    {
        id: 4,
        emoji: "🛡️",
        title: "Security & RBAC",
        shortTitle: "Security",
        description: "Secure your cluster with Roles, RoleBindings, ServiceAccounts, and SecurityContexts.",
        level: "Advanced",
        estTimeMin: 45,
        labCount: 4,
    },
    {
        id: 5,
        emoji: "⚙️",
        title: "Advanced Control",
        shortTitle: "Advanced",
        description: "Go beyond Deployments with DaemonSets, Jobs, CronJobs, Affinity, and Taints/Tolerations.",
        level: "Advanced",
        estTimeMin: 45,
        labCount: 4,
    },
    {
        id: 6,
        emoji: "⚓",
        title: "Helm Fundamentals",
        shortTitle: "Helm",
        description: "Learn the Kubernetes package manager. Master Helm charts, templates, and release management.",
        level: "Intermediate",
        estTimeMin: 40,
        labCount: 5,
    },
];

export const MODULE_LAB_COUNTS = MODULES.map(m => m.labCount);

export function getModule(id) {
    return MODULES.find(m => m.id === id);
}
