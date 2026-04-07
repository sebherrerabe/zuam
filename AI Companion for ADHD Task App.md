# **Executive Function Augmentation: A Research-Driven Framework for AI-Mediated Task Management in ADHD Populations**

The development of the Zuamy module within the Zuam ecosystem represents a significant evolution in assistive technology, moving beyond static organizational tools toward dynamic cognitive scaffolding. For individuals with Attention-Deficit/Hyperactivity Disorder (ADHD), the primary challenge is not a deficit in knowledge or intent, but a persistent difficulty in accessing higher-order executive functions—such as organization, planning, and time management—in a consistent and reliable manner.1 Current research identifies executive dysfunction as the central impairment in ADHD, characterized by deficits in inhibitory control, working memory, cognitive flexibility, and sustained attention.2 By integrating an AI companion designed as a relational agent with persistent memory and tool-using capabilities, Zuam addresses these deficits through a partnership model known as human-agent teaming.4 This report provides an evidence-based analysis of the product, safety, interaction, and architectural decisions required to deploy an AI companion that mitigates the cognitive bottlenecks inherent in ADHD while maintaining high standards of reliability and ethical design.

## **Neuropsychological Framework of Executive Dysfunction**

Understanding the mechanisms of ADHD is paramount to designing an effective AI companion. ADHD is increasingly conceptualized as a disorder of executive functioning rather than merely a deficit in attention.1 These functions are essential for regulating behavior and adapting to complex situations.2 When these processes are impaired, individuals struggle with task initiation, prioritization, and time perception, often referred to as "time blindness".3

### **Core Cognitive Deficits and Their Impact on Productivity**

Executive dysfunction affects the ability to make decisions, develop new habits, and sequence activities.3 For a user of a task management app, these impairments manifest as an inability to break down large projects, leading to a state of paralysis or overwhelm.1 Research indicates that approximately 75% of children with ADHD will also present with another psychiatric disorder, such as anxiety or learning disabilities, which can compound the difficulty of managing daily workloads.3

| Executive Function Component | Behavioral Manifestation in ADHD | Potential AI Mitigation Strategy |
| :---- | :---- | :---- |
| **Inhibitory Control** | Impulsive task switching; difficulty ignoring distractions.2 | Real-time environment curation and digital distraction blocking.7 |
| **Working Memory** | Forgetting task details; losing the "thread" of a multi-step plan.2 | Persistent episodic memory and contextual task persistence.8 |
| **Cognitive Flexibility** | Inability to adjust schedules when unexpected changes occur.2 | Dynamic re-planning and naturalistic decision support.10 |
| **Task Initiation** | Procrastination caused by the perceived complexity of a goal.1 | AI-driven task decomposition and "first-step" prompting.1 |
| **Planning & Sequencing** | Difficulty estimating the time required for sub-tasks.1 | Data-driven time estimation and historical pattern recognition.1 |

The ADHD brain often struggles to access executive functions due to challenges in dopamine regulation, which is required for the consistent performance of high-level cognitive tasks.1 Consequently, therapy and assistive technology focus on creating external systems that reduce cognitive load through automation, delegation, and environmental restructuring.1

## **The Theory of Cognitive Scaffolding and the Extended Mind**

The introduction of an AI companion like Zuamy aligns with the "Extended Mind" hypothesis, which suggests that tools and technologies can function as an assistive scaffold for the human brain.13 In this paradigm, the AI does not replace the user's critical thinking but provides the structural support necessary to overcome executive function barriers.13

### **AI as an Assistive Scaffold**

Longitudinal case studies demonstrate that when AI is strategically integrated as a scaffold, it fosters metacognitive awareness—the ability of a user to evaluate their own cognitive processes.13 For neurodivergent users, this means that the AI's assistance in breaking down tasks or organizing a calendar does not just complete the work; it teaches the user how to approach similar problems independently over time.13

The success of such a scaffold depends on maintaining a clear boundary between AI assistance and independent work.13 For Zuamy, this implies that the interaction should be designed to foster "self-regulatory skills".13 For example, instead of the AI simply moving a task in the calendar, it should propose a reason (e.g., "You have a high-energy window at 10 AM, would you like to move your deep work here?") which encourages the user to reflect on their own productivity patterns.8

### **Reducing Planning Friction through Task Decomposition**

One of the most immediate benefits of generative AI for ADHD is its ability to convert disorganized thoughts or "brain dumps" into actionable steps.1 This process directly addresses the challenge of task initiation by providing a "safe way to explore and question without judgment".1 For many ADHD users, the primary hurdle is the sheer magnitude of a project; by asking the AI to "break down this math project into five-minute chunks," the user reduces the psychological cost of starting the work.1

## **Interaction Models: Mixed-Initiative Planning and Human-Agent Teaming**

The baseline interaction model for Zuamy—invoke-only, approval-oriented, and draft-first—is supported by the literature on mixed-initiative systems. Mixed-initiative interaction refers to a flexible strategy where each agent (human and AI) contributes what it does best to the task.4

### **The Human-in-the-Loop and Meaningful Control**

In complex planning environments, humans often remain responsible for the outcomes of a plan, even if an AI assisted in its creation.10 This is particularly relevant for ADHD users, where the subjectivity of their "energy levels" or "interest" may not be fully captured by a model.

| Role Type in Hybrid Systems | Description | Application in Zuamy |
| :---- | :---- | :---- |
| **Corrective Role** | Targeted at error or situational correction.14 | User edits the AI's proposed task list before saving. |
| **Justificatory Role** | Providing human-intelligible reasons for decisions.14 | User explains why a task is being moved to allow the AI to learn preferences. |
| **Friction Role** | Intentionally slowing down a process to allow for deliberation.14 | "Draft-first" mode that requires a pause before execution. |
| **Dignitary Role** | Preserving the human right to a human decision.14 | Ensuring high-stakes calendar moves are never automated without consent. |

To avoid the "MABA-MABA trap"—the tendency to insert a human into a loop merely to compensate for algorithmic failures—the system must be designed to support "meaningful control".14 Meaningful control requires that the AI presents not just a final recommendation, but the context necessary for the human to evaluate it.14 For example, if Zuamy suggests a schedule, it should provide alerts regarding "slack" or potential time conflicts, allowing the user to exercise judgment rather than acting as a "rubber stamp".11

### **Naturalistic Decision Making (NDM) and Proactive Support**

Evidence suggests that systems that do not support "Naturalistic Decision Making"—how humans make decisions in complex, time-critical scenarios—can cause frustration and disrupt workflow.10 Zuamy should function as a "Proactive Decision Support" (PDS) system that aids and alerts the user rather than forcing a static plan.10 While V1 is not proactive by default, the interaction model should allow the user to ask Zuamy to "explain its plan" when a suggestion seems inexplicable, a key requirement for trust in human-agent teams.10

## **Architectural Foundations: Planner-Executor and Reliable Tool Use**

For an AI companion to modify application state (e.g., creating tasks, moving focus blocks), the architecture must prioritize reliability and auditability. The suggested "Planner-Executor" framework is a cornerstone of agentic systems that require verified, actionable task trajectories.11

### **Decoupling High-Level Reasoning from Low-Level Execution**

A "Planned Execution Agent" separates high-level planning from low-level execution to ensure predictable control flow.11 This decoupling is essential for Zuam because it allows for "human-in-the-loop approval" at the planning stage, before any irreversible tool calls are made.11

| Architectural Component | Responsibility | Implementation Insight |
| :---- | :---- | :---- |
| **Planner** | Generates a structured, global plan (e.g., a Task DAG).11 | Uses a high-capability model (e.g., Claude Opus) to manage constraints.15 |
| **Executor** | Enacts the sequence of tool calls in a sandboxed environment.11 | Operates under strict JSON schemas to ensure API contract adherence.15 |
| **Verifier/Critic** | Checks results against success criteria and evidence.16 | Can be a separate model instance to reduce "sycophancy" and bias.15 |
| **State Reducer** | Manages deterministic state transitions.15 | Essential for "undo" functionality and plan audit trails. |

Research indicates that the quality of the planner exerts a stronger influence on overall performance than the executor.17 However, higher-utility planners are also more susceptible to adversarial manipulation, necessitating robust verification stages.17 For Zuam, this means the AI should produce a draft plan as a JSON-encoded Directed Acyclic Graph (DAG), which can be visually rendered for the user to approve.11

### **Tool Call Integrity and Reliability**

Production failures in multi-agent systems often stem from poor coordination or loose tool contracts.16 To ensure Zuamy is a "trustworthy long-term co-worker," it must treat tool calls like a strict API contract rather than a suggestion.8

Reliability is improved when agents have narrow tool access and specific roles.16 It is recommended to separate "read" tools from "write" tools; for example, the planner might use a "read-only" Google Calendar tool to fetch availability, while only a narrow, verifier-checked executor agent is allowed to "write" changes to the calendar.16 Furthermore, implementing "non-idempotent retry" protection is critical—Zuamy should not double-create a task if a network request times out.15

## **Memory Systems: Episodic, Semantic, and Personalized Layers**

The "persistent personality and memory" requirement for Zuamy is the backbone of its long-term intelligence.8 Memory allows the agent to recall, interpret, and employ past experiences to make wiser decisions, just as humans recall lessons or habits.8

### **Structuring AI Memory**

A robust memory system is typically structured into three layers that mimic human cognitive structures 8:

1. **Short-Term (Contextual) Memory:** Retains recent interactions within a single session to avoid repetitive clarifications.8  
2. **Long-Term (Persistent) Memory:** Functions as the agent's "personal diary" of the user, remembering preferences, recurring topics, and task styles across many sessions.8  
3. **Episodic Memory:** Links events together into significant sequences, allowing the agent to "learn from experience" (e.g., "The last time we scheduled a focus session at 4 PM, you were too tired to finish").8

While episodic memory enhances performance in planning and problem-solving, it also carries risks, such as "unwanted information retention" of sensitive user data.9 To mitigate this, Zuamy requires a "memory governance" framework.19

### **Category-Bound Preference Memory (CarMem)**

For an application subject to stringent privacy regulations like GDPR or the EU AI Act, "unregulated and opaque extraction" of user preferences is a significant liability.20 The CarMem system addresses this by restricting memory extraction to hierarchically predefined categories.20

| Memory Level | Category Type | Functional Example |
| :---- | :---- | :---- |
| **Main Category** | Vehicle Settings / Task Styles | "Focus Time Preferences." |
| **Sub-Category** | Climate / Work Environment | "Music Genre" or "Ambient Noise Level." |
| **Detail Category (SP)** | Single Preference (e.g., Temperature) | "Default Focus Duration (25 mins)." |
| **Detail Category (MP)** | Multiple Preferences (e.g., Genres) | "Favorite deep-work playlists." |

In the CarMem model, memory is implemented via LLM function calling with a nested JSON schema. This "forces the LLM to ignore out-of-category topics" for which no parameter exists, effectively serving as a data minimization strategy.20 Users are given granular control, allowing them to "opt-out" of specific categories *before* extraction occurs, rather than just deleting memories after the fact.20

## **Local-First Architecture and Data Sovereignty**

The hypothesis that Zuam should be "local-first" is strongly supported by the need for low latency, offline capability, and privacy—all critical factors for the ADHD demographic.

### **Latency, Reliability, and Focus**

For individuals with executive dysfunction, latency is a primary source of distraction. A network delay of several seconds while the AI fetches context can cause a "loss of focus" that derails a focus session.3 Local-first storage eliminates this bottleneck by allowing agents to query local SQLite or DuckDB instances instantly.21

Research on mobile AI agents in 2024-2025 shows that on-device inference can reduce latency by up to 50% compared to cloud-only solutions.22 For simple queries, response latency averages 300-800ms offline, enabling "uninterrupted workflows" that are essential for maintaining the fragile state of concentration often experienced by ADHD users.22

### **Protocols for Local Agentic Continuity**

To support a "plugin-based provider abstraction" while maintaining local-first speed, developers can leverage protocols like the Agent Communication Protocol (ACP) and the Model Context Protocol (MCP).23

* **ACP (Agent Communication Protocol):** An open, local-first standard that enables agents to discover and authenticate nearby peers and negotiate quick task handoffs without relying on centralized services.23 This is ideal for Zuamy when coordinating between the desktop app and a local CLI tool.  
* **MCP (Model Context Protocol):** Specializes in context routing and information sharing across diverse applications, allowing Zuamy to connect with any local application directly to query information.23

A "Lite-stream" approach—where SQLite acts as the agent's brain and a sidecar process handles background cloud synchronization—is recommended for structured agent memory and logs.21 This ensures that "data stays on-device in local mode," aligning with the rising demand for "mobile AI agent privacy" and providing a robust offline experience.22

## **Safety, Ethics, and the Relational Agent Paradigm**

Zuamy is more than a tool; it is a "relational agent" designed to build trust and rapport through empathic behaviors.24 While this anthropomorphic approach can improve adherence to organizational goals, it introduces specific hazards for neurodivergent users.

### **The Risks of Anthropomorphism in ADHD Contexts**

Anthropomorphism can increase social presence and trust, but it may also "reproduce stereotypes" or "normalize exclusionary norms".25 For example, an AI that uses a "chipper" or "hyper-productive" tone might inadvertently increase the "shame" or "frustration" felt by an ADHD user who is struggling with task initiation.1

| Hazard Category | Risk to User | Recommended Guardrail |
| :---- | :---- | :---- |
| **Artificial Intimacy** | False sense of safety leading to over-disclosure.25 | "Transparency and Verification" using RAG to ensure ground-truth.25 |
| **Task Misalignment** | User treats Zuamy as a therapist rather than a planner.25 | "Capability Gating" and explicit role definitions.15 |
| **Problematic Use** | Constant availability leading to sleep disturbances.25 | "Time-Based Engagement Caps" (e.g., late-night cooling off).25 |
| **Deceptive Reasoning** | Agent maintains "consistent lies" across sessions.9 | Auditable "Trace-Level Observability" of the AI's reasoning steps.15 |

Developers are encouraged to avoid "anthropomorphic default designs" that impose neurotypical social expectations.25 Instead, Zuamy should allow for "calibration of human-likeness," where the user can adjust the agent's tone and verbosity to suit their personal comfort and cognitive style.25

### **Safety and "Yolo Mode" Transitions**

The proposed "yolo mode" for later versions represents a move toward autonomous execution. Research warns that higher-utility configurations often exhibit greater vulnerability to adversarial manipulation.17 For V1, the system must remain "approval-oriented" to serve as a "firewall" between the AI's suggestions and the production state of the user's life.27

Before transitioning to a more autonomous mode, the architecture must include:

1. **Arbiter Agents:** A judge agent that decides based on an explicit rubric if an autonomous action is safe.16  
2. **Confidence-Weighted Selection:** The agent only proceeds autonomously if its confidence and evidence requirements meet a high threshold.16  
3. **Human-in-the-Loop for Irreversible Actions:** Actions like "delete task list" or "clear calendar" should stay behind an approval gate regardless of the autonomy mode.15

## **Product Strategy and Evidence-Based Recommendations**

The integration of Zuamy into the Zuam ecosystem is a highly viable strategy for supporting executive function, provided it is deployed with specific structural guardrails. The following recommendations are synthesized from the intersection of neuropsychological research and agentic engineering best practices.

### **Implementation of the "Cognitive Scaffold"**

Zuamy should prioritize functions that offload the "initialization cost" of tasks. This involves not just listing tasks, but reframing them to make them more exciting or manageable, such as "turning chores into a challenge".1 To prevent "confirmation fatigue," the assistant's feedback should be "personalized and non-judgmental," reducing the frustration that often accompanies traditional productivity methods.1

### **Architectural Guardrails for V1**

The system should implement a "Planner-Executor-Verifier" loop using a local-first approach.11

* The **Planner** should produce a visual "Draft Plan" in the chatbox, highlighting estimated times and potential scheduling conflicts.10  
* The **Executor** should be a "narrow" agent with scoped credentials (e.g., write-only permissions for specific lists) to minimize the "blast radius" of any error.15  
* A **Local SQLite Database** should be used for persistent episodic memory, utilizing "Lite-stream" for cloud sync.21

### **Memory Governance and Privacy**

Zuamy must adopt a "Category-Bound Memory" (CarMem) system.20 This ensures that the agent only extracts "actionable" information related to task management and calendar organization, adhering to "data minimization" principles.20 Users must have a dashboard to see exactly what Zuamy "remembers" and have the ability to toggle specific categories of preferences.8

### **Managing the Relational Dynamic**

While Zuamy can use pixel-art and a consistent personality to foster trust, it must strictly avoid making "emotional-support or therapy claims".12 The agent's tone should be adjustable, and it should periodically remind the user that it is a "statistical prediction system" to improve AI literacy and manage expectations.25

## **Conclusion: A Partnership Model for Neurodiverse Productivity**

The research indicates that AI technology is a "game-changer" for neurodivergent individuals, offering a way to work with their strengths rather than forcing traditional, often inaccessible, productivity methods.1 By functioning as an external executive function, Zuamy can mitigate the challenges of task initiation and time blindness, transforming Zuam from a task list into a collaborative partner.1

However, the efficacy of this companion depends on its ability to maintain "meaningful control" for the user. A system that over-automates can lead to "dependency" or "loss of situational awareness," which is particularly risky for a population already struggling with cognitive consistency.3 Therefore, the "invoke-only" and "approval-oriented" baseline for Zuamy is not just a safety precaution; it is a psychological necessity to ensure the user develops the metacognitive skills required for long-term self-efficacy.1

By leveraging a local-first architecture and category-bound memory governance, Zuam can deliver a high-performance, private, and deeply personalized experience that respects the unique needs of the ADHD brain. As the module evolves toward a more "autonomous" mode, the foundation of auditability and verification established in V1 will be the critical infrastructure that allows for safe, high-stakes task delegation in the future.11

#### **Works cited**

1. Therapist-Approved AI to Support your Executive Functioning | The Dig Deeper Blog, accessed on April 7, 2026, [https://digalittledeeper.ca/therapist-approved-ai-to-support-your-executive-functioning/](https://digalittledeeper.ca/therapist-approved-ai-to-support-your-executive-functioning/)  
2. Exploring AI-assisted design of executive function rehabilitation ..., accessed on April 7, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC12784522/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12784522/)  
3. Assistive Technology for ADHD: A Systematic Literature Review \- ResearchGate, accessed on April 7, 2026, [https://www.researchgate.net/publication/347073902\_Assistive\_Technology\_for\_ADHD\_A\_Systematic\_Literature\_Review](https://www.researchgate.net/publication/347073902_Assistive_Technology_for_ADHD_A_Systematic_Literature_Review)  
4. Human-Agent Teaming for Higher-Order Thinking Augmentation \- ACL Anthology, accessed on April 7, 2026, [https://aclanthology.org/2025.ijcnlp-tutorials.4.pdf](https://aclanthology.org/2025.ijcnlp-tutorials.4.pdf)  
5. (PDF) Mixed-initiative interaction \- ResearchGate, accessed on April 7, 2026, [https://www.researchgate.net/publication/3420505\_Mixed-initiative\_interaction](https://www.researchgate.net/publication/3420505_Mixed-initiative_interaction)  
6. ADHD, Executive Functions, and AI: A New Era in Treatment | Psychology Today, accessed on April 7, 2026, [https://www.psychologytoday.com/us/blog/screen-play/202502/adhd-executive-functions-and-ai-a-new-era-in-treatment](https://www.psychologytoday.com/us/blog/screen-play/202502/adhd-executive-functions-and-ai-a-new-era-in-treatment)  
7. AI for Individuals Diagnosed with ADHD \- Debra N Brosius, Psy.D., LLC, accessed on April 7, 2026, [https://www.debrabrosius.com/blog/ai-for-individuals-diagnosed-with-adhd](https://www.debrabrosius.com/blog/ai-for-individuals-diagnosed-with-adhd)  
8. Memory in Conversational AI Agents: The Backbone of Long-Term Intelligence \- Insights2TechInfo, accessed on April 7, 2026, [https://insights2techinfo.com/memory-in-conversational-ai-agents-the-backbone-of-long-term-intelligence/](https://insights2techinfo.com/memory-in-conversational-ai-agents-the-backbone-of-long-term-intelligence/)  
9. Episodic memory in AI agents poses risks that should be studied and mitigated | alphaXiv, accessed on April 7, 2026, [https://www.alphaxiv.org/overview/2501.11739v2](https://www.alphaxiv.org/overview/2501.11739v2)  
10. RADAR — A Proactive Decision Support System for Human-in-the-Loop Planning, accessed on April 7, 2026, [https://cdn.aaai.org/ocs/16028/16028-69895-1-PB.pdf](https://cdn.aaai.org/ocs/16028/16028-69895-1-PB.pdf)  
11. Planned Execution Agent Architecture \- Emergent Mind, accessed on April 7, 2026, [https://www.emergentmind.com/topics/planned-execution-agent](https://www.emergentmind.com/topics/planned-execution-agent)  
12. A Review of Artificial Intelligence-Based Educational Interventions for Students with ADHD | NHSJS, accessed on April 7, 2026, [https://nhsjs.com/wp-content/uploads/2025/07/A-Review-of-Artificial-Intelligence-Based-Educational-Interventions-for-Students-with-ADHD.pdf](https://nhsjs.com/wp-content/uploads/2025/07/A-Review-of-Artificial-Intelligence-Based-Educational-Interventions-for-Students-with-ADHD.pdf)  
13. Harnessing Generative AI to Overcome Executive Dysfunction in ..., accessed on April 7, 2026, [https://headconf.org/wp-content/uploads/pdfs/20077.pdf](https://headconf.org/wp-content/uploads/pdfs/20077.pdf)  
14. Humans in the Loop \- wp0 | Vanderbilt University, accessed on April 7, 2026, [https://wp0.vanderbilt.edu/lawreview/wp-content/uploads/sites/278/2023/03/Humans-in-the-Loop.pdf](https://wp0.vanderbilt.edu/lawreview/wp-content/uploads/sites/278/2023/03/Humans-in-the-Loop.pdf)  
15. AI Agents in 2026: Practical Architecture for Tools, Memory, Evals ..., accessed on April 7, 2026, [https://andriifurmanets.com/blogs/ai-agents-2026-practical-architecture-tools-memory-evals-guardrails](https://andriifurmanets.com/blogs/ai-agents-2026-practical-architecture-tools-memory-evals-guardrails)  
16. Building Multi-Agent Systems: How to Design Reliable AI Workflows with Multiple Agents, accessed on April 7, 2026, [https://www.stackai.com/insights/building-multi-agent-systems-how-to-design-reliable-ai-workflows-with-multiple-agents](https://www.stackai.com/insights/building-multi-agent-systems-how-to-design-reliable-ai-workflows-with-multiple-agents)  
17. PEAR: Planner-Executor Agent Robustness Benchmark \- arXiv, accessed on April 7, 2026, [https://arxiv.org/html/2510.07505v3](https://arxiv.org/html/2510.07505v3)  
18. LangChain Agents for Automation and Data Analysis: A Practical, accessed on April 7, 2026, [https://bix-tech.com/langchain-agents-for-automation-and-data-analysis-a-practical-nononsense-guide/](https://bix-tech.com/langchain-agents-for-automation-and-data-analysis-a-practical-nononsense-guide/)  
19. What Is Memory Governance (and Why Is It Important for AI Security)? \- Acuvity AI, accessed on April 7, 2026, [https://acuvity.ai/what-is-memory-governance-why-important-for-ai-security/](https://acuvity.ai/what-is-memory-governance-why-important-for-ai-security/)  
20. CarMem: Enhancing Long-Term Memory in LLM ... \- ACL Anthology, accessed on April 7, 2026, [https://aclanthology.org/2025.coling-industry.29.pdf](https://aclanthology.org/2025.coling-industry.29.pdf)  
21. Local-First Storage for AI Agents: The | Fast.io, accessed on April 7, 2026, [https://fast.io/resources/ai-agent-local-first-storage/](https://fast.io/resources/ai-agent-local-first-storage/)  
22. OpenClaw Mobile 2025: Use Your AI Agent on iPhone and Android — Features, Pricing, Security \- Sparkco, accessed on April 7, 2026, [https://sparkco.ai/blog/openclaw-mobile-using-your-ai-agent-from-iphone-and-android-in-2026](https://sparkco.ai/blog/openclaw-mobile-using-your-ai-agent-from-iphone-and-android-in-2026)  
23. ACP: Future of offline AI agent collaboration \- Alumio, accessed on April 7, 2026, [https://www.alumio.com/blog/acp-agent-communication-protocol-ai-standard](https://www.alumio.com/blog/acp-agent-communication-protocol-ai-standard)  
24. What is Relational Agents | IGI Global Scientific Publishing, accessed on April 7, 2026, [https://www.igi-global.com/dictionary/relational-agents/50544](https://www.igi-global.com/dictionary/relational-agents/50544)  
25. When Human-AI Interactions Become Parasocial: Agency and ..., accessed on April 7, 2026, [https://www.researchgate.net/publication/381204903\_When\_Human-AI\_Interactions\_Become\_Parasocial\_Agency\_and\_Anthropomorphism\_in\_Affective\_Design](https://www.researchgate.net/publication/381204903_When_Human-AI_Interactions_Become_Parasocial_Agency_and_Anthropomorphism_in_Affective_Design)  
26. Building Applications with AI Agents: Designing and Implementing Multiagent Systems 1, accessed on April 7, 2026, [https://dokumen.pub/building-applications-with-ai-agents-designing-and-implementing-multiagent-systems-1.html](https://dokumen.pub/building-applications-with-ai-agents-designing-and-implementing-multiagent-systems-1.html)  
27. AI Agent Orchestration Patterns for Reliable Products \- Product School, accessed on April 7, 2026, [https://productschool.com/blog/artificial-intelligence/ai-agent-orchestration-patterns](https://productschool.com/blog/artificial-intelligence/ai-agent-orchestration-patterns)  
28. Assistive Technology for ADHD: A Systematic Literature Review \- Semantic Scholar, accessed on April 7, 2026, [https://www.semanticscholar.org/paper/Assistive-Technology-for-ADHD%3A-A-Systematic-Review-Black-Hattingh/88cd009d029e11375f3c64c2db038db084ede703](https://www.semanticscholar.org/paper/Assistive-Technology-for-ADHD%3A-A-Systematic-Review-Black-Hattingh/88cd009d029e11375f3c64c2db038db084ede703)  
29. A systematic review for artificial intelligence-driven assistive technologies to support children with neurodevelopmental disorders \- Charles Sturt University Research Output, accessed on April 7, 2026, [https://researchoutput.csu.edu.au/en/publications/a-systematic-review-for-artificial-intelligence-driven-assistive-/](https://researchoutput.csu.edu.au/en/publications/a-systematic-review-for-artificial-intelligence-driven-assistive-/)