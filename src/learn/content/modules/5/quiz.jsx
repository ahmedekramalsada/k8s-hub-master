import React from 'react';
import QuizRenderer from '../../../components/QuizRenderer.jsx';

export default function QuizContent() {
    const questions = [
        {
            text: "What is the primary difference between a Deployment and a StatefulSet?",
            options: [
                "Deployments scale horizontally; StatefulSets only scale vertically.",
                "Pods in a Deployment get random generated names; Pods in a StatefulSet get predictable, sticky, ordered names (like web-0, web-1) and stable storage.",
                "StatefulSets only run one replica; Deployments can run many.",
                "StatefulSets run exclusively on the control plane."
            ],
            correctIndex: 1,
            explanation: "Deployments treat identical Pods as disposable cattle, while StatefulSets treat Pods as irreplaceable pets—providing them with persistent hostnames, sticky network IDs, and dedicated PVs."
        },
        {
            text: "When creating a StatefulSet with 3 replicas, how are the Pods rolled out (started) by default?",
            options: [
                "All at the exact same time to ensure high availability.",
                "Alphabetically based on their label.",
                "Strictly sequential: Pod-0 must become Running & Ready before Pod-1 starts, followed by Pod-2.",
                "Randomly chosen by the kube-scheduler."
            ],
            correctIndex: 2,
            explanation: "StatefulSets employ ordered, graceful deployment and scaling. This ensures databases and clustered tools have time to properly join quorums."
        },
        {
            text: "Which controller ensures that exactly ONE copy of a specific Pod runs on every single worker node in a cluster?",
            options: [
                "Deployment with `replicas: all`",
                "StatefulSet",
                "DaemonSet",
                "ReplicaSet"
            ],
            correctIndex: 2,
            explanation: "DaemonSets guarantee that all (or some subset) of Nodes run a copy of a Pod. This is specifically used for cluster-wide infrastructure tasks like log collection (fluentd) or networking plugins (kube-proxy)."
        },
        {
            text: "What distinguishes a Job from a CronJob?",
            options: [
                "A Job creates a Deployment; a CronJob scales it.",
                "A Job is an infrastructure pod; a CronJob is a user pod.",
                "A Job executes a task to completion one time; a CronJob creates Jobs automatically on a repeating schedule.",
                "There is no difference, 'CronJob' is just an alias."
            ],
            correctIndex: 2,
            explanation: "A Job manages Pods that run a specific script or computation until complete (exit 0). A CronJob simply creates these Job objects continuously according to a cron timetable (e.g., '0 0 * * *')."
        },
        {
            text: "In a Job configuration, if you want exactly 5 different Pods to successfully complete before the Job is marked finished, which property do you set?",
            options: [
                "replicas: 5",
                "parallelism: 5",
                "completions: 5",
                "restartPolicy: Always"
            ],
            correctIndex: 2,
            explanation: "`completions: 5` specifies how many successful pod terminations are required. `parallelism` determines how many of those 5 pods can run at the same time."
        },
        {
            text: "What happens if a Pod finishes execution but the Job's `backoffLimit` (e.g., set to 4) is exceeded by failures (exit code != 0)?",
            options: [
                "The Job controller halts the execution and considers the overall Job failed.",
                "It immediately deletes all existing Pods.",
                "It switches to run a different Docker image.",
                "It restarts the kubelet on the node."
            ],
            correctIndex: 0,
            explanation: "The `backoffLimit` is the number of retries before a Job is marked as entirely Failed. By default, Kubernetes will retry a failing pod on longer and longer delays."
        },
        {
            text: "Which component is necessary in your cluster to make the Horizontal Pod Autoscaler (HPA) function properly?",
            options: [
                "The Istio Service Mesh.",
                "The Kubernetes Dashboard.",
                "The Metrics Server.",
                "An NGINX Ingress Controller."
            ],
            correctIndex: 2,
            explanation: "HPA fetches current resource utilization graphs (CPU/Memory). To supply these graphs, your cluster must have the Metrics Server installed, otherwise the HPA will show 'unknown' metrics."
        },
        {
            text: "If an HPA scales up replicas based on high CPU usage, what component scales them back down when traffic subsides?",
            options: [
                "The Vertical Pod Autoscaler.",
                "The Cluster Autoscaler.",
                "The HPA itself.",
                "An external monitoring tool like Prometheus."
            ],
            correctIndex: 2,
            explanation: "The HPA continuously evaluates metrics against its target thresholds. If utilization falls below the target (after a stabilization window to prevent flapping), the HPA automatically reduces the `replicas` count."
        },
        {
            text: "What is an InitContainer?",
            options: [
                "The first container pulled down to the node during pod initialization.",
                "A sidecar that logs application outputs.",
                "A special container that runs entirely to completion BEFORE the main app containers start.",
                "A container solely responsible for health checks."
            ],
            correctIndex: 2,
            explanation: "InitContainers run scripts or setup tasks (like waiting for a database to become online or downloading specific configuration files) strictly before the application container(s) boot up."
        },
        {
            text: "What is a 'Headless Service' and why are they used with StatefulSets?",
            options: [
                "A Service without an IP address (`clusterIP: None`); it returns DNS A records for individual Pods so clients can connect to them directly.",
                "A Service that has no selector and routes nowhere.",
                "A Service without a named port.",
                "A Service exclusively routing to external externalNames."
            ],
            correctIndex: 0,
            explanation: "A Headless Service doesn't load-balance. Instead, querying its DNS gives you the IPs of all backing Pods. This is critical for clustered applications (like Cassandra or MongoDB) where peers need to discover and speak directly to each other."
        }
    ];
    return <QuizRenderer title="Advanced Workloads Quiz" questions={questions} nextModuleUrl="/learn/modules/5/labs" />;
}
