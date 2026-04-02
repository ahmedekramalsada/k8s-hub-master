import React from 'react';
import QuizRenderer from '../../../components/QuizRenderer.jsx';

export default function QuizContent() {
    const questions = [
        {
            text: "What happens to the data in an `emptyDir` volume when the Pod that uses it is deleted?",
            options: [
                "It is moved to a PersistentVolume.",
                "It remains on the node indefinitely.",
                "It is permanently deleted.",
                "It is backed up to etcd."
            ],
            correctIndex: 2,
            explanation: "An `emptyDir` volume's lifecycle is tied to the Pod. When the Pod is deleted (or evicted), the emptyDir volume is wiped permanently."
        },
        {
            text: "In the Kubernetes storage architecture, what does a developer create to request storage?",
            options: [
                "A PersistentVolume (PV)",
                "A StorageClass (SC)",
                "A PersistentVolumeClaim (PVC)",
                "A Container Storage Interface (CSI)"
            ],
            correctIndex: 2,
            explanation: "Developers create PVCs to request specific storage capacity and access modes. Administrators (or automated StorageClasses) provision the actual PVs to satisfy those claims."
        },
        {
            text: "Which configuration automatically provisions cloud storage (like AWS EBS or GCP Persistent Disk) when a user creates a PVC?",
            options: [
                "DaemonSet",
                "StorageClass",
                "hostPath",
                "ConfigMap volumes"
            ],
            correctIndex: 1,
            explanation: "A StorageClass contains provisioner details (e.g., kubernetes.io/aws-ebs). When a PVC requests a specific StorageClass, the cluster dynamically calls the cloud provider's API to create a PV."
        },
        {
            text: "Which volume access mode allows a volume to be mounted as read-write by a SINGLE node?",
            options: [
                "ReadOnlyMany",
                "ReadWriteMany",
                "ReadWriteOnce",
                "ReadWriteOncePod"
            ],
            correctIndex: 2,
            explanation: "ReadWriteOnce (RWO) ensures the volume can only be mounted as read-write by one specific node in the cluster. Most block storage cloud disks only support RWO."
        },
        {
            text: "When a PVC is deleted, what happens to the underlying PV if the Reclaim Policy is set to `Retain`?",
            options: [
                "The PV and its data are completely destroyed.",
                "The PV is wiped clean and becomes available for a new PVC to claim.",
                "The PV is released from the claim but the volume and its data remain untouched. An administrator must manually clean it up.",
                "The PV is automatically backed up."
            ],
            correctIndex: 2,
            explanation: "The `Retain` policy protects data from accidental deletion. The volume status changes to 'Released', meaning data is intact, but the PV cannot be claimed again until an admin manually scrubs it."
        },
        {
            text: "If you want a Pod to store its filesystem purely in the host node's RAM (memory), what should you use?",
            options: [
                "emptyDir.medium: Memory",
                "PersistentVolume(ReadWriteMany)",
                "hostPath",
                "StatefulSet"
            ],
            correctIndex: 0,
            explanation: "By specifying `medium: Memory` on an emptyDir volume, Kubernetes will mount a tmpfs (RAM-backed filesystem) into the Pod."
        },
        {
            text: "Why is `hostPath` generally considered a security risk and strongly discouraged in production?",
            options: [
                "It is extremely slow.",
                "It limits the size of the volume to 1GB.",
                "It allows Pods to read and modify sensitive files on the host's actual operating system.",
                "It crashes the kubelet process."
            ],
            correctIndex: 2,
            explanation: "A `hostPath` volume mounts a directory from the host node directly into the container. An attacker breaking into the container could potentially modify host binaries or steal host credentials."
        },
        {
            text: "What does CSI stand for?",
            options: [
                "Container Storage Interface",
                "Cluster Standard Infrastructure",
                "Common Storage Implementation",
                "Cloud Storage Instance"
            ],
            correctIndex: 0,
            explanation: "CSI (Container Storage Interface) is an industry-standard API. It allows different storage vendors (NetApp, Portworx, AWS, Rook/Ceph) to write plugins for Kubernetes without modifying core Kubernetes code (in-tree)."
        },
        {
            text: "When attaching a ConfigMap or Secret as a volume, how does Kubernetes deliver updates to those files when the ConfigMap is modified?",
            options: [
                "The kubelet automatically restarts the Pod.",
                "The kubelet periodically updates the files on disk, but the application must know to reload them.",
                "An event hook triggers a web request to the application.",
                "The files are completely immutable and can never be updated."
            ],
            correctIndex: 1,
            explanation: "Volume-mounted ConfigMaps are updated dynamically via symbolic links. The application inside the Pod must either poll for file changes or watch inode changes to reload its configuration."
        },
        {
            text: "When using a StatefulSet, how do you ensure each Pod instance gets its own unique persistent volume?",
            options: [
                "Using an emptyDir volume.",
                "Manually creating a PVC for each Pod.",
                "Using volumeClaimTemplates inside the StatefulSet definition.",
                "Adding a dedicated InitContainer."
            ],
            correctIndex: 2,
            explanation: "StatefulSets utilize `volumeClaimTemplates`. As each Pod replica is spawned (e.g., db-0, db-1), a unique corresponding PVC is automatically stamped out from the template."
        }
    ];
    return <QuizRenderer title="Storage & Persistence Quiz" questions={questions} nextModuleUrl="/learn/modules/3/labs" />;
}
