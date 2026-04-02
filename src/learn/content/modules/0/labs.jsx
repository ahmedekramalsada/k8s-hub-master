import React from 'react';
import LabRenderer from '../../../components/LabRenderer.jsx';

export default function LabsContent() {
    const tasks = [
        {
            id: 1,
            title: "Lab 1: Pull and Inspect an Image",
            description: "Download the official NGINX alpine image from Docker Hub and inspect its metadata.",
            command: "docker pull nginx:alpine && docker inspect nginx:alpine",
            expectedOutput: "Look for the 'Cmd' field in the JSON output, which should show [\"nginx\", \"-g\", \"daemon off;\"]"
        },
        {
            id: 2,
            title: "Lab 2: Run a Background Container",
            description: "Run NGINX in detached mode (-d), mapping host port 8080 to container port 80.",
            command: "docker run -d -p 8080:80 --name my-web nginx:alpine",
            expectedOutput: "Run 'curl localhost:8080' to see the 'Welcome to nginx!' HTML page."
        },
        {
            id: 3,
            title: "Lab 3: View Container Logs",
            description: "Check the real-time access logs of the container you just started to verify your curl worked.",
            command: "docker logs my-web",
            expectedOutput: "You should see a log entry showing a GET request to '/' with a 200 OK status."
        },
        {
            id: 4,
            title: "Lab 4: Interactive Shell",
            description: "Open an interactive shell inside your running NGINX container to explore its filesystem.",
            command: "docker exec -it my-web sh",
            expectedOutput: "Your terminal prompt will change. Run 'ls /usr/share/nginx/html' to see the index.html file. Then type 'exit'."
        },
        {
            id: 5,
            title: "Lab 5: Create a Custom Dockerfile",
            description: "Create a directory, write a simple index.html, and a Dockerfile to serve it.",
            command: "mkdir custom-nginx && cd custom-nginx && echo '<h1>Hello from Docker!</h1>' > index.html && echo -e 'FROM nginx:alpine\\nCOPY index.html /usr/share/nginx/html/' > Dockerfile",
            expectedOutput: "Run 'cat Dockerfile' to verify it uses the busybox/alpine nginx and copies your HTML."
        },
        {
            id: 6,
            title: "Lab 6: Build the Custom Image",
            description: "Build the image from your newly created Dockerfile and tag it.",
            command: "docker build -t custom-web:v1 .",
            expectedOutput: "Output will show Docker pulling the base image and executing the COPY instruction."
        },
        {
            id: 7,
            title: "Lab 7: Run and Verify Custom Image",
            description: "Run your new image on port 8081 and test it.",
            command: "docker run -d -p 8081:80 --name my-custom-web custom-web:v1 && curl localhost:8081",
            expectedOutput: "Curl should return '<h1>Hello from Docker!</h1>'."
        },
        {
            id: 8,
            title: "Lab 8: Clean Up",
            description: "Stop and remove all the containers you created.",
            command: "docker rm -f my-web my-custom-web",
            expectedOutput: "Run 'docker ps' and verify the list is empty."
        }
    ];

    return (
        <LabRenderer 
            title="Hands-on Labs: Docker Fundamentals"
            description="Complete the following tasks to master Docker container lifecycles, file mounts, and image building."
            tasks={tasks}
        />
    );
}
