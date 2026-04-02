import React from 'react';
import QuizRenderer from '../../../components/QuizRenderer.jsx';

export default function QuizContent() {
    const questions = [
        {
            text: "What is the primary difference between a Container and a Virtual Machine?",
            options: [
                "Containers include a full Guest OS",
                "VMs share the host OS kernel",
                "Containers share the host OS kernel, VMs have a full Guest OS",
                "They are exactly the same technology"
            ],
            correctIndex: 2,
            explanation: "Containers are isolated processes that share the host kernel (using cgroups and namespaces), making them lightweight. VMs run a full operating system on top of a hypervisor."
        },
        {
            text: "Which Dockerfile instruction creates a new image layer?",
            options: [
                "Only RUN",
                "Only COPY",
                "RUN, COPY, and ADD",
                "CMD and ENTRYPOINT"
            ],
            correctIndex: 2,
            explanation: "In Docker, instructions like RUN, COPY, and ADD create new file system layers. Instructions like EXPOSE and CMD only modify image metadata."
        },
        {
            text: "Why is a multi-stage Docker build a best practice for production?",
            options: [
                "It makes the image download faster but larger.",
                "It allows you to test multiple environments simultaneously.",
                "It separates the build environment from the runtime environment, resulting in a much smaller and more secure final image.",
                "It bypasses Docker layers to speed up execution."
            ],
            correctIndex: 2,
            explanation: "Multi-stage builds allow you to compile code in a 'builder' stage, and then only copy the compiled binary to a minimal 'runtime' image. This drops all the compilers and source code from the final image."
        },
        {
            text: "What happens to the data inside a container when the container is deleted?",
            options: [
                "It is automatically backed up to Docker Hub.",
                "It remains on the host filesystem permanently.",
                "It is deleted, unless it is stored in a named volume or bind mount.",
                "It is archived in a compressed tarball."
            ],
            correctIndex: 2,
            explanation: "Containers are ephemeral. Any data written to the container's writable layer is lost when the container is removed. Volumes or bind mounts are required to persist data."
        },
        {
            text: "If you want to map port 8080 on your host machine to port 80 inside the container, what is the correct flag?",
            options: [
                "-p 80:8080",
                "-p 8080:80",
                "--expose 8080",
                "--port 8080:80"
            ],
            correctIndex: 1,
            explanation: "The -p (or --publish) flag uses the format hostPort:containerPort. So -p 8080:80 maps host 8080 to container 80."
        },
        {
            text: "Why should you copy 'package.json' and run 'npm install' BEFORE copying the rest of your source code in a Dockerfile?",
            options: [
                "To prevent circular dependency errors in Node.js.",
                "Because NPM requires package.json to be the very first file.",
                "To leverage Docker's layer caching so dependencies are only re-installed when package.json changes, not every time source code changes.",
                "It is just a stylistic choice."
            ],
            correctIndex: 2,
            explanation: "Docker caches layers. If you copy source code first (which changes often), every subsequent step cache is invalidated. Copying package.json first caches the slow 'npm install' step."
        },
        {
            text: "What does the 'docker-compose up' command do?",
            options: [
                "Uploads images to Docker Hub.",
                "Builds, (re)creates, starts, and attaches to containers for a service.",
                "Updates the Docker engine to the latest version.",
                "Scales a container across multiple worker nodes."
            ],
            correctIndex: 1,
            explanation: "docker-compose up reads the docker-compose.yml file and starts your entire multi-container environment."
        },
        {
            text: "What is the key security benefit of running a container as a non-root user?",
            options: [
                "It bypasses firewall restrictions.",
                "It makes the image size smaller.",
                "If an attacker escapes the container, they won't automatically have root privileges on the host machine.",
                "It prevents memory leaks."
            ],
            correctIndex: 2,
            explanation: "By default, the root user in a container is the root user on the host. Changing to a non-root user (USER appuser) mitigates severe host-level compromise if a container escape vulnerability is exploited."
        },
        {
            text: "What does a Docker network bridge do?",
            options: [
                "Connects Docker Hub to your local machine.",
                "Allows containers on the same host to communicate with each other by name (DNS).",
                "Connects multiple Docker hosts into a Swarm.",
                "Encrypts traffic between the container and the web."
            ],
            correctIndex: 1,
            explanation: "The bridge network provides a private internal network for containers on the same host, complete with automatic DNS resolution between container names."
        },
        {
            text: "Which of these is NOT a Linux kernel feature that Docker relies on?",
            options: [
                "Namespaces",
                "cgroups (Control Groups)",
                "Hyper-V",
                "UnionFS (overlay filesystems)"
            ],
            correctIndex: 2,
            explanation: "Hyper-V is a Microsoft Windows hypervisor for Virtual Machines. Docker relies on Linux primitives like Namespaces (isolation) and cgroups (resource limits)."
        }
    ];
    return <QuizRenderer title="Docker Fundamentals Quiz" questions={questions} nextModuleUrl="/learn/modules/0/labs" />;
}
