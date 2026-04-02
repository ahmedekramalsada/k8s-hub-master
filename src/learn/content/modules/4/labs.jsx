import React from 'react';
import LabRenderer from '../../../components/LabRenderer.jsx';

export default function LabsContent() {
    const tasks = [
        {
            id: 1,
            title: "Lab 1: Inspect Default Service Accounts",
            description: "Every namespace automatically gets a 'default' ServiceAccount. Let's look at the one in the default namespace.",
            command: "kubectl get sa default -o yaml",
            expectedOutput: "You will see a list of secrets (if using < v1.24) or just the core metadata. Notice the 'automountServiceAccountToken' is not physically visible, meaning it defaults to true."
        },
        {
            id: 2,
            title: "Lab 2: Create a Custom Service Account",
            description: "Create a ServiceAccount named 'pod-reader' that we will use to give a specific pod read-only access.",
            command: "kubectl create serviceaccount pod-reader",
            expectedOutput: "Run 'kubectl get sa' and ensure 'pod-reader' exists."
        },
        {
            id: 3,
            title: "Lab 3: Create a Role",
            description: "Create a Role named 'reader' that only allows 'get', 'watch', and 'list' on Pods.",
            command: "kubectl create role reader --verb=get,list,watch --resource=pods",
            expectedOutput: "Run 'kubectl describe role reader' and verify the Rules contain Resources `pods` and Verbs `get, list, watch`."
        },
        {
            id: 4,
            title: "Lab 4: Bind the Role to the ServiceAccount",
            description: "Use a RoleBinding to attach the 'reader' Role to your 'pod-reader' ServiceAccount.",
            command: "kubectl create rolebinding read-pods --role=reader --serviceaccount=default:pod-reader",
            expectedOutput: "Run 'kubectl describe rolebinding read-pods' and verify it maps the 'reader' Role to 'ServiceAccount pod-reader'."
        },
        {
            id: 5,
            title: "Lab 5: Test the ServiceAccount Authorization",
            description: "Use the `auth can-i` command while impersonating the ServiceAccount to verify it works.",
            command: "kubectl auth can-i list pods --as=system:serviceaccount:default:pod-reader",
            expectedOutput: "It should return 'yes'. This proves the RBAC rules are correctly wired."
        },
        {
            id: 6,
            title: "Lab 6: Verify Least Privilege",
            description: "Test if the ServiceAccount can delete pods. It shouldn't be able to.",
            command: "kubectl auth can-i delete pods --as=system:serviceaccount:default:pod-reader",
            expectedOutput: "It should return 'no'. (If it returns yes, your cluster rolebindings are misconfigured!)"
        },
        {
            id: 7,
            title: "Lab 7: Generate a Base64 Secret",
            description: "Before creating a generic secret manually via YAML, you must base64 encode the values.",
            command: "echo -n 'superSecretPassword123' | base64",
            expectedOutput: "It will output 'c3VwZXJTZWNyZXRQYXNzd29yZDEyMw=='. (The -n flag prevents an extra newline from ruining the password)."
        },
        {
            id: 8,
            title: "Lab 8: Clean Up",
            description: "Delete the RBAC resources.",
            command: "kubectl delete rolebinding read-pods && kubectl delete role reader && kubectl delete sa pod-reader",
            expectedOutput: "Run 'kubectl get sa,role,rolebinding' to ensure cleanup."
        }
    ];

    return (
        <LabRenderer 
            title="Hands-on Labs: Security & RBAC"
            description="Complete the following tasks to master ServiceAccounts, Roles, RoleBindings, and Kubernetes authorization checks."
            tasks={tasks}
        />
    );
}
