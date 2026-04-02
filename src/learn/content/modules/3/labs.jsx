import React from 'react';
import LabRenderer from '../../../components/LabRenderer.jsx';

export default function LabsContent() {
    const tasks = [
        {
            id: 1,
            title: "Lab 1: Create a PersistentVolumeClaim (PVC)",
            description: "Request 1Gi of storage using a PVC manifest. We will use the default StorageClass so it provisions dynamically.",
            command: "echo \"apiVersion: v1\\nkind: PersistentVolumeClaim\\nmetadata:\\n  name: my-pvc\\nspec:\\n  accessModes:\\n    - ReadWriteOnce\\n  resources:\\n    requests:\\n      storage: 1Gi\" | kubectl apply -f -",
            expectedOutput: "Run 'kubectl get pvc my-pvc'. It should show STATUS 'Pending' or 'Bound' depending on if your cluster supports delayed binding."
        },
        {
            id: 2,
            title: "Lab 2: Create a Pod to use the PVC",
            description: "Deploy an Alpine pod that mounts the PVC to '/data' and writes a file into it.",
            command: "kubectl run writer --image=alpine --restart=Never --overrides='{\"spec\":{\"volumes\":[{\"name\":\"data\",\"persistentVolumeClaim\":{\"claimName\":\"my-pvc\"}}],\"containers\":[{\"name\":\"alpine\",\"image\":\"alpine\",\"command\":[\"sh\",\"-c\",\"echo Hello Persistent World > /data/message.txt && sleep 3600\"],\"volumeMounts\":[{\"mountPath\":\"/data\",\"name\":\"data\"}]}]}}'",
            expectedOutput: "Run 'kubectl get pods' and wait for 'writer' to be Running. Run 'kubectl get pvc my-pvc' and ensure it is now 'Bound'."
        },
        {
            id: 3,
            title: "Lab 3: Verify Data was Written",
            description: "Exec into the 'writer' pod and read the file.",
            command: "kubectl exec writer -- cat /data/message.txt",
            expectedOutput: "It should print 'Hello Persistent World'."
        },
        {
            id: 4,
            title: "Lab 4: Delete the original Pod",
            description: "Delete the 'writer' pod to prove that the storage is decoupled from the pod lifecycle.",
            command: "kubectl delete pod writer",
            expectedOutput: "Run 'kubectl get pods' until it disappears. Run 'kubectl get pvc my-pvc' and note it still exists and is 'Bound'."
        },
        {
            id: 5,
            title: "Lab 5: Re-attach the Volume to a New Pod",
            description: "Create a completely new pod ('reader') that mounts the exact same PVC to '/mnt'.",
            command: "kubectl run reader --image=alpine --restart=Never --overrides='{\"spec\":{\"volumes\":[{\"name\":\"data\",\"persistentVolumeClaim\":{\"claimName\":\"my-pvc\"}}],\"containers\":[{\"name\":\"alpine\",\"image\":\"alpine\",\"command\":[\"sleep\",\"3600\"],\"volumeMounts\":[{\"mountPath\":\"/mnt\",\"name\":\"data\"}]}]}}'",
            expectedOutput: "Run 'kubectl get pods' and wait for 'reader' to be Running."
        },
        {
            id: 6,
            title: "Lab 6: Prove Persistence",
            description: "Exec into the new 'reader' pod and check if the file still exists.",
            command: "kubectl exec reader -- cat /mnt/message.txt",
            expectedOutput: "It should print 'Hello Persistent World'. You've successfully proven volume persistence across different pod lifecycles!"
        },
        {
            id: 7,
            title: "Lab 7: Clean Up",
            description: "Delete the pod and the PVC. This will automatically trigger the deletion of the underlying PersistentVolume because the default reclaim policy is 'Delete'.",
            command: "kubectl delete pod reader && kubectl delete pvc my-pvc",
            expectedOutput: "Run 'kubectl get pv,pvc' and ensure no bound volumes remain."
        }
    ];

    return (
        <LabRenderer 
            title="Hands-on Labs: Storage & Persistence"
            description="Complete the following tasks to master Persistent Volumes, Claims, and data persistence across Pod destruction."
            tasks={tasks}
        />
    );
}
