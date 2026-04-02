/**
 * shared-scripts.js
 * 
 * Core interactive logic for the K8s.Learn platform.
 * Supports the 3-pane Glassmorphism Layout (Navigation, Content, AI Tutor).
 */

// -----------------------------------------------------------------------------
// User Isolation - ensures each browser user gets their own localStorage keys
// -----------------------------------------------------------------------------
function getUserId() {
    const cookieName = 'k8s-learn-sid';
    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
    if (match) return match[2];
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    document.cookie = `${cookieName}=${uuid};path=/;max-age=${60 * 60 * 24 * 365}`;
    return uuid;
}

// -----------------------------------------------------------------------------
// Initialization & Global State
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initProgressData();
    initUI();
    initNotesUI();
    buildSearchIndex();

    // Check backend health on page load
    checkBackendHealth(true);

    // Periodic health check every 30 seconds
    setInterval(() => checkBackendHealth(false), 30000);

    // Auto-update dashboard if we are on index.html
    if (window.CURRENT_MODULE === 'dashboard') {
        updateDashboardUI();
    } else {
        updateModuleProgressUI();
        initTabSystem();
        if (window.QUIZ_DATA) initQuiz();
    }
});

// -----------------------------------------------------------------------------
// Progress Tracking
// -----------------------------------------------------------------------------
function initProgressData() {
    let data = localStorage.getItem(`${getUserId()}-k8s-progress`);
    let parsed = null;
    try {
        if (data) parsed = JSON.parse(data);
    } catch (e) { }

    // Check if valid new format
    if (!parsed || !parsed.modules) {
        parsed = {
            modules: {
                0: { completed: [], score: 0 },
                1: { completed: [], score: 0 },
                2: { completed: [], score: 0 },
                3: { completed: [], score: 0 },
                4: { completed: [], score: 0 },
                5: { completed: [], score: 0 },
                6: { completed: [], score: 0 }
            }
        };
        localStorage.setItem(`${getUserId()}-k8s-progress`, JSON.stringify(parsed));
    }
}

function getProgress() {
    let data = localStorage.getItem(`${getUserId()}-k8s-progress`);
    let parsed = null;
    try {
        if (data) parsed = JSON.parse(data);
    } catch (e) { }

    if (!parsed || !parsed.modules) {
        initProgressData();
        parsed = JSON.parse(localStorage.getItem(`${getUserId()}-k8s-progress`));
    }
    return parsed;
}

function saveProgress(data) {
    localStorage.setItem(`${getUserId()}-k8s-progress`, JSON.stringify(data));
    updateGlobalNavProgress(); // Always update sidebar when saved
}

function toggleLabComplete(labNum, checkboxEl, itemEl) {
    if (!window.CURRENT_MODULE) return;

    const data = getProgress();
    const modData = data.modules[window.CURRENT_MODULE];

    const index = modData.completed.indexOf(labNum);
    if (index === -1) {
        modData.completed.push(labNum);
        itemEl.classList.add('completed');
    } else {
        modData.completed.splice(index, 1);
        itemEl.classList.remove('completed');
    }

    saveProgress(data);
    updateModuleProgressUI();
}

function updateModuleProgressUI() {
    if (!window.CURRENT_MODULE) return;

    const data = getProgress();
    const modData = data.modules[window.CURRENT_MODULE];

    // Update local checkboxes
    for (let i = 1; i <= window.NUM_LABS; i++) {
        const item = document.getElementById(`lab-item-${i}`);
        if (item) {
            if (modData.completed.includes(i)) item.classList.add('completed');
            else item.classList.remove('completed');
        }
    }
}

function updateGlobalNavProgress() {
    const data = getProgress();
    const counts = window.MODULE_LAB_COUNTS || [6, 5, 4, 3, 4, 4, 5]; // fallback

    let totalCompleted = 0;
    let totalLabs = 0;

    for (let i = 0; i <= 6; i++) {
        const labs = counts[i];
        totalLabs += labs;

        const comp = data.modules[i] ? data.modules[i].completed.length : 0;
        totalCompleted += comp;

        // Update Side nav badge
        const badge = document.getElementById(`nav-prog-${i}`);
        if (badge) badge.textContent = `${comp}/${labs}`;
    }

    const pct = Math.round((totalCompleted / totalLabs) * 100);
    const globalBar = document.getElementById('global-bar');
    const globalPct = document.getElementById('global-pct');

    if (globalBar) globalBar.style.width = `${pct}%`;
    if (globalPct) globalPct.textContent = `${pct}%`;
}


function updateDashboardUI() {
    const data = getProgress();
    const counts = window.MODULE_LAB_COUNTS || [6, 5, 4, 3, 4, 4, 5];

    let totalCompleted = 0;
    let totalLabs = 0;

    for (let i = 0; i <= 6; i++) {
        const labs = counts[i];
        totalLabs += labs;

        const comp = data.modules[i] ? data.modules[i].completed.length : 0;
        totalCompleted += comp;

        const score = data.modules[i] ? data.modules[i].score : 0;

        // Update Center Cards
        const cardProg = document.getElementById(`card-prog-${i}`);
        const cardQuiz = document.getElementById(`card-quiz-${i}`);

        if (cardProg) cardProg.textContent = `${comp}/${labs} Labs`;
        if (cardQuiz) {
            if (score > 0) cardQuiz.textContent = `Quiz: ${score}%`;
            else cardQuiz.textContent = `Quiz: --`;
        }
    }

    const pct = Math.round((totalCompleted / totalLabs) * 100);
    const globalBar = document.getElementById('global-bar');
    const globalPct = document.getElementById('global-pct');

    if (globalBar) globalBar.style.width = `${pct}%`;
    if (globalPct) globalPct.textContent = `${pct}%`;
}



// -----------------------------------------------------------------------------
// UI Initializations & Interactions
// -----------------------------------------------------------------------------
function initUI() {
    updateGlobalNavProgress();

    // Setup terminal input enter key
    const termInput = document.getElementById('terminal-input');
    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') executeTerminalCommand();
        });
    }

    // Setup Chat input enter key
    const chatIn = document.getElementById('chat-in');
    if (chatIn) {
        chatIn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAIMessage();
            }
        });

        // Auto-resize textarea
        chatIn.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if (this.value === '') this.style.height = 'auto';
        });
    }

    // Global keyboard listener
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts if typing in input/textarea
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
            if (e.key === 'Escape') {
                document.activeElement.blur();
                closeModals();
            }
            return;
        }

        if (e.key === 't' || e.key === 'T') { e.preventDefault(); toggleTerminal(); }
        else if (e.key === 's' || e.key === 'S') { e.preventDefault(); openSearch(); }
        else if (e.key === '?') { e.preventDefault(); showShortcutsModal(); }
        else if (e.key === 'Escape') closeModals();

        handleTabShortcuts(e);
    });
}

function closeModals() {
    closeSearch();
    closeShortcutsModal();
    closeNotesModal();
    closeFlashcards();
}

function toggleTerminal() {
    const dock = document.getElementById('terminal-panel');
    const input = document.getElementById('terminal-input');
    const icon = document.getElementById('term-toggle-icon');

    if (!dock) return;

    if (dock.classList.contains('minimized')) {
        dock.classList.remove('minimized');
        dock.classList.add('expanded');
        if (icon) icon.textContent = '▼';
        if (input) setTimeout(() => input.focus(), 300);
    } else {
        dock.classList.remove('expanded');
        dock.classList.add('minimized');
        if (icon) icon.textContent = '▲';
    }
}


function copyCode(btn) {
    const block = btn.closest('.code-window');
    const pre = block.querySelector('pre');
    navigator.clipboard.writeText(pre.innerText).then(() => {
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => btn.innerText = originalText, 2000);
    });
}

// -----------------------------------------------------------------------------
// Tab System
// -----------------------------------------------------------------------------
function setTab(tabName) {
    if (window.CURRENT_MODULE === undefined || window.CURRENT_MODULE === null || window.CURRENT_MODULE === 'dashboard') return;
    window.location.href = `/modules/${window.CURRENT_MODULE}/${tabName}`;
}

function initTabSystem() {
    // We can rely on Astro to set the active class, so we don't strictly need this JS anymore.
    // Kept empty to prevent older references from crashing.
}

// Add to global keyboard listener
function handleTabShortcuts(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    const key = e.key;
    if (key >= '1' && key <= '7') {
        const tabNames = ['theory', 'labs', 'quiz', 'answers', 'cheat', 'tips', 'scenarios'];
        const index = parseInt(key) - 1;
        if (tabNames[index]) setTab(tabNames[index]);
    }
}

// -----------------------------------------------------------------------------
// Celebration Modal
// -----------------------------------------------------------------------------
function showCelebrationModal() {
    let modal = document.getElementById('celebration-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'celebration-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal glass-panel" style="text-align: center; max-width: 400px;">
                <div class="modal-header" style="justify-content: center; border-bottom: none;">
                    <h2 style="font-size: 2rem;">🎉 Congratulations! 🎉</h2>
                </div>
                <div class="modal-body">
                    <p style="font-size: 1.1rem; margin-bottom: 24px;">You have successfully completed ${window.MODULE_NAME || 'this module'}. You're one step closer to mastering Kubernetes!</p>
                    <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="document.getElementById('celebration-modal').style.display = 'none'">Awesome!</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';

    // Add confetti effect
    createConfetti();
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.backgroundColor = ['var(--brand-primary)', 'var(--brand-purple)', 'var(--brand-green)', 'var(--brand-warning)', 'var(--brand-cyan)'][Math.floor(Math.random() * 5)];
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
    }
}

// -----------------------------------------------------------------------------
// Terminal Engine
// -----------------------------------------------------------------------------
const K8S_MOCK_DATA = { /* ... keep mock data from previous version */ };

function appendTerminalLine(text, type = '') {
    const output = document.getElementById('terminal-output');
    if (!output) return;
    const div = document.createElement('div');
    div.className = `term-output ${type}`;
    div.textContent = text;

    // Insert before the input line
    const inputLine = output.querySelector('.term-input-line');
    output.insertBefore(div, inputLine);
    output.scrollTop = output.scrollHeight;
}

function clearTerminal() {
    const output = document.getElementById('terminal-output');
    if (!output) return;
    const lines = output.querySelectorAll('.term-output');
    lines.forEach(l => l.remove());
}

function executeTerminalCommand() {
    const inputEl = document.getElementById('terminal-input');
    const dock = document.getElementById('terminal-panel');

    if (!inputEl) return;
    const cmd = inputEl.value.trim();
    if (!cmd) return;

    // Expand if minimized
    if (dock && dock.classList.contains('minimized')) {
        toggleTerminal();
    }

    appendTerminalLine(`root@k8s-master:~# ${cmd}`);
    inputEl.value = '';

    if (cmd === 'clear') {
        clearTerminal();
        return;
    }
    if (cmd === 'help') {
        appendTerminalLine('Available simulated commands:\n- clear\n- kubectl get [pods|deployments|services|nodes|all]\n- kubectl describe pod <name>');
        return;
    }

    if (cmd.startsWith('kubectl ')) {
        const result = parseKubectlCommand(cmd);
        appendTerminalLine(result, result.includes('Error') ? 'error' : 'success');
    } else {
        appendTerminalLine(`bash: ${cmd.split(' ')[0]}: command not found`, 'error');
    }
}

function parseKubectlCommand(cmd) {
    const parts = cmd.split(' ').filter(p => p !== '');
    if (parts[1] === 'get') {
        if (!parts[2]) return 'error: You must specify the type of resource to get.';
        return simulateGet(parts[2]);
    }
    if (parts[1] === 'describe') {
        return `Name:         fake-pod\nNamespace:    default\nStatus:       Running\nNode:         k8s-worker-1/192.168.1.10\nEvents:       <none>`;
    }
    return `error: unknown command "${parts[1]}" for "kubectl"`;
}

function simulateGet(resource) {
    const r = resource.toLowerCase();
    if (r === 'pods' || r === 'po') return "NAME                                READY   STATUS    RESTARTS   AGE\nnginx-deployment-75b59d897f-449x1   1/1     Running   0          5m\nnginx-deployment-75b59d897f-8zz8s   1/1     Running   0          5m\nnginx-deployment-75b59d897f-kg2b2   1/1     Running   0          5m";
    if (r === 'deployments' || r === 'deploy') return "NAME               READY   UP-TO-DATE   AVAILABLE   AGE\nnginx-deployment   3/3     3            3           5m";
    if (r === 'services' || r === 'svc') return "NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE\nkubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   10d";
    if (r === 'nodes' || r === 'no') return "NAME           STATUS   ROLES           AGE   VERSION\nk8s-master     Ready    control-plane   10d   v1.28.2\nk8s-worker-1   Ready    <none>          10d   v1.28.2\nk8s-worker-2   Ready    <none>          10d   v1.28.2";
    if (r === 'all') return [simulateGet('pods'), '\n', simulateGet('deployments'), '\n', simulateGet('services')].join('');

    return `No resources found in default namespace.`;
}


// -----------------------------------------------------------------------------
// AI Tutor Engine
// -----------------------------------------------------------------------------
let chatHistory = [];        // Multi-turn conversation memory
let activeModuleCtxId = null; // Currently selected module context
let backendHealthy = false;  // Connection status

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 500; // ms

async function pingBackend() {
    try {
        const apiUrl = (window.AI_CONFIG && window.AI_CONFIG.apiUrl) ? window.AI_CONFIG.apiUrl : '/api';
        const response = await fetch(`${apiUrl}/health`, { method: 'GET', cache: 'no-store' });
        return response.ok;
    } catch (e) {
        return false;
    }
}

function updateConnectionStatus(healthy) {
    backendHealthy = healthy;
    const indicator = document.getElementById('connection-indicator');
    if (indicator) {
        indicator.style.background = healthy ? 'var(--brand-green)' : 'var(--brand-danger)';
        indicator.title = healthy ? 'Connected to AI backend' : 'Disconnected from AI backend';
    }
}

async function checkBackendHealth(showMessage = false) {
    const healthy = await pingBackend();
    updateConnectionStatus(healthy);
    if (showMessage && !healthy) {
        appendChatMessage('<b>⚠️ Backend is unreachable.</b> Please check your connection or try again later.', 'msg-ai');
    }
    return healthy;
}

async function sendAIMessageWithRetry(apiUrl, body, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(`${apiUrl}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (attempt === retries - 1) throw error; // Last attempt, rethrow
            const delay = INITIAL_DELAY * Math.pow(2, attempt); // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function sendAIMessage() {
    const input = document.getElementById('chat-in');
    const msg = input.value.trim();
    if (!msg) return;

    appendChatMessage(msg, 'msg-user');
    chatHistory.push({ role: 'user', content: msg });
    input.value = '';
    input.style.height = 'auto';

    try {
        appendChatMessage('...', 'msg-ai', true);

        // Check backend health first
        const apiUrl = (window.AI_CONFIG && window.AI_CONFIG.apiUrl) ? window.AI_CONFIG.apiUrl : '/api';
        const isHealthy = await checkBackendHealth();
        if (!isHealthy) {
            removeLoadingIndicator();
            appendChatMessage('<b>❌ Backend is not responding.</b> Please wait a moment and try again.', 'msg-ai');
            return;
        }

        const data = await sendAIMessageWithRetry(apiUrl, {
            messages: [
                { role: 'system', content: buildSystemPrompt() },
                ...chatHistory.slice(-10) // last 10 turns for context window
            ]
        });

        const reply = data.content;
        removeLoadingIndicator();
        appendChatMessage(formatAIResponse(reply), 'msg-ai');
        chatHistory.push({ role: 'assistant', content: reply });

    } catch (error) {
        removeLoadingIndicator();
        appendChatMessage(`<b>Connection error:</b> ${error.message}`, 'msg-ai');
    }
}

function buildSystemPrompt() {
    const cfg = window.AI_CONFIG || {};
    const name = cfg.name || 'K8s Tutor';
    const persona = cfg.persona || `You are ${name}, a helpful Kubernetes tutor.`;

    // Base persona (always injected)
    let prompt = persona;

    // Inject active module context (the rich hidden context block)
    if (activeModuleCtxId !== null && cfg.moduleContexts) {
        const mod = cfg.moduleContexts.find(m => m.id === activeModuleCtxId);
        if (mod) {
            prompt += `\n\n--- ACTIVE MODULE CONTEXT ---\n${mod.context}`;
        }
    } else {
        // Auto-detect from current page if no button selected
        const pageModule = window.MODULE_NAME;
        if (pageModule && pageModule !== 'dashboard') {
            prompt += `\n\nThe user is currently on: ${pageModule}. Keep answers relevant to this module.`;
        }
    }

    prompt += `\n\nAlways sign off warmly and offer to explain further. Keep answers focused and practical.`;
    return prompt;
}

/**
 * Called when a module context button is clicked.
 * Sets the active context and updates the badge + button state.
 */
function selectModuleContext(moduleId) {
    const cfg = window.AI_CONFIG || {};
    const mod = (cfg.moduleContexts || []).find(m => m.id === moduleId);
    if (!mod) return;

    activeModuleCtxId = moduleId;

    // Update button active states
    document.querySelectorAll('.module-ctx-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`ctx-btn-${moduleId}`);
    if (activeBtn) activeBtn.classList.add('active');
    const clearBtn = document.getElementById('ctx-btn-clear');
    if (clearBtn) clearBtn.style.display = 'inline-flex';

    // Update topic badge
    const badge = document.getElementById('active-topic-badge');
    const label = document.getElementById('active-topic-label');
    if (badge) badge.style.display = 'block';
    if (label) label.textContent = mod.topic;

    // Update textarea placeholder
    const input = document.getElementById('chat-in');
    if (input) input.placeholder = `Ask about ${mod.topic}...`;

    // Post a silent context message in chat so user knows focus changed
    appendChatMessage(
        `<b>📌 Focused on: ${mod.topic}</b><br>I'm now your expert on this module! What would you like to know?`,
        'msg-ai'
    );
    // Reset history on context switch so old conversation doesn't bleed through
    chatHistory = [];
}

/**
 * Clears the active module context and resets UI.
 */
function clearModuleContext() {
    activeModuleCtxId = null;
    document.querySelectorAll('.module-ctx-btn').forEach(btn => btn.classList.remove('active'));
    const clearBtn = document.getElementById('ctx-btn-clear');
    if (clearBtn) clearBtn.style.display = 'none';
    const badge = document.getElementById('active-topic-badge');
    if (badge) badge.style.display = 'none';
    const input = document.getElementById('chat-in');
    if (input) input.placeholder = 'Ask Karamela anything about Kubernetes...';
    appendChatMessage('Context cleared — ask me anything! 🗺️', 'msg-ai');
    chatHistory = [];
}

function appendChatMessage(text, className, isLoading = false) {
    const area = document.getElementById('chat-area');
    if (!area) return;
    const div = document.createElement('div');
    div.className = `message ${className}`;
    if (isLoading) div.id = 'chat-loading';
    div.innerHTML = text;
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
}

function removeLoadingIndicator() {
    const el = document.getElementById('chat-loading');
    if (el) el.remove();
}

function formatAIResponse(text) {
    // Basic Markdown to HTML
    let html = text.replace(/```(.*?)\n([\s\S]*?)```/g, '<div class="code-window"><pre><code>$2</code></pre></div>');
    html = html.replace(/`(.*?)`/g, '<span class="inline-code">$1</span>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\n\n/g, '<br><br>');
    return html;
}

// -----------------------------------------------------------------------------
// Quiz Engine
// -----------------------------------------------------------------------------
let currentQuestionIndex = 0;
let correctAnswersCount = 0; // Track correct answers

function initQuiz() {
    if (!document.getElementById('quiz-container')) return;
    currentQuestionIndex = 0;
    correctAnswersCount = 0; // Reset on init
    renderQuizQuestion();
}

function renderQuizQuestion() {
    if (!window.QUIZ_DATA) return;

    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-results').style.display = 'none';
    document.getElementById('quiz-next-btn').style.display = 'none';
    document.getElementById('quiz-feedback').style.display = 'none';

    const q = window.QUIZ_DATA[currentQuestionIndex];
    document.getElementById('quiz-question').innerText = `Q${currentQuestionIndex + 1}: ${q.question}`;

    const optsDiv = document.getElementById('quiz-options');
    optsDiv.innerHTML = '';

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.justifyContent = 'flex-start';
        btn.style.textAlign = 'left';
        btn.style.marginBottom = '8px';
        btn.innerText = opt;
        btn.onclick = () => selectQuizAnswer(index, btn);
        optsDiv.appendChild(btn);
    });
}

function selectQuizAnswer(selectedIndex, btnElement) {
    const q = window.QUIZ_DATA[currentQuestionIndex];
    const isCorrect = selectedIndex === q.correct;
    const feedbackDiv = document.getElementById('quiz-feedback');
    const title = document.getElementById('quiz-feedback-title');
    const expl = document.getElementById('quiz-explanation');

    const allBtns = document.getElementById('quiz-options').querySelectorAll('button');
    allBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });

    btnElement.style.opacity = '1';

    feedbackDiv.style.display = 'block';
    expl.innerText = q.explanation;

    if (isCorrect) {
        btnElement.style.backgroundColor = 'var(--brand-green)';
        btnElement.style.color = '#fff';
        btnElement.style.borderColor = 'var(--brand-green)';
        title.innerText = '✅ Correct!';
        title.style.color = 'var(--brand-green)';
    } else {
        btnElement.style.backgroundColor = 'var(--brand-danger)';
        btnElement.style.color = '#fff';
        btnElement.style.borderColor = 'var(--brand-danger)';
        title.innerText = '❌ Incorrect.';
        title.style.color = 'var(--brand-danger)';

        allBtns[q.correct].style.opacity = '1';
        allBtns[q.correct].style.border = '2px solid var(--brand-green)';
    }

    document.getElementById('quiz-next-btn').style.display = 'inline-flex';
}

function nextQuizQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < window.QUIZ_DATA.length) {
        renderQuizQuestion();
    } else {
        showQuizResults();
    }
}

function showQuizResults() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'block';

    // Here we just calculate completed dynamically (in a real app we'd track correct answers)
    // For now, finishing the quiz gives 100% just for demo purposes
    const score = 100;
    document.getElementById('quiz-score-display').innerText = `${score}%`;

    // Save score
    if (window.CURRENT_MODULE) {
        const data = getProgress();
        data.modules[window.CURRENT_MODULE].score = score;
        saveProgress(data);
    }
}

// -----------------------------------------------------------------------------
// Modals (Search, Shortcuts, Notes)
// -----------------------------------------------------------------------------
function saveNote(labId, text) {
    localStorage.setItem(`${getUserId()}-k8s-note-m${window.CURRENT_MODULE}-l${labId}`, text);
}

function loadNote(labId) {
    return localStorage.getItem(`${getUserId()}-k8s-note-m${window.CURRENT_MODULE}-l${labId}`) || '';
}

function openNotesModal(labId) {
    const modal = document.getElementById('notes-modal');
    if (!modal) return;

    document.getElementById('notes-modal-title').innerText = `Notes for Task ${labId}`;
    const textarea = document.getElementById('notes-textarea');
    textarea.value = loadNote(labId);

    textarea.onblur = () => saveNote(labId, textarea.value);

    modal.style.display = 'flex';
}

function closeNotesModal() {
    const modal = document.getElementById('notes-modal');
    if (modal) modal.style.display = 'none';
}

function initNotesUI() {
    // Handled in HTML now
}

// --- Search ---
let searchIndex = [];
function buildSearchIndex() {
    searchIndex = [
        { title: "Dashboard", url: "/", type: "Page" },
        { title: "Resources", url: "/resources", type: "Page" },
        { title: "Docker Fundamentals", url: "/modules/0/theory", type: "Module" },
        { title: "Core Concepts (Pods, Deployments)", url: "/modules/1/theory", type: "Module" },
        { title: "Networking (Services, Ingress)", url: "/modules/2/theory", type: "Module" },
        { title: "Storage (PV, PVC)", url: "/modules/3/theory", type: "Module" },
        { title: "Security (RBAC)", url: "/modules/4/theory", type: "Module" },
        { title: "Advanced (Jobs, DaemonSets)", url: "/modules/5/theory", type: "Module" },
        { title: "Helm Fundamentals", url: "/modules/6/theory", type: "Module" },
    ];
}

function performSearch(query) {
    const results = searchIndex.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
    const container = document.getElementById('search-results');
    if (!container) return;

    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = `<div style="color: var(--text-muted); padding: 16px;">No results found for "${query}"</div>`;
        return;
    }

    results.forEach(res => {
        const div = document.createElement('div');
        div.style.padding = '12px';
        div.style.background = 'rgba(255,255,255,0.05)';
        div.style.borderRadius = 'var(--radius-md)';
        div.style.cursor = 'pointer';
        div.innerHTML = `<span style="font-size: 0.8rem; color: var(--brand-primary); text-transform: uppercase;">${res.type}</span><br><strong style="color: white; font-size: 1.1rem;">${res.title}</strong>`;
        div.onclick = () => window.location.href = res.url;
        container.appendChild(div);
    });
}

function openSearch() {
    const s = document.getElementById('search-modal');
    if (s) {
        s.style.display = 'flex';
        const inp = document.getElementById('search-input');
        if (inp) {
            inp.focus();
            inp.oninput = (e) => performSearch(e.target.value);
            performSearch(inp.value); // Initial render
        }
    }
}

function closeSearch() {
    const s = document.getElementById('search-modal');
    if (s) s.style.display = 'none';
}

function showShortcutsModal() {
    const s = document.getElementById('shortcuts-modal');
    if (s) s.style.display = 'flex';
}

function closeShortcutsModal() {
    const s = document.getElementById('shortcuts-modal');
    if (s) s.style.display = 'none';
}

// -----------------------------------------------------------------------------
// Flashcard Engine (Interview Prep)
// -----------------------------------------------------------------------------
const FLASHCARD_DATA = [
    { q: "What is Kubernetes?", a: "An open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications." },
    { q: "What is the difference between a Container and a Pod?", a: "A container is a runtime instance of an image. A Pod is the smallest deployable K8s object, which can encapsulate one or more tightly coupled containers sharing network and storage." },
    { q: "What happens when you run `kubectl run nginx --image=nginx`?", a: "The kubectl client validates the request, sends it to the API server. The API server stores the Pod object in etcd. The Scheduler notices the unassigned pod and assigns it to a Node. The Kubelet on that Node instructs the container runtime to pull the image and start the container." },
    { q: "How do Pods across different nodes communicate?", a: "Through the cluster network (CNI plugin). Every Pod gets a unique IP address, and the overlay network ensures Pod-to-Pod communication is seamlessly routed across physical Nodes." },
    { q: "What is the difference between NodePort and LoadBalancer Services?", a: "NodePort exposes the service on a static port on each Node's IP. LoadBalancer does this but also provisions an external cloud load balancer to distribute traffic to those NodePorts." },
    { q: "Why use a StatefulSet instead of a Deployment for databases?", a: "StatefulSets provide persistent, stable network identifiers and ordered deployment/scaling. Each replica gets a sticky identity (e.g., db-0, db-1) instead of random hashes, which is crucial for clustering." },
    { q: "What happens to the data when a PVC is deleted?", a: "It depends on the PersistentVolume's Reclaim Policy. Retain keeps the data but marks it released. Delete automatically deletes the underlying storage asset (like an AWS EBS volume)." },
    { q: "How do you restrict a pod from accessing the internet?", a: "Using NetworkPolicies. You can define egress rules that deny all outbound traffic except to specific CIDR blocks or internal cluster IPs." },
    { q: "What is a ServiceAccount?", a: "It provides an identity for processes that run in a Pod, allowing them to authenticate with the API server, unlike standard Users which are meant for humans." },
    { q: "What causes a CrashLoopBackOff?", a: "It means a pod repeatedly fails to start or crashes immediately after starting. Common causes: missing dependencies, bad configuration, application panics, or OOM (Out of Memory) kills." },
    { q: "What is the difference between Node Affinity and Taints/Tolerations?", a: "Node Affinity attracts Pods to specific Nodes (e.g. 'schedule this on a GPU node'). Taints repel Pods (e.g. 'don't schedule here unless you have a toleration'). They are often used together for dedicated nodes." }
];

let fcCurrentIndex = 0;
let fcIsFlipped = false;

function openFlashcards() {
    const s = document.getElementById('flashcard-modal');
    if (s) {
        s.style.display = 'flex';
        fcCurrentIndex = 0;
        fcIsFlipped = false;
        renderFlashcard();
    }
}

function closeFlashcards() {
    const s = document.getElementById('flashcard-modal');
    if (s) s.style.display = 'none';
}

function renderFlashcard() {
    const qEl = document.getElementById('fc-question');
    const aEl = document.getElementById('fc-answer');
    const cEl = document.getElementById('fc-counter');
    const inner = document.getElementById('fc-inner');

    if (!qEl || !FLASHCARD_DATA.length) return;

    // Reset flip state
    fcIsFlipped = false;
    inner.style.transform = 'rotateY(0deg)';

    const card = FLASHCARD_DATA[fcCurrentIndex];
    qEl.textContent = card.q;
    aEl.textContent = card.a;
    cEl.textContent = `Question ${fcCurrentIndex + 1} / ${FLASHCARD_DATA.length}`;
}

function flipFlashcard() {
    const inner = document.getElementById('fc-inner');
    fcIsFlipped = !fcIsFlipped;
    inner.style.transform = fcIsFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
}

function nextFlashcard() {
    fcCurrentIndex = (fcCurrentIndex + 1) % FLASHCARD_DATA.length;
    renderFlashcard();
}

function prevFlashcard() {
    fcCurrentIndex = (fcCurrentIndex - 1 + FLASHCARD_DATA.length) % FLASHCARD_DATA.length;
    renderFlashcard();
}

// --- Mobile Toggle Logic ---
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.left-sidebar');
    sidebar.classList.toggle('sidebar-open');
    toggleOverlay(sidebar.classList.contains('sidebar-open') || document.querySelector('.right-panel').classList.contains('ai-open'));
}

function toggleMobileAI() {
    const rightPanel = document.querySelector('.right-panel');
    rightPanel.classList.toggle('ai-open');
    toggleOverlay(document.querySelector('.left-sidebar').classList.contains('sidebar-open') || rightPanel.classList.contains('ai-open'));
}

function closeAllPanels() {
    document.querySelector('.left-sidebar').classList.remove('sidebar-open');
    document.querySelector('.right-panel').classList.remove('ai-open');
    toggleOverlay(false);
}

function toggleOverlay(show) {
    let overlay = document.getElementById('mobile-dim-overlay');
    if (!overlay && show) {
        overlay = document.createElement('div');
        overlay.id = 'mobile-dim-overlay';
        overlay.className = 'mobile-overlay active';
        overlay.onclick = closeAllPanels;
        document.body.appendChild(overlay);
    } else if (overlay) {
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }
}

// Close panels when clicking nav items on mobile
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
            closeAllPanels();
        }
    });
});
