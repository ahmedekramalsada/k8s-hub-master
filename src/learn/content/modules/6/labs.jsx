import React from 'react';
import LabRenderer from '../../../components/LabRenderer.jsx';

export default function LabsContent() {
    const tasks = [
        {
            id: 1,
            title: "Lab 1: Add a Helm Repository",
            description: "Add the official Bitnami repository so we can download production-ready charts.",
            command: "helm repo add bitnami https://charts.bitnami.com/bitnami && helm repo update",
            expectedOutput: "You should see '\"bitnami\" has been added to your repositories' and 'Successfully got an update from the \"bitnami\" chart repository'."
        },
        {
            id: 2,
            title: "Lab 2: Search for a Chart",
            description: "Search the Bitnami repository to find the PostgreSQL chart.",
            command: "helm search repo bitnami/postgresql",
            expectedOutput: "It will return a table with NAME, CHART VERSION, APP VERSION, and DESCRIPTION of postgresql charts."
        },
        {
            id: 3,
            title: "Lab 3: Install a Release",
            description: "Install a PostgreSQL database into your cluster. (Don't use Bitnami for this test unless you want heavy downloads, let's use a simpler one next). Actually, let's just fetch the chart without installing to see the structure.",
            command: "helm pull bitnami/postgresql --untar",
            expectedOutput: "Run 'ls postgresql'. You will see Chart.yaml, values.yaml, and a templates/ directory."
        },
        {
            id: 4,
            title: "Lab 4: View the Default Config",
            description: "Open the default values file to see what settings are available.",
            command: "cat postgresql/values.yaml | head -n 20",
            expectedOutput: "You'll see YAML parameters like 'image', 'auth', 'architecture', etc."
        },
        {
            id: 5,
            title: "Lab 5: Template Generation",
            description: "Instead of installing to the cluster, generate the dry-run YAML manifests locally to see exactly what Helm would deploy.",
            command: "helm template my-db ./postgresql > all-manifests.yaml",
            expectedOutput: "Run 'cat all-manifests.yaml | grep kind:' to see the huge list of StatefulSets, Secrets, and Services it generated."
        },
        {
            id: 6,
            title: "Lab 6: Kustomize Base Creation",
            description: "Kustomize works differently. Let's create a kustomization.yaml file that patches an external config map.",
            command: "mkdir -p kustomize-demo && cd kustomize-demo && echo -e \"resources:\\n  - service.yaml\\nnamePrefix: dev-\" > kustomization.yaml && echo -e \"kind: Service\\napiVersion: v1\\nmetadata:\\n  name: my-app\\nspec:\\n  ports:\\n    - port: 80\" > service.yaml",
            expectedOutput: "Run 'cat kustomization.yaml' and 'cat service.yaml' to ensure files are present."
        },
        {
            id: 7,
            title: "Lab 7: Kustomize Build",
            description: "Build the Kustomize directory without applying it, to verify the namePrefix mutation worked.",
            command: "kubectl kustomize ./kustomize-demo",
            expectedOutput: "You should see the Service printed, but its metadata.name will be 'dev-my-app' instead of 'my-app'!"
        },
        {
            id: 8,
            title: "Lab 8: Clean Up",
            description: "Remove the directories and files you downloaded.",
            command: "rm -rf postgresql all-manifests.yaml kustomize-demo",
            expectedOutput: "Run 'ls' and verify the folders are gone."
        }
    ];

    return (
        <LabRenderer 
            title="Hands-on Labs: Helm & Kustomize"
            description="Complete the following tasks to master Package Management, repos, dry-runs, and Kustomize overlays."
            tasks={tasks}
        />
    );
}
