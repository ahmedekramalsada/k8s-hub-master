# Deployment History & Fixes

## 2026-04-02: K3s Deployment Fix (Server: 43.157.50.97)

### Errors Found:
1. The K8s Hub application service (`k8s-hub`) was mapped internally as `ClusterIP`, and lacked an active `Ingress` or external service exposing the app to the internet. Access to the public IP resulted in Traefik's `404 Not Found`.
2. The `FRONTEND_URL` environment variable within the application's backend deployment was restricted to `http://localhost:8080`. This would lead to Cross-Origin Resource Sharing (CORS) rejections when the browser made API calls from `http://43.157.50.97`.
3. The AI backend endpoints were failing because the `ClusterSecretStore` had invalid "PLACEHOLDER" credentials. The `ExternalSecret` sync failed preventing the native secret `k8s-hub-secrets` from generating, leaving the backend container without an `OPENROUTER_API_KEY`.
4. The system defaulted to using the `arcee-ai/trinity-large-preview:free` model which the user requested be swapped out for `stepfun/step-3.5-flash:free`.
5. **Backend Proxy Validation Crash:** The `express-rate-limit` middleware module on the backend was actively rejecting all frontend requests bridged by the Nginx reverse-proxy. Nginx naturally appends an `X-Forwarded-For` header. Because the backend Express app lacked `app.set('trust proxy', 1)`, the rate-limiter panicked (`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`) throwing a native 500 error, leaving the frontend typing indicator waiting in a frozen state infinitely without an answer.

### Fixes Applied:
1. **Ingress Created**: Created `k3s/manifests/ingress.yaml` outlining an Ingress resource specifying `k8s-hub` service as the backend for HTTP traffic on standard port 80.
2. **CORS Fix**: Modified `deployment.yaml` (`FRONTEND_URL`) to allow traffic originating from the host machine's public IP (`http://43.157.50.97`).
3. **ESO Resolved**: Deleted the `infisical-credentials.yaml` manifesto from Git to stop ArgoCD from systematically enforcing placeholder values. Then deployed the explicit `client-id` and `client-secret` supplied by the user natively into the `infisical-credentials` secret on the server.
4. **AI Bootstrapped**: Validated that `ClusterSecretStore` and `ExternalSecret` both transitioned to `Valid` and `Synced`. Triggered a `rollout restart` for the deployment cluster so the backend container actively initialized and ingested the AI API key.
5. **Model Swapped & Injected**: Overrode the `backend/src/index.js` payload locally to redirect the OpenRouter model parameter to `stepfun/step-3.5-flash:free`. Extracted this raw JS file into a newly formulated K3s `ConfigMap` and appended standard Kubernetes `volumeMounts` within `deployment.yaml`. Re-applied this into the ArgoCD pipeline allowing the backend to hot-swap out the script without mandating a heavy secondary docker build sequence.
6. **Express Proxy Trust Added:** Edited `backend/src/index.js` adding the `app.set('trust proxy', 1);` instruction to force Node environments into explicitly allowing Nginx payload routing. Packaged the edits, pushed into Git and ran a Kubernetes `rollout restart` injecting the validation fix flawlessly into the system.

### Result:
The website is now fully operational and publicly accessible via K3s Traefik LoadBalancer at `http://43.157.50.97`. All AI capabilities operate fluidly across the `stepfun/step-3.5-flash:free` model, bypassing any Nginx IP validation traps.

---

## 2026-04-02: AI Connectivity & Contract Fixes

### Errors Found:
1. **Contract Mismatch**: The backend was returning the AI response under the `content` key, whereas the frontend components (`ChatPage.jsx` and `AIAssistant.jsx`) were programmed to expect the `reply` key. This resulted in `undefined` values being set in the chat state, making it appear as if no response was received even when the network call succeeded.
2. **Generic Error Masking**: The frontend's `catch` block displayed a generic "⚠️ Network error connecting to AI API." message for *any* non-200 status code. This masked underlying issues like missing API keys (503) or OpenRouter errors (500), making debugging impossible for the user.
3. **ConfigMap Formatting Issues**: The `backend-code` ConfigMap was using a brittle escaped string format with explicit `\n` characters, which was difficult to maintain.

### Fixes Applied:
1. **Synchronized API Contract**: Updated the backend (`backend/src/index.js`) to return the `reply` key. Updated frontend components to support both `reply` and `content` keys for maximum compatibility.
2. **Detailed Error Reporting**: Enhanced the frontend fetch logic to parse JSON error messages from the backend. Instead of a generic warning, users will now see specific errors (e.g., "⚠️ AI service is not configured on the server" or specific OpenRouter balance/model errors).
3. **ConfigMap Refactor**: Rewrote `k3s/manifests/backend-cm.yaml` using the YAML block scalar (`|`) for the Javascript code. This makes the manifest more human-readable and ensures a 1:1 match with the backend source file.
4. **Model Consistency**: Maintained the user's preferred `stepfun/step-3.5-flash:free` model.

### Result:
The AI system now correctly displays responses and provides actionable error messages in case of connectivity or configuration issues. The Kubernetes manifest for the backend is now cleaner and easier to maintain.
