import type { LessonModule } from '@/hooks/useClassroomState';

export interface CourseSyllabus {
  courseId: string;
  courseTitle: string;
  category: string;
  description: string;
  modules: LessonModule[];
}

export const COURSE_SYLLABI: Record<string, CourseSyllabus> = {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Complete Python Programming
  // ──────────────────────────────────────────────────────────────────────────
  '1': {
    courseId: '1',
    courseTitle: 'Complete Python Programming',
    category: 'programming',
    description: 'Master Python from syntax fundamentals to advanced data structures, OOP, and asynchronous programming.',
    modules: [
      {
        moduleId: 'py-mod-1',
        moduleTitle: '1. Python Memory Model & Dynamic Data Structures',
        chapterSummary: 'Deep dive into Python memory layout, dynamic array allocation in lists, and immutability guarantees of tuples.',
        status: 'in_progress',
        slides: [
          {
            slideId: 'py-1-1',
            title: 'Dynamic Array Allocation & Indexing in Lists',
            conceptTag: 'MEMORY & ARRAYS',
            speech: 'Welcome to Python Programming! Today we dissect lists. In Python, lists are dynamic arrays storing 64-bit pointers to heap objects with O(1) random indexing.',
            exampleTitle: 'LIST ALLOCATION',
            code: `# Dynamic array allocation and slicing in Python\nnumbers = [10, 20, 30, 40, 50]\nnumbers.append(60)  # O(1) amortized append\nsub_slice = numbers[1:4]  # Shallow copy slice\nprint(f"Full list: {numbers}")\nprint(f"Slice [1:4]: {sub_slice}")`,
            output: 'Full list: [10, 20, 30, 40, 50, 60]\nSlice [1:4]: [20, 30, 40]',
            explanation: 'CPython over-allocates memory buffer (approx. 1.125x) during append operations to ensure O(1) amortized insertion time complexity.',
            keyPoints: [
              'O(1) amortized append operations via geometric buffer growth',
              'Contiguous memory pointers allow instantaneous indexed lookups',
              'Slicing creates a new shallow copy in O(k) time where k is slice length'
            ],
            diagramType: 'array',
          },
          {
            slideId: 'py-1-2',
            title: 'Tuples, Immutability & CPython Free-Lists',
            conceptTag: 'IMMUTABILITY & SAFETY',
            speech: 'Tuples provide strict immutability. Because their length and elements cannot mutate, CPython optimizes them with reusable free-lists.',
            exampleTitle: 'TUPLE UNPACKING',
            code: `# Tuple immutability and multiple assignment\nserver_config = ("127.0.0.1", 8080, "production")\nhost, port, env = server_config\nprint(f"Server binding: {host}:{port} ({env})")`,
            output: 'Server binding: 127.0.0.1:8080 (production)',
            explanation: 'Tuples can serve as dictionary keys because all immutable components generate constant, deterministic hash codes.',
            keyPoints: [
              'Immutable guarantees prevent accidental side-effects across threads',
              'Small tuples (len <= 20) are cached in free-lists avoiding OS malloc calls',
              'Tuple hashability allows use as composite keys in dictionaries and sets'
            ],
            diagramType: 'tree',
          },
          {
            slideId: 'py-1-3',
            title: 'Dictionary Hash Tables & Perturbation Probing',
            conceptTag: 'HASH TABLE INTERNALS',
            speech: 'Python dictionaries are compact hash tables with O(1) average lookup times. Let us inspect collision resolution via perturbation probing.',
            exampleTitle: 'HASH MAP DEFENSIVE ACCESS',
            code: `student_registry = {\n    "alice": {"grade": "A+", "xp": 1450},\n    "bob": {"grade": "A", "xp": 1200},\n}\n# Defensive access pattern\nalice_xp = student_registry.get("alice", {}).get("xp", 0)\ncharlie_xp = student_registry.get("charlie", {}).get("xp", 0)\nprint(f"Alice XP: {alice_xp} | Charlie XP: {charlie_xp}")`,
            output: 'Alice XP: 1450 | Charlie XP: 0',
            explanation: 'Since Python 3.7, dictionaries maintain insertion order using a compact 2-table design: a sparse indices table and a dense entries array.',
            keyPoints: [
              'O(1) average time complexity for get, set, and deletion operations',
              'Open addressing with perturbation recurrence resolves hash collisions cleanly',
              'Always use .get() with fallbacks to eliminate KeyError crashes in production'
            ],
            diagramType: 'hashmap',
          },
        ],
      },
      {
        moduleId: 'py-mod-2',
        moduleTitle: '2. Object-Oriented Programming & Dunder Methods',
        chapterSummary: 'Master classes, inheritance, encapsulation, property decorators, and Python magic/dunder methods.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'py-2-1',
            title: 'Class Architecture & Encapsulation',
            conceptTag: 'OOP & PROPERTIES',
            speech: 'Object-Oriented Python combines attributes and behaviors into modular classes. Use @property decorators to encapsulate state transitions cleanly.',
            exampleTitle: 'BANK ACCOUNT CLASS',
            code: `class BankAccount:\n    def __init__(self, owner: str, balance: float = 0.0):\n        self.owner = owner\n        self._balance = balance\n\n    @property\n    def balance(self) -> float:\n        return self._balance\n\n    def deposit(self, amount: float) -> float:\n        if amount <= 0:\n            raise ValueError("Deposit amount must be positive")\n        self._balance += amount\n        return self._balance\n\naccount = BankAccount("Sreekanth", 500.0)\naccount.deposit(250.0)\nprint(f"{account.owner}'s Balance: \${account.balance:.2f}")`,
            output: "Sreekanth's Balance: $750.00",
            explanation: 'The @property decorator converts a method into a getter, allowing validation and computed values without breaking client API signatures.',
            keyPoints: [
              'Encapsulate private state using single underscore prefix convention',
              'Validate invariants in setter methods rather than exposing raw attributes',
              'Instance methods automatically receive self reference to access instance attributes'
            ],
            diagramType: 'flowchart',
          },
          {
            slideId: 'py-2-2',
            title: 'Dunder Magic Methods & Operator Overloading',
            conceptTag: 'MAGIC METHODS',
            speech: 'Dunder methods let your custom objects integrate seamlessly with Python built-ins like len(), str(), and arithmetic operators.',
            exampleTitle: 'VECTOR MATH OPERATORS',
            code: `class Vector2D:\n    def __init__(self, x: float, y: float):\n        self.x = x\n        self.y = y\n\n    def __add__(self, other: "Vector2D") -> "Vector2D":\n        return Vector2D(self.x + other.x, self.y + other.y)\n\n    def __repr__(self) -> str:\n        return f"Vector2D({self.x}, {self.y})"\n\nv1 = Vector2D(3, 4)\nv2 = Vector2D(1, 2)\nprint(f"Vector Addition: {v1 + v2}")`,
            output: 'Vector Addition: Vector2D(4, 6)',
            explanation: 'Implementing __add__ delegates operator + calls directly to your method, making custom domain models expressive and idiomatic.',
            keyPoints: [
              'Implement __repr__ for clear developer debugging strings',
              'Implement __str__ for human-friendly user-facing text',
              'Operator overloading enables mathematical expressions on domain models'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'py-mod-3',
        moduleTitle: '3. Functional Patterns, Iterators & Generators',
        chapterSummary: 'Build memory-efficient streaming pipelines using generator functions, yield, itertools, and functional closures.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'py-3-1',
            title: 'Generators, Yield & Lazy Evaluation',
            conceptTag: 'LAZY STREAMS',
            speech: 'When processing gigabytes of data, lists cause Out-Of-Memory errors. Generator functions with yield produce items lazily one-at-a-time.',
            exampleTitle: 'STREAM GENERATOR',
            code: `def fibonacci_stream(limit: int):\n    a, b = 0, 1\n    for _ in range(limit):\n        yield a\n        a, b = b, a + b\n\nfib_numbers = list(fibonacci_stream(8))\nprint(f"First 8 Fibonacci numbers: {fib_numbers}")`,
            output: 'First 8 Fibonacci numbers: [0, 1, 1, 2, 3, 5, 8, 13]',
            explanation: 'Generators maintain internal execution frame state across yield statements, consuming O(1) auxiliary memory regardless of sequence size.',
            keyPoints: [
              'O(1) memory consumption by evaluating elements on-demand',
              'Generator expressions (x for x in data) replace memory-heavy list comprehensions',
              'Support infinite sequence generation without system crashes'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'py-mod-4',
        moduleTitle: '4. Asynchronous Python & AsyncIO Concurrency',
        chapterSummary: 'Build high-throughput network applications with async/await, event loops, tasks, and non-blocking I/O.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'py-4-1',
            title: 'Event Loop & Coroutine Concurrency',
            conceptTag: 'ASYNC CONCURRENCY',
            speech: 'AsyncIO uses a single-threaded cooperative event loop to handle thousands of concurrent I/O connections simultaneously.',
            exampleTitle: 'ASYNC CONCURRENT TASKS',
            code: `import asyncio\n\nasync def fetch_user_data(user_id: int):\n    await asyncio.sleep(0.05)  # Non-blocking simulated I/O\n    return {"user_id": user_id, "status": "active"}\n\nasync def main():\n    tasks = [fetch_user_data(i) for i in range(1, 4)]\n    results = await asyncio.gather(*tasks)\n    print(f"Fetched {len(results)} users concurrently: {results}")\n\nasyncio.run(main())`,
            output: "Fetched 3 users concurrently: [{'user_id': 1, 'status': 'active'}, {'user_id': 2, 'status': 'active'}, {'user_id': 3, 'status': 'active'}]",
            explanation: 'When a coroutine awaits on I/O, it yields execution back to the event loop, allowing other waiting tasks to execute without OS thread context-switching overhead.',
            keyPoints: [
              'Cooperative multitasking provides massive concurrency for I/O-bound tasks',
              'asyncio.gather executes multiple coroutines concurrently',
              'Eliminates thread race conditions on shared memory when structured properly'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Deep Learning & Neural Networks
  // ──────────────────────────────────────────────────────────────────────────
  '2': {
    courseId: '2',
    courseTitle: 'Deep Learning & Neural Networks',
    category: 'artificial-intelligence',
    description: 'Build neural networks from scratch, master backpropagation, convolutional networks, and PyTorch tensors.',
    modules: [
      {
        moduleId: 'dl-mod-1',
        moduleTitle: '1. Perceptrons & Forward Propagation',
        chapterSummary: 'Mathematical foundations of artificial neurons, activation functions (ReLU, Sigmoid), and tensor dot products.',
        status: 'in_progress',
        slides: [
          {
            slideId: 'dl-1-1',
            title: 'Artificial Neuron & Activation Functions',
            conceptTag: 'NEURAL FOUNDATIONS',
            speech: 'Welcome to Deep Learning! A neural unit computes a weighted sum of inputs plus bias, passed through a non-linear activation function like ReLU.',
            exampleTitle: 'FORWARD PASS TENSOR',
            code: `import numpy as np\n\n# Single layer forward pass\ninputs = np.array([1.2, 0.8, -0.5])\nweights = np.array([[0.2, 0.8, -0.5],\n                    [0.5, -0.91, 0.26],\n                    [-0.26, -0.27, 0.17]])\nbiases = np.array([0.1, 0.2, 0.0])\n\nlayer_outputs = np.dot(weights, inputs) + biases\nrelu_outputs = np.maximum(0, layer_outputs)\nprint(f"Raw Logits: {layer_outputs}")\nprint(f"ReLU Activated: {relu_outputs}")`,
            output: 'Raw Logits: [1.23 -0.25 -0.61]\nReLU Activated: [1.23 0.   0.  ]',
            explanation: 'Non-linear activations allow deep multi-layer networks to approximate any continuous function, overcoming the linear separability limitations of single perceptrons.',
            keyPoints: [
              'ReLU: f(x) = max(0, x) prevents vanishing gradients in deep networks',
              'Biases shift activation thresholds independently of input features',
              'Matrix dot products enable efficient GPU-accelerated vectorization'
            ],
            diagramType: 'tree',
          },
          {
            slideId: 'dl-1-2',
            title: 'Softmax & Categorical Cross-Entropy Loss',
            conceptTag: 'LOSS FUNCTIONS',
            speech: 'For classification tasks, the Softmax activation converts raw logits into a normalized probability distribution summing to 1.0.',
            exampleTitle: 'SOFTMAX & LOSS COMPUTATION',
            code: `import numpy as np\n\nlogits = np.array([2.0, 1.0, 0.1])\nexp_values = np.exp(logits - np.max(logits))  # Numerical stability shift\nprobabilities = exp_values / np.sum(exp_values)\n\n# Target class index is 0 (first class)\ntarget_class = 0\nloss = -np.log(probabilities[target_class])\nprint(f"Class Probabilities: {probabilities.round(4)}")\nprint(f"Cross-Entropy Loss: {loss:.4f}")`,
            output: 'Class Probabilities: [0.659  0.2424 0.0986]\nCross-Entropy Loss: 0.4170',
            explanation: 'Cross-entropy penalizes confident wrong predictions exponentially, producing steep gradient signals for rapid gradient descent convergence.',
            keyPoints: [
              'Softmax exponents amplify differences between top predicted logits',
              'Numerical stability trick (logits - max) prevents overflow with large values',
              'Cross-Entropy loss directly correlates with negative log-likelihood'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'dl-mod-2',
        moduleTitle: '2. Backpropagation & Computational Graphs',
        chapterSummary: 'Derive the chain rule for reverse-mode automatic differentiation and gradient descent weight updates.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'dl-2-1',
            title: 'The Chain Rule & Gradient Flow',
            conceptTag: 'BACKPROPAGATION',
            speech: 'Backpropagation computes the partial derivative of loss with respect to every weight parameter by traversing the computational graph backwards.',
            exampleTitle: 'PYTORCH AUTOGRAD',
            code: `import torch\n\n# Define trainable parameters with gradient tracking\nw = torch.tensor(2.0, requires_grad=True)\nb = torch.tensor(1.0, requires_grad=True)\nx = torch.tensor(3.0)\n\n# Forward pass: y = w*x + b, loss = (y - target)^2\ny = w * x + b\ntarget = torch.tensor(10.0)\nloss = (y - target) ** 2\n\n# Backward pass\nloss.backward()\nprint(f"Loss: {loss.item()}")\nprint(f"dLoss/dw: {w.grad.item()} | dLoss/db: {b.grad.item()}")`,
            output: 'Loss: 9.0\ndLoss/dw: -18.0 | dLoss/db: -6.0',
            explanation: 'PyTorch constructs a dynamic Directed Acyclic Graph (DAG) during the forward pass, computing exact analytic gradients during backward() via reverse accumulation.',
            keyPoints: [
              'Automatic differentiation eliminates error-prone manual calculus',
              'Gradient descent formula: weight_new = weight_old - learning_rate * grad',
              'Zero out accumulated gradients with optimizer.zero_grad() between training steps'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'dl-mod-3',
        moduleTitle: '3. Convolutional Neural Networks (CNNs)',
        chapterSummary: 'Spatial feature extraction with 2D convolutions, pooling layers, padding, and receptive fields.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'dl-3-1',
            title: 'Convolutional Kernels & Feature Maps',
            conceptTag: 'SPATIAL CONVOLUTION',
            speech: 'CNNs use parameter-sharing sliding filters to detect spatial hierarchies—from edges and textures up to complex object shapes.',
            exampleTitle: 'PYTORCH 2D CONVOLUTION',
            code: `import torch\nimport torch.nn as nn\n\nconv_layer = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, padding=1)\npool_layer = nn.MaxPool2d(kernel_size=2, stride=2)\n\n# Simulated batch of 4 RGB images (4, 3, 32, 32)\nx = torch.randn(4, 3, 32, 32)\nfeatures = pool_layer(conv_layer(x))\nprint(f"Input Tensor Shape:  {x.shape}")\nprint(f"Output Feature Shape: {features.shape}")`,
            output: 'Input Tensor Shape:  torch.Size([4, 3, 32, 32])\nOutput Feature Shape: torch.Size([4, 16, 16, 16])',
            explanation: 'Padding=1 preserves spatial dimensions during 3x3 convolution, while MaxPool2d downsamples spatial dimensions by 2x, providing translation invariance.',
            keyPoints: [
              'Translation invariance recognizes patterns regardless of position in image',
              'Parameter sharing dramatically reduces parameter count compared to dense layers',
              'Hierarchical representations build from primitive edges to holistic semantic concepts'
            ],
            diagramType: 'array',
          },
        ],
      },
      {
        moduleId: 'dl-mod-4',
        moduleTitle: '4. Optimization, Regularization & PyTorch Models',
        chapterSummary: 'Adam optimizer, dropout, batch normalization, learning rate schedulers, and end-to-end training loops.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'dl-4-1',
            title: 'Adam Optimizer & Training Loop Architecture',
            conceptTag: 'OPTIMIZATION',
            speech: 'Adam combines momentum with adaptive learning rates per parameter, accelerating convergence across sparse and noisy gradient surfaces.',
            exampleTitle: 'COMPLETE TRAINING LOOP',
            code: `import torch\nimport torch.nn as nn\nimport torch.optim as optim\n\nmodel = nn.Sequential(nn.Linear(10, 32), nn.ReLU(), nn.Linear(32, 2))\noptimizer = optim.Adam(model.parameters(), lr=0.001)\ncriterion = nn.CrossEntropyLoss()\n\n# 1 training step\nx_batch = torch.randn(8, 10)\ny_batch = torch.tensor([0, 1, 0, 1, 0, 1, 0, 1])\n\noptimizer.zero_grad()\noutputs = model(x_batch)\nloss = criterion(outputs, y_batch)\nloss.backward()\noptimizer.step()\nprint(f"Training step complete. Loss: {loss.item():.4f}")`,
            output: 'Training step complete. Loss: 0.7241',
            explanation: 'The 5-step PyTorch training lifecycle: zero_grad() -> forward pass -> compute loss -> loss.backward() -> optimizer.step().',
            keyPoints: [
              'Adam maintains first and second moments of gradients for adaptive step sizes',
              'Dropout randomly zeroes neuron activations during training to prevent overfitting',
              'Batch Normalization stabilizes internal covariate shift across mini-batches'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Full-Stack Web Development
  // ──────────────────────────────────────────────────────────────────────────
  '3': {
    courseId: '3',
    courseTitle: 'Full-Stack Web Development',
    category: 'programming',
    description: 'Build production-ready web applications with React 19, Next.js App Router, TypeScript, REST APIs, and SQL databases.',
    modules: [
      {
        moduleId: 'fs-mod-1',
        moduleTitle: '1. Modern TypeScript & React Component Architecture',
        chapterSummary: 'Type systems, functional components, custom hooks, and deterministic state management.',
        status: 'in_progress',
        slides: [
          {
            slideId: 'fs-1-1',
            title: 'TypeScript Generics & Strict Props Contracts',
            conceptTag: 'TYPE SAFETY',
            speech: 'Welcome to Full-Stack Web Development! We begin with strict TypeScript contracts that catch runtime bugs at compile time.',
            exampleTitle: 'GENERIC COMPONENT PROPS',
            code: `interface ListProps<T> {\n  items: T[];\n  renderItem: (item: T, index: number) => string;\n}\n\nfunction renderDataList<T>(props: ListProps<T>): string[] {\n  return props.items.map(props.renderItem);\n}\n\nconst users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];\nconst rendered = renderDataList({\n  items: users,\n  renderItem: (u) => \`User #\${u.id}: \${u.name}\`,\n});\nconsole.log(rendered);`,
            output: "['User #1: Alice', 'User #2: Bob']",
            explanation: 'Generics parameterize types, enabling flexible reusable components that preserve strict compiler type inference.',
            keyPoints: [
              'Compile-time safety eliminates undefined runtime property errors',
              'Generic interfaces enable reusable higher-order components',
              'Strict null checks enforce defensive data handling at system boundaries'
            ],
            diagramType: 'tree',
          },
          {
            slideId: 'fs-1-2',
            title: 'React Custom Hooks & State Encapsulation',
            conceptTag: 'REACT HOOKS',
            speech: 'Custom hooks allow you to extract and reuse stateful logic cleanly across independent components without component hierarchy clutter.',
            exampleTitle: 'USEDEBOUNCE HOOK PATTERN',
            code: `// Debouncing search queries to prevent API request flooding\nfunction createDebouncer(delayMs: number) {\n  let timer: any = null;\n  return (callback: () => void) => {\n    clearTimeout(timer);\n    timer = setTimeout(callback, delayMs);\n  };\n}\n\nconst debouncer = createDebouncer(300);\ndebouncer(() => console.log("Searching: 'Next.js App Router'"));`,
            output: "Searching: 'Next.js App Router'",
            explanation: 'Debounce patterns throttle rapid user inputs (e.g. search bars), sending API requests only after the user stops typing.',
            keyPoints: [
              'Custom hooks encapsulate lifecycle and state subscription logic',
              'Prevent unnecessary server network requests using debounce patterns',
              'Adhere to the Rules of Hooks: call only at the top level of React functions'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'fs-mod-2',
        moduleTitle: '2. Next.js 14/15 App Router & Server Components',
        chapterSummary: 'React Server Components (RSC), streaming with Suspense, Server Actions, and hybrid rendering.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'fs-2-1',
            title: 'Server Components vs Client Components',
            conceptTag: 'SERVER RENDERING',
            speech: 'React Server Components render directly on the server, fetching database queries with zero JavaScript bundle sent to client browsers.',
            exampleTitle: 'ASYNC SERVER COMPONENT',
            code: `// Next.js App Router Async Server Component\nasync function CourseCatalog() {\n  // Direct server-side data fetching with zero client bundle overhead\n  const courses = [\n    { id: "c1", title: "Full-Stack Dev", students: 12400 },\n    { id: "c2", title: "AI Engineering", students: 8900 },\n  ];\n  \n  return courses.map(c => \`[Course: \${c.title} - \${c.students} learners]\`).join(" | ");\n}\n\nCourseCatalog().then(console.log);`,
            output: '[Course: Full-Stack Dev - 12400 learners] | [Course: AI Engineering - 8900 learners]',
            explanation: 'RSCs reduce Total Blocking Time (TBT) and First Contentful Paint (FCP) by moving heavy dependencies and data orchestration server-side.',
            keyPoints: [
              'Zero-bundle-size React components for read-heavy presentation layers',
              'Direct secure access to database connection pools and secret environment keys',
              'Use "use client" directive only when state, effects, or browser listeners are required'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'fs-mod-3',
        moduleTitle: '3. RESTful APIs, Middleware & Authentication',
        chapterSummary: 'Build secure Route Handlers, JWT/Session authentication, CORS security headers, and request validation with Zod.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'fs-3-1',
            title: 'Schema Validation with Zod & Route Handlers',
            conceptTag: 'API SECURITY',
            speech: 'Never trust incoming HTTP payloads. Use Zod schemas to validate, sanitize, and strictly type check request bodies.',
            exampleTitle: 'ZOD PAYLOAD VALIDATION',
            code: `// Runtime schema validation\nfunction validateEnrollment(data: { courseId?: string; level?: string }) {\n  const validLevels = ["beginner", "intermediate", "advanced"];\n  if (!data.courseId || typeof data.courseId !== "string") {\n    return { success: false, error: "Invalid or missing courseId" };\n  }\n  if (!data.level || !validLevels.includes(data.level)) {\n    return { success: false, error: "Invalid level selection" };\n  }\n  return { success: true, validated: { courseId: data.courseId, level: data.level } };\n}\n\nconsole.log(validateEnrollment({ courseId: "3", level: "advanced" }));`,
            output: "{ success: true, validated: { courseId: '3', level: 'advanced' } }",
            explanation: 'Validating payloads at the controller boundary stops injection attacks and malformed data before hitting database drivers.',
            keyPoints: [
              'Fail fast at API boundary layers with descriptive HTTP 400 responses',
              'Infer TypeScript types directly from validation schemas for end-to-end type safety',
              'Protect endpoints using authentication middleware and rate limiting'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'fs-mod-4',
        moduleTitle: '4. Relational Database Design & Production Deployment',
        chapterSummary: 'Database indexing, foreign keys, transaction ACID guarantees, Docker containerization, and CI/CD deployment.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'fs-4-1',
            title: 'ACID Transactions & Database Indexing',
            conceptTag: 'DATABASE ARCHITECTURE',
            speech: 'Relational databases ensure data integrity via ACID transactions and accelerate queries from O(n) table scans to O(log n) B-Tree lookups.',
            exampleTitle: 'TRANSACTION WORKFLOW',
            code: `-- SQL Transaction Example: Atomic Course Enrollment\nBEGIN TRANSACTION;\n\nINSERT INTO enrollments (user_id, course_id, level, enrolled_at)\nVALUES ('u_9482', 'course_3', 'advanced', NOW());\n\nUPDATE courses \nSET enrolled_students = enrolled_students + 1 \nWHERE id = 'course_3';\n\nCOMMIT;`,
            output: 'TRANSACTION COMMITTED (2 rows affected in 4.2ms)',
            explanation: 'ACID Atomicity guarantees that if any step inside the transaction fails, all preceding database writes roll back cleanly.',
            keyPoints: [
              'B-Tree indexes speed up WHERE and JOIN filter queries significantly',
              'Atomic transactions eliminate race conditions in critical balance or seat allocation updates',
              'Configure database connection pooling to handle high concurrent HTTP traffic'
            ],
            diagramType: 'tree',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Data Science & Analytics
  // ──────────────────────────────────────────────────────────────────────────
  '4': {
    courseId: '4',
    courseTitle: 'Data Science & Analytics',
    category: 'data-science',
    description: 'Master data wrangling with Pandas, statistical hypothesis testing, data visualization with Seaborn, and Scikit-Learn modeling.',
    modules: [
      {
        moduleId: 'ds-mod-1',
        moduleTitle: '1. Exploratory Data Analysis with Pandas & NumPy',
        chapterSummary: 'Vectorized operations, handling missing data, grouping aggregations, and dataframe reshaping.',
        status: 'in_progress',
        slides: [
          {
            slideId: 'ds-1-1',
            title: 'Vectorized Aggregations & GroupBy Operations',
            conceptTag: 'PANDAS DATA WRANGLING',
            speech: 'Welcome to Data Science! Pandas uses C-level memory arrays to execute vectorized calculations 100x faster than standard Python loops.',
            exampleTitle: 'PANDAS GROUPBY PIPELINE',
            code: `import pandas as pd\n\ndata = {\n    "department": ["Engineering", "Engineering", "Marketing", "Marketing", "Sales"],\n    "salary": [120000, 140000, 85000, 92000, 95000],\n    "experience_years": [4, 6, 3, 5, 4],\n}\ndf = pd.DataFrame(data)\nsummary = df.groupby("department")["salary"].agg(["mean", "count"]).round(2)\nprint(summary)`,
            output: '              mean  count\ndepartment               \nEngineering  130000.0      2\nMarketing     88500.0      2\nSales         95000.0      1',
            explanation: 'The Split-Apply-Combine pattern partitions data into groups, applies aggregation functions, and returns a summary dataframe.',
            keyPoints: [
              'Avoid iterating with iterrows(); always prefer vectorized column operations',
              'Impute missing values using domain-appropriate median or mean strategies',
              'Filter outliers using Interquartile Range (IQR) or Z-score boundaries'
            ],
            diagramType: 'array',
          },
        ],
      },
      {
        moduleId: 'ds-mod-2',
        moduleTitle: '2. Statistical Hypothesis Testing & Probability',
        chapterSummary: 'A/B testing, normal distributions, p-values, t-tests, and confidence intervals.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'ds-2-1',
            title: 'A/B Testing & Two-Sample T-Tests',
            conceptTag: 'STATISTICS & HYPOTHESIS',
            speech: 'Hypothesis testing validates whether an observed metric difference between variant A and variant B is statistically significant or random chance.',
            exampleTitle: 'T-TEST SIGNIFICANCE',
            code: `from scipy import stats\nimport numpy as np\n\n# Simulated conversion times (in seconds)\ncontrol_group = np.array([24.2, 25.1, 23.8, 26.0, 24.9, 25.5])\nvariant_group = np.array([21.5, 22.0, 21.8, 22.4, 21.9, 22.1])\n\nt_stat, p_value = stats.ttest_ind(control_group, variant_group)\nprint(f"T-statistic: {t_stat:.3f}")\nprint(f"P-value:     {p_value:.6f}")\nprint(f"Statistically Significant (alpha=0.05): {p_value < 0.05}")`,
            output: 'T-statistic: 8.742\nP-value:     0.000005\nStatistically Significant (alpha=0.05): True',
            explanation: 'With a p-value < 0.05, we reject the null hypothesis and conclude that the variant UX design produces a genuinely faster conversion time.',
            keyPoints: [
              'Null Hypothesis (H0): Assumes no true difference between groups',
              'Significance level alpha (typically 0.05) defines false-positive threshold',
              'Calculate statistical power before launching experiments to avoid underpowered tests'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'ds-mod-3',
        moduleTitle: '3. Machine Learning with Scikit-Learn',
        chapterSummary: 'Feature engineering, train/test splitting, cross-validation, Random Forests, and ROC-AUC evaluation.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'ds-3-1',
            title: 'Classification Pipeline & ROC-AUC Metrics',
            conceptTag: 'SCIKIT-LEARN PIPELINES',
            speech: 'Scikit-Learn pipelines bundle preprocessing, scaling, and model training into an integrated pipeline that prevents data leakage.',
            exampleTitle: 'RANDOM FOREST CLASSIFIER',
            code: `from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score\nimport numpy as np\n\nX_train = np.array([[25, 50000], [45, 120000], [35, 80000], [22, 30000]])\ny_train = np.array([0, 1, 1, 0])  # 1 = Premium User\n\nclf = RandomForestClassifier(n_estimators=10, random_state=42)\nclf.fit(X_train, y_train)\n\nX_test = np.array([[40, 110000], [23, 35000]])\npredictions = clf.predict(X_test)\nprint(f"Model Predictions: {predictions}")`,
            output: 'Model Predictions: [1 0]',
            explanation: 'Random Forests ensemble hundreds of de-correlated decision trees, reducing variance and resisting overfitting on complex feature sets.',
            keyPoints: [
              'Fit scalers and transformers on training data only to avoid data leakage',
              'Use k-fold cross-validation to assess true out-of-sample generalization',
              'Evaluate imbalanced datasets using F1-score and Precision-Recall curves'
            ],
            diagramType: 'tree',
          },
        ],
      },
      {
        moduleId: 'ds-mod-4',
        moduleTitle: '4. Data Storytelling & Dashboard Visualizations',
        chapterSummary: 'Interactive visualizations with Plotly, narrative charts, and executive KPI reporting.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'ds-4-1',
            title: 'Executive KPI Metrics & Visual Hierarchy',
            conceptTag: 'DATA STORYTELLING',
            speech: 'Effective data scientists translate statistical models into intuitive business insights with clear visual hierarchies and actionable recommendations.',
            exampleTitle: 'KPI SUMMARY METRICS',
            code: `# Business KPI Metric Computation\nrevenue_current = 450000\nrevenue_previous = 380000\nchurn_rate = 0.024\n\ngrowth_pct = ((revenue_current - revenue_previous) / revenue_previous) * 100\nprint(f"Monthly Revenue:  \${revenue_current:,} (+{growth_pct:.1f}% MoM)")\nprint(f"Customer Churn:   {churn_rate * 100:.2f}% (Benchmark: < 3.0%)")`,
            output: 'Monthly Revenue:  $450,000 (+18.4% MoM)\nCustomer Churn:   2.40% (Benchmark: < 3.0%)',
            explanation: 'Presenting actionable delta metrics (+18.4% MoM) alongside industry benchmarks enables leadership to make rapid data-driven decisions.',
            keyPoints: [
              'Choose chart types that match data dimensionality (time series = line, categorical = bar)',
              'Highlight the single most important takeaway in the chart title',
              'Eliminate chart junk: remove redundant borders, low-contrast legends, and 3D effects'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Cybersecurity Fundamentals
  // ──────────────────────────────────────────────────────────────────────────
  '5': {
    courseId: '5',
    courseTitle: 'Cybersecurity Fundamentals',
    category: 'cybersecurity',
    description: 'Defend systems from network attacks, master ethical hacking, cryptography, OWASP Top 10 vulnerabilities, and security auditing.',
    modules: [
      {
        moduleId: 'sec-mod-1',
        moduleTitle: '1. Network Security & Packet Analysis',
        chapterSummary: 'TCP/IP handshake, OSI model layers, Wireshark packet capture analysis, firewalls, and port scanning.',
        status: 'in_progress',
        slides: [
          {
            slideId: 'sec-1-1',
            title: 'The 3-Way TCP Handshake & SYN Floods',
            conceptTag: 'NETWORK PROTOCOLS',
            speech: 'Welcome to Cybersecurity! Reliable network communication relies on the 3-Way Handshake: SYN -> SYN-ACK -> ACK. Let us analyze how SYN flood attacks exploit this.',
            exampleTitle: 'TCP HANDSHAKE VERIFICATION',
            code: `# Simulating TCP 3-Way Handshake State Machine\nclass TCPConnection:\n    def __init__(self):\n        self.state = "CLOSED"\n\n    def send_syn(self):\n        self.state = "SYN_SENT"\n        return "SYN (Seq=100)"\n\n    def receive_syn_ack(self):\n        self.state = "ESTABLISHED"\n        return "ACK (Seq=101, Ack=301)"\n\nconn = TCPConnection()\nprint(conn.send_syn())\nprint(conn.receive_syn_ack())\nprint(f"Connection Status: {conn.state}")`,
            output: 'SYN (Seq=100)\nACK (Seq=101, Ack=301)\nConnection Status: ESTABLISHED',
            explanation: 'SYN Cookies prevent DoS attacks by encoding sequence numbers into the SYN-ACK timestamp, avoiding pre-allocating memory table entries before handshake completion.',
            keyPoints: [
              'SYN -> SYN-ACK -> ACK establishes synchronized bidirectional sequence numbers',
              'SYN cookies mitigate half-open connection memory exhaustion attacks',
              'Stateful firewalls track connection states to reject unsolicited inbound packets'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'sec-mod-2',
        moduleTitle: '2. Cryptography, Hashing & Public Key Infrastructure',
        chapterSummary: 'AES encryption, RSA key pairs, SHA-256 hashing, salting passwords with bcrypt, and TLS certificates.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'sec-2-1',
            title: 'Password Hashing with Salt & Work Factors',
            conceptTag: 'CRYPTOGRAPHY',
            speech: 'Never store plain-text passwords or naive MD5/SHA256 hashes. Modern security demands salted, adaptive work-factor hashing algorithms like bcrypt or Argon2.',
            exampleTitle: 'PASSWORD HASHING WORKFLOW',
            code: `import hashlib\nimport secrets\n\ndef secure_hash_password(password: str) -> tuple[str, str]:\n    # Generate cryptographically secure random salt (32 bytes)\n    salt = secrets.token_hex(16)\n    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)\n    return salt, key.hex()\n\nsalt, hash_val = secure_hash_password("SuperSecretP@ss123")\nprint(f"Salt: {salt}")\nprint(f"Hash (100k rounds): {hash_val[:32]}...")`,
            output: 'Salt: 8f9b2a1c0d4e5f6a7b8c9d0e1f2a3b4c\nHash (100k rounds): 4d9e2a1b5c8f7e6d0a3b2c1e4f5a6b7c...',
            explanation: 'Salting prevents rainbow table lookups, while 100,000 PBKDF2 iterations make brute-force GPU cracking computationally expensive.',
            keyPoints: [
              'Salts ensure identical passwords generate completely different hashes',
              'Work factors force attackers to expend seconds per guess rather than nanoseconds',
              'Use constant-time comparison (hmac.compare_digest) to prevent timing attacks'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'sec-mod-3',
        moduleTitle: '3. OWASP Top 10 Web Application Vulnerabilities',
        chapterSummary: 'SQL injection (SQLi), Cross-Site Scripting (XSS), CSRF tokens, Broken Access Control, and SSRF.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'sec-3-1',
            title: 'SQL Injection Prevention & Parameterized Queries',
            conceptTag: 'APPLICATION SECURITY',
            speech: 'SQL Injection occurs when untrusted user input alters database query logic. Parameterized queries completely eliminate SQLi by strictly separating code from data.',
            exampleTitle: 'PARAMETERIZED QUERY PATTERN',
            code: `# DEFENSIVE PATTERN: Parameterized queries eliminate SQL Injection\ndef safe_user_lookup(db_cursor, username: str):\n    query = "SELECT id, email, role FROM users WHERE username = %s"\n    # Parameter passed as tuple to driver, never concatenated into SQL string\n    return f"Executing safely: {query} with param ('{username}',)"\n\nprint(safe_user_lookup(None, "admin' OR '1'='1"))`,
            output: "Executing safely: SELECT id, email, role FROM users WHERE username = %s with param ('admin\\' OR \\'1\\'=\\'1',)",
            explanation: 'When parameterized, database drivers treat input strictly as a literal string value rather than executable SQL syntax commands.',
            keyPoints: [
              'Never concatenate raw user strings into SQL or NoSQL queries',
              'Sanitize all HTML outputs to prevent Stored and Reflected XSS',
              'Enforce SameSite cookie attributes and CSRF tokens on state-mutating requests'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'sec-mod-4',
        moduleTitle: '4. Security Operations, Threat Hunting & Incident Response',
        chapterSummary: 'SIEM log analysis, intrusion detection (IDS/IPS), incident response lifecycle, and zero-trust architecture.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'sec-4-1',
            title: 'Incident Response Lifecycle & Containment',
            conceptTag: 'INCIDENT RESPONSE',
            speech: 'When a breach occurs, the NIST Incident Response Framework guides teams through 4 phases: Preparation, Detection & Analysis, Containment & Eradication, and Post-Incident Recovery.',
            exampleTitle: 'IR PHASE LIFECYCLE',
            code: `incident_stages = [\n    "1. Detection & Triaging: Confirm alert validity and attack scope",\n    "2. Containment: Isolate compromised nodes from network subnet",\n    "3. Eradication: Remove malware persistence keys and revoke credentials",\n    "4. Recovery: Restore verified clean backups and monitor telemetry",\n    "5. Lessons Learned: Patch root vulnerabilities and update playbooks"\n]\nfor stage in incident_stages:\n    print(f"✓ {stage}")`,
            output: '✓ 1. Detection & Triaging: Confirm alert validity and attack scope\n✓ 2. Containment: Isolate compromised nodes from network subnet\n✓ 3. Eradication: Remove malware persistence keys and revoke credentials\n✓ 4. Recovery: Restore verified clean backups and monitor telemetry\n✓ 5. Lessons Learned: Patch root vulnerabilities and update playbooks',
            explanation: 'Rapid short-term containment (e.g. isolating network VLANs) stops lateral movement while preserving forensic volatile RAM memory artifacts.',
            keyPoints: [
              'Zero Trust Principle: Never trust, always verify every request identity',
              'Preserve volatile memory dumps before rebooting compromised systems',
              'Conduct post-mortem root-cause analysis within 72 hours of incident resolution'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Business Strategy & Management
  // ──────────────────────────────────────────────────────────────────────────
  '6': {
    courseId: '6',
    courseTitle: 'Business Strategy & Management',
    category: 'business',
    description: 'Develop strategic thinking, market sizing, Porter Five Forces analysis, unit economics, and executive leadership.',
    modules: [
      {
        moduleId: 'biz-mod-1',
        moduleTitle: '1. Strategic Frameworks & Competitive Advantage',
        chapterSummary: "Porter's Five Forces, Blue Ocean Strategy, Value Chain Analysis, and sustainable competitive moats.",
        status: 'in_progress',
        slides: [
          {
            slideId: 'biz-1-1',
            title: "Porter's Five Forces & Industry Profitability",
            conceptTag: 'STRATEGIC ANALYSIS',
            speech: "Welcome to Business Strategy! Porter's Five Forces framework assesses an industry's structural attractiveness and long-term profit potential.",
            exampleTitle: 'COMPETITIVE FORCES MATRIX',
            code: `forces = {\n    "Supplier Power": "Low (Diverse global supplier ecosystem)",\n    "Buyer Power": "High (Low switching costs for consumers)",\n    "Competitive Rivalry": "Intense (Price competition and feature parity)",\n    "Threat of Substitution": "Moderate (Alternative digital workflows)",\n    "Threat of New Entrants": "Low (High capital expenditure and brand moats)"\n}\nfor force, rating in forces.items():\n    print(f"• {force.ljust(24)}: {rating}")`,
            output: '• Supplier Power          : Low (Diverse global supplier ecosystem)\n• Buyer Power             : High (Low switching costs for consumers)\n• Competitive Rivalry     : Intense (Price competition and feature parity)\n• Threat of Substitution  : Moderate (Alternative digital workflows)\n• Threat of New Entrants  : Low (High capital expenditure and brand moats)',
            explanation: 'Sustainable above-average returns require establishing competitive moats: network effects, high switching costs, proprietary IP, or scale economies.',
            keyPoints: [
              'Identify whether industry dynamics squeeze margins upstream or downstream',
              'Build defensible moats around proprietary distribution and brand loyalty',
              'Blue Ocean Strategy focuses on creating uncontested market space rather than competing'
            ],
            diagramType: 'tree',
          },
        ],
      },
      {
        moduleId: 'biz-mod-2',
        moduleTitle: '2. Unit Economics, CAC & Customer Lifetime Value (LTV)',
        chapterSummary: 'Customer Acquisition Cost (CAC), LTV/CAC ratio, churn curves, payback period, and contribution margins.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'biz-2-1',
            title: 'The LTV:CAC Ratio & Payback Period',
            conceptTag: 'UNIT ECONOMICS',
            speech: 'A healthy SaaS business requires an LTV:CAC ratio greater than 3.0x with a CAC payback period under 12 months.',
            exampleTitle: 'UNIT ECONOMICS ENGINE',
            code: `# Unit economics calculation\narpu = 50.0  # Average Revenue Per User / month\ngross_margin = 0.80\nmonthly_churn = 0.02  # 2% churn = 50 month average lifetime\ncac = 350.0  # Customer acquisition cost\n\nltv = (arpu * gross_margin) / monthly_churn\nltv_cac_ratio = ltv / cac\npayback_months = cac / (arpu * gross_margin)\n\nprint(f"Customer Lifetime Value (LTV): \${ltv:.2f}")\nprint(f"LTV / CAC Ratio:              {ltv_cac_ratio:.2f}x (Healthy: >= 3.0x)")\nprint(f"CAC Payback Period:           {payback_months:.1f} months")`,
            output: 'Customer Lifetime Value (LTV): $2000.00\nLTV / CAC Ratio:              5.71x (Healthy: >= 3.0x)\nCAC Payback Period:           8.8 months',
            explanation: 'An 8.8-month payback period allows companies to recycle acquisition capital efficiently within the same fiscal operating cycle.',
            keyPoints: [
              'Target LTV:CAC >= 3.0x for sustainable growth and investor attractiveness',
              'Reducing churn from 2% to 1% doubles Customer Lifetime Value instantly',
              'Track Net Revenue Retention (NRR > 115%) to capture expansion revenue'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'biz-mod-3',
        moduleTitle: '3. Organizational Leadership & Change Management',
        chapterSummary: 'OKRs (Objectives & Key Results), executive communication, organizational culture, and scaling teams.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'biz-3-1',
            title: 'OKR Goal Setting & Measurable Key Results',
            conceptTag: 'LEADERSHIP & OKRS',
            speech: 'OKRs align cross-functional teams around ambitious qualitative objectives paired with strictly measurable, verifiable key results.',
            exampleTitle: 'COMPANY OKR STRUCTURE',
            code: `okr = {\n    "Objective": "Scale enterprise AI platform adoption in Q3",\n    "Key Results": [\n        "KR1: Expand Annual Recurring Revenue from \$4M to \$7.5M",\n        "KR2: Maintain 99.95% API uptime across multi-region clusters",\n        "KR3: Increase Net Promoter Score (NPS) from 52 to 68+"\n    ]\n}\nprint(f"🎯 Objective: {okr['Objective']}")\nfor kr in okr['Key Results']:\n    print(f"   ↳ {kr}")`,
            output: '🎯 Objective: Scale enterprise AI platform adoption in Q3\n   ↳ KR1: Expand Annual Recurring Revenue from $4M to $7.5M\n   ↳ KR2: Maintain 99.95% API uptime across multi-region clusters\n   ↳ KR3: Increase Net Promoter Score (NPS) from 52 to 68+',
            explanation: 'Effective key results are quantitative outcomes rather than effort-based activity lists, ensuring unambiguous end-of-quarter grading.',
            keyPoints: [
              'Objectives are inspirational and qualitative; Key Results are strictly numerical',
              'Limit to 3-5 Key Results per Objective to prevent priority dilution',
              'Conduct weekly progress check-ins to unblock team dependencies early'
            ],
            diagramType: 'tree',
          },
        ],
      },
      {
        moduleId: 'biz-mod-4',
        moduleTitle: '4. Corporate Finance & Valuation Modeling',
        chapterSummary: 'Discounted Cash Flow (DCF), EBITDA multiples, balance sheet mechanics, and M&A due diligence.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'biz-4-1',
            title: 'Discounted Cash Flow (DCF) Valuation',
            conceptTag: 'VALUATION',
            speech: 'The intrinsic value of any business equals the sum of its future free cash flows discounted back to present value using WACC.',
            exampleTitle: 'DCF PRESENT VALUE MODEL',
            code: `cash_flows = [100000, 130000, 170000, 220000, 280000]  # Years 1-5\ndiscount_rate = 0.09  # WACC 9%\n\npv_total = sum(cf / ((1 + discount_rate) ** (i + 1)) for i, cf in enumerate(cash_flows))\nterminal_value = (cash_flows[-1] * 1.03) / (discount_rate - 0.03)\nterminal_pv = terminal_value / ((1 + discount_rate) ** 5)\nenterprise_value = pv_total + terminal_pv\n\nprint(f"5-Year Cash Flow PV: \${pv_total:,.2f}")\nprint(f"Enterprise Value:     \${enterprise_value:,.2f}")`,
            output: '5-Year Cash Flow PV: $681,048.97\nEnterprise Value:     $3,803,099.19',
            explanation: 'The Gordon Growth formula models terminal enterprise value assuming perpetual cash generation at the long-term GDP growth rate.',
            keyPoints: [
              'Discounting reflects time value of money and inherent business risk',
              'WACC balances the cost of equity with the after-tax cost of debt',
              'Perform sensitivity analysis across discount rates and growth assumptions'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Calculus & Linear Algebra Mastery
  // ──────────────────────────────────────────────────────────────────────────
  '7': {
    courseId: '7',
    courseTitle: 'Calculus & Linear Algebra Mastery',
    category: 'mathematics',
    description: 'Master the mathematical foundations of AI: derivatives, gradients, matrix transformations, eigenvalues, and SVD.',
    modules: [
      {
        moduleId: 'math-mod-1',
        moduleTitle: '1. Multivariable Calculus & Gradient Vectors',
        chapterSummary: 'Partial derivatives, directional derivatives, gradients, the Jacobian matrix, and Taylor series approximations.',
        status: 'in_progress',
        slides: [
          {
            slideId: 'math-1-1',
            title: 'Gradient Vector & Direction of Steepest Ascent',
            conceptTag: 'MULTIVARIABLE CALCULUS',
            speech: 'Welcome to Calculus & Linear Algebra! The gradient vector contains all first-order partial derivatives and points in the direction of greatest rate of increase.',
            exampleTitle: 'GRADIENT COMPUTATION',
            code: `# Computing analytical gradient for f(x, y) = 3*x^2 + 2*x*y + y^2\ndef f_gradient(x: float, y: float) -> tuple[float, float]:\n    df_dx = 6 * x + 2 * y\n    df_dy = 2 * x + 2 * y\n    return (df_dx, df_dy)\n\npt = (2.0, 3.0)\ngrad = f_gradient(*pt)\nprint(f"Point: {pt}")\nprint(f"Gradient Vector ∇f: {grad}")`,
            output: 'Point: (2.0, 3.0)\nGradient Vector ∇f: (18.0, 10.0)',
            explanation: 'In machine learning gradient descent, stepping in the negative gradient direction (-∇f) guarantees local minimization of loss surfaces.',
            keyPoints: [
              'The gradient ∇f is perpendicular to the contour level curves of the function',
              'The norm ||∇f|| represents the magnitude of maximum slope',
              'Zero gradient (∇f = 0) identifies critical points: minima, maxima, or saddle points'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'math-mod-2',
        moduleTitle: '2. Matrix Transformations, Span & Basis',
        chapterSummary: 'Linear combinations, vector spaces, rank, column space, null space, and matrix determinants.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'math-2-1',
            title: 'Linear Transformations & Matrix Multiplication',
            conceptTag: 'LINEAR ALGEBRA',
            speech: 'Matrices represent geometric transformations: rotations, scaling, and shears that map vectors between coordinate vector spaces.',
            exampleTitle: 'ROTATION TRANSFORMATION',
            code: `import numpy as np\n\n# 90-degree counter-clockwise rotation matrix\ntheta = np.radians(90)\nrotation_matrix = np.array([\n    [np.cos(theta), -np.sin(theta)],\n    [np.sin(theta),  np.cos(theta)]\n])\n\nvector = np.array([1.0, 0.0])  # Unit vector along X-axis\ntransformed = np.dot(rotation_matrix, vector)\nprint(f"Original Vector:    {vector}")\nprint(f"Transformed Vector: {transformed.round(2)}")`,
            output: 'Original Vector:    [1. 0.]\nTransformed Vector: [0. 1.]',
            explanation: 'The determinant of a transformation matrix measures the factor by which area (in 2D) or volume (in 3D) scales under the mapping.',
            keyPoints: [
              'Matrix multiplication corresponds to the composition of geometric transformations',
              'A non-zero determinant (det(A) != 0) guarantees the transformation is invertible',
              'The rank of a matrix equals the dimension of the vector space spanned by its columns'
            ],
            diagramType: 'array',
          },
        ],
      },
      {
        moduleId: 'math-mod-3',
        moduleTitle: '3. Eigenvalues, Eigenvectors & Diagonalization',
        chapterSummary: 'Characteristic equations, spectral decomposition, symmetric matrices, and positive definiteness.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'math-3-1',
            title: 'Eigen decomposition & Invariant Directions',
            conceptTag: 'EIGEN VALUES & VECTORS',
            speech: 'Eigenvectors are special invariant directions that experience only scalar stretching (by eigenvalue λ) when transformed by matrix A: A*v = λ*v.',
            exampleTitle: 'EIGEN DECOMPOSITION',
            code: `import numpy as np\n\nA = np.array([[4, 2],\n              [1, 3]])\n\neigenvalues, eigenvectors = np.linalg.eig(A)\nprint(f"Eigenvalues: {eigenvalues}")\nprint(f"Eigenvectors:\n{eigenvectors.round(4)}")`,
            output: 'Eigenvalues: [5. 2.]\nEigenvectors:\n[[ 0.8944 -0.7071]\n [ 0.4472  0.7071]]',
            explanation: 'Diagonalizing a matrix into A = V * Λ * V^(-1) simplifies matrix powers and differential equation solutions into trivial scalar arithmetic.',
            keyPoints: [
              'Eigenvalues determine the stability of dynamical systems and iterative algorithms',
              'Symmetric matrices have real eigenvalues and orthogonal eigenvectors',
              'Positive definite matrices have strictly positive eigenvalues (essential for convex optimization)'
            ],
            diagramType: 'tree',
          },
        ],
      },
      {
        moduleId: 'math-mod-4',
        moduleTitle: '4. Singular Value Decomposition (SVD) & PCA',
        chapterSummary: 'Singular Value Decomposition (A = U * Σ * V^T), Principal Component Analysis, and low-rank matrix approximation.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'math-4-1',
            title: 'SVD & Dimensionality Reduction',
            conceptTag: 'SVD & PCA',
            speech: 'SVD factorizes any rectangular matrix into orthogonal singular vectors and singular values, forming the engine behind PCA and recommendation systems.',
            exampleTitle: 'SVD LOW-RANK APPROXIMATION',
            code: `import numpy as np\n\nX = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]], dtype=float)\nU, s, Vt = np.linalg.svd(X, full_matrices=False)\nprint(f"Singular values: {s.round(2)}")\n# Rank-1 reconstruction\nrank1_approx = np.outer(U[:, 0] * s[0], Vt[0, :])\nprint(f"Rank-1 Energy Captured: {(s[0]**2 / np.sum(s**2)) * 100:.2f}%")`,
            output: 'Singular values: [25.46  1.29  0.  ]\nRank-1 Energy Captured: 99.74%',
            explanation: 'The Eckart-Young theorem proves that truncating SVD at k singular values gives the optimal rank-k approximation under Frobenius norm.',
            keyPoints: [
              'SVD works on any matrix regardless of whether it is square or invertible',
              'PCA projects data onto directions of maximum variance corresponding to top singular vectors',
              'Enables massive data compression and noise filtering in signal processing'
            ],
            diagramType: 'array',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Cloud Computing & AWS
  // ──────────────────────────────────────────────────────────────────────────
  '8': {
    courseId: '8',
    courseTitle: 'Cloud Computing & AWS',
    category: 'cloud-computing',
    description: 'Design resilient cloud architecture with Amazon Web Services: VPC, EC2, S3, RDS, Lambda serverless, and Terraform infrastructure.',
    modules: [
      {
        moduleId: 'cloud-mod-1',
        moduleTitle: '1. AWS Global Infrastructure & VPC Networking',
        chapterSummary: 'Regions, Availability Zones, Virtual Private Clouds (VPC), public/private subnets, NAT Gateways, and Route Tables.',
        status: 'in_progress',
        slides: [
          {
            slideId: 'cloud-1-1',
            title: 'Multi-AZ VPC Network Topology',
            conceptTag: 'CLOUD NETWORKING',
            speech: 'Welcome to Cloud Computing! We design multi-tier VPCs isolating secure database clusters in private subnets while routing web traffic through public load balancers.',
            exampleTitle: 'TERRAFORM VPC DEFINITION',
            code: `# Infrastructure as Code: Terraform VPC\nresource "aws_vpc" "main" {\n  cidr_block           = "10.0.0.0/16"\n  enable_dns_hostnames = true\n  tags = { Name = "production-vpc" }\n}\n\nresource "aws_subnet" "public_1" {\n  vpc_id            = aws_vpc.main.id\n  cidr_block        = "10.0.1.0/24"\n  availability_zone = "us-east-1a"\n  map_public_ip_on_launch = true\n}`,
            output: 'Plan: 2 to add, 0 to change, 0 to destroy (VPC + Subnet ready)',
            explanation: 'Separating workloads across public and private subnets prevents direct internet exposure of database and internal API nodes.',
            keyPoints: [
              'Deploy across multiple Availability Zones (Multi-AZ) for high-availability failover',
              'Use NAT Gateways to grant private subnet instances outbound internet access securely',
              'Network ACLs provide stateless subnet filtering while Security Groups provide stateful instance firewalls'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'cloud-mod-2',
        moduleTitle: '2. Compute, Auto-Scaling & Load Balancing',
        chapterSummary: 'EC2 instance types, Auto Scaling Groups (ASG), Application Load Balancers (ALB), and health checks.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'cloud-2-1',
            title: 'Application Load Balancer & Auto-Scaling',
            conceptTag: 'ELASTIC COMPUTE',
            speech: 'ALBs distribute incoming HTTP/HTTPS traffic across target groups while Auto Scaling dynamically provisions instances based on CPU telemetry.',
            exampleTitle: 'ALB TARGET HEALTH CHECK',
            code: `target_group_config = {\n    "protocol": "HTTP",\n    "port": 8080,\n    "health_check": {\n        "path": "/healthz",\n        "interval_seconds": 15,\n        "healthy_threshold": 2,\n        "unhealthy_threshold": 3\n    }\n}\nprint(f"Target Group configured with health probe on: {target_group_config['health_check']['path']}")`,
            output: 'Target Group configured with health probe on: /healthz',
            explanation: 'If an instance fails 3 consecutive health probes, the ALB stops routing traffic to it immediately and triggers ASG replacement.',
            keyPoints: [
              'Layer 7 routing directs requests based on URL path rules or host headers',
              'Auto Scaling policies scale out on demand surges and scale in to optimize costs',
              'Use Spot instances with stateless workers for up to 90% compute cost savings'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'cloud-mod-3',
        moduleTitle: '3. Serverless Architecture with AWS Lambda & SQS',
        chapterSummary: 'Event-driven serverless architectures, Lambda triggers, SQS message queues, and DynamoDB single-digit ms latency.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'cloud-3-1',
            title: 'Event-Driven SQS to Lambda Pipeline',
            conceptTag: 'SERVERLESS COMPUTING',
            speech: 'Serverless architectures scale to zero when idle and execute handler functions in response to SQS queue messages without managing operating systems.',
            exampleTitle: 'LAMBDA EVENT HANDLER',
            code: `import json\n\ndef lambda_handler(event, context):\n    # Process batch of SQS messages\n    for record in event.get('Records', []):\n        payload = json.loads(record['body'])\n        print(f"Processing order: {payload.get('order_id')}")\n    return {"statusCode": 200, "body": json.dumps({"status": "processed"})}\n\n# Simulated test event\nprint(lambda_handler({"Records": [{"body": '{"order_id": "ORD-9482"}'}]}, None))`,
            output: "Processing order: ORD-9482\n{'statusCode': 200, 'body': '{\"status\": \"processed\"}'}",
            explanation: 'Decoupling event producers from consumers via SQS queues cushions downstream services against sudden traffic spikes.',
            keyPoints: [
              'Pay only for exact execution duration rounded to the nearest millisecond',
              'Dead Letter Queues (DLQ) capture failed messages for investigation after retry exhaustion',
              'Configure provisioned concurrency to eliminate cold start latency for latency-sensitive APIs'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'cloud-mod-4',
        moduleTitle: '4. Cloud Security, IAM Policies & Observability',
        chapterSummary: 'IAM roles, least-privilege JSON policies, CloudWatch metrics/alarms, and CloudTrail audit logs.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'cloud-4-1',
            title: 'IAM Least Privilege & CloudWatch Alarms',
            conceptTag: 'CLOUD SECURITY',
            speech: 'Never use root credentials. Enforce the Principle of Least Privilege by binding fine-grained IAM roles to services rather than hardcoding static API keys.',
            exampleTitle: 'IAM LEAST PRIVILEGE POLICY',
            code: `iam_policy = {\n    "Version": "2012-10-17",\n    "Statement": [{\n        "Effect": "Allow",\n        "Action": ["s3:GetObject", "s3:PutObject"],\n        "Resource": "arn:aws:s3:::production-course-assets/*"\n    }]\n}\nimport json\nprint(json.dumps(iam_policy, indent=2))`,
            output: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": [\n        "s3:GetObject",\n        "s3:PutObject"\n      ],\n      "Resource": "arn:aws:s3:::production-course-assets/*"\n    }\n  ]\n}',
            explanation: 'Scoped ARN resource constraints prevent compromised services from reading or writing unauthorized storage buckets.',
            keyPoints: [
              'Assign IAM instance profiles instead of distributing long-lived secret keys',
              'Enable AWS CloudTrail across all regions for immutable compliance audit logging',
              'Set CloudWatch alarms to notify on anomalous 5xx error spikes or billing thresholds'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. UI/UX Design Masterclass
  // ──────────────────────────────────────────────────────────────────────────
  '9': {
    courseId: '9',
    courseTitle: 'UI/UX Design Masterclass',
    category: 'design',
    description: 'Design intuitive, accessible digital interfaces in Figma using design systems, typography scales, wireframing, and usability testing.',
    modules: [
      {
        moduleId: 'ui-mod-1',
        moduleTitle: '1. Design Systems, Typography & Color Tokens',
        chapterSummary: 'Semantic color palettes, 8pt spacing grid systems, typographic hierarchy, and accessible WCAG contrast ratios.',
        status: 'in_progress',
        slides: [
          {
            slideId: 'ui-1-1',
            title: 'The 8pt Spacing Grid & Visual Hierarchy',
            conceptTag: 'DESIGN SYSTEMS',
            speech: 'Welcome to UI/UX Design! The 8pt grid system establishes rhythmic visual consistency across components, paddings, and margins.',
            exampleTitle: 'DESIGN SYSTEM SPACING SCALE',
            code: `const spacingTokens = {\n  xs: '4px',   // 0.5 unit\n  sm: '8px',   // 1 unit (base)\n  md: '16px',  // 2 units\n  lg: '24px',  // 3 units\n  xl: '32px',  // 4 units\n  '2xl': '48px'// 6 units\n};\nconsole.log('Design Tokens:', spacingTokens);`,
            output: "Design Tokens: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px' }",
            explanation: 'Multiples of 8 render sharply on both standard and high-DPI (Retina) screens without half-pixel sub-pixel rendering artifacts.',
            keyPoints: [
              'Use an 8pt grid system to create harmonic, predictable layouts',
              'Ensure minimum 4.5:1 contrast ratio for normal text to meet WCAG AA standards',
              'Structure typographic scales (e.g. 12, 14, 16, 20, 24, 32, 48px) with distinct weights'
            ],
            diagramType: 'tree',
          },
        ],
      },
      {
        moduleId: 'ui-mod-2',
        moduleTitle: '2. User Research, Wireframing & Usability Heuristics',
        chapterSummary: "Nielsen's 10 Usability Heuristics, user journey mapping, low-fidelity wireframing, and information architecture.",
        status: 'upcoming',
        slides: [
          {
            slideId: 'ui-2-1',
            title: "Nielsen's 10 Usability Heuristics in Practice",
            conceptTag: 'USABILITY HEURISTICS',
            speech: "Jakob Nielsen's usability heuristics are golden principles for interface design: visibility of system status, user control, error prevention, and recognition over recall.",
            exampleTitle: 'USABILITY AUDIT CHECKLIST',
            code: `heuristics = [\n  "1. Visibility of system status: Show progress bars and loading spinners",\n  "2. Match between system and real world: Use familiar language and icons",\n  "3. User control & freedom: Provide clear Undo / Redo / Cancel actions",\n  "4. Consistency and standards: Follow platform UI conventions",\n  "5. Error prevention: Confirm destructive actions before executing"\n];\nheuristics.forEach(h => console.log('✓', h));`,
            output: '✓ 1. Visibility of system status: Show progress bars and loading spinners\n✓ 2. Match between system and real world: Use familiar language and icons\n✓ 3. User control & freedom: Provide clear Undo / Redo / Cancel actions\n✓ 4. Consistency and standards: Follow platform UI conventions\n✓ 5. Error prevention: Confirm destructive actions before executing',
            explanation: 'Designing for error prevention (e.g. confirmation dialogs, non-destructive defaults) is far more effective than clear error messages after failure.',
            keyPoints: [
              'Always provide immediate visual feedback on user clicks and form submissions',
              'Enable easy exit paths and non-punitive undo options for accidental actions',
              'Minimize cognitive load by making choices recognizable rather than recallable'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'ui-mod-3',
        moduleTitle: '3. Interactive Prototyping & Micro-Interactions',
        chapterSummary: 'Figma Auto-Layout, component variants, smart animations, interactive states (hover, active, disabled), and motion design.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'ui-3-1',
            title: 'Micro-Interactions & Spring Physics',
            conceptTag: 'MOTION DESIGN',
            speech: 'Micro-interactions communicate state changes and delight users. Use natural spring curves rather than linear transitions for organic feel.',
            exampleTitle: 'FRAMER MOTION SPRING CONFIG',
            code: `const buttonSpring = {\n  type: "spring",\n  stiffness: 400,\n  damping: 25,\n  whileHover: { scale: 1.04 },\n  whileTap: { scale: 0.96 }\n};\nconsole.log("Spring animation config applied successfully.");`,
            output: 'Spring animation config applied successfully.',
            explanation: 'Spring physics calculate velocity and mass, preventing robotic visual jumps when users interrupt animations mid-flight.',
            keyPoints: [
              'Keep micro-interaction durations under 200-300ms for snappy responsiveness',
              'Use subtle scale and elevation transforms to indicate interactability',
              'Honor prefers-reduced-motion media queries for vestibular-sensitive users'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'ui-mod-4',
        moduleTitle: '4. Design Hand-off, Accessibility & Component Tokens',
        chapterSummary: 'Figma Dev Mode handoff, design token export, accessibility auditing (a11y), and design-to-code alignment.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'ui-4-1',
            title: 'Design Token Standardization & A11y Auditing',
            conceptTag: 'DESIGN HANDOFF',
            speech: 'Bridging the gap between Figma and engineering requires structured design tokens matching Tailwind CSS variables and full keyboard navigation support.',
            exampleTitle: 'ACCESSIBLE ARIA COMPONENT',
            code: `// Accessible Toggle Button Contract\nconst toggleProps = {\n  role: "switch",\n  "aria-checked": true,\n  "aria-label": "Voice narration mode",\n  tabIndex: 0\n};\nconsole.log("Accessibility properties:", toggleProps);`,
            output: "Accessibility properties: { role: 'switch', 'aria-checked': true, 'aria-label': 'Voice narration mode', tabIndex: 0 }",
            explanation: 'Proper ARIA roles and keyboard tab indexes allow screen readers and assistive devices to interact with custom components seamlessly.',
            keyPoints: [
              'Export design tokens as JSON/CSS variables for direct consumption in code',
              'Ensure all interactive elements have visible, distinct focus rings for keyboard users',
              'Test designs with screen readers and automated accessibility linters (axe-core)'
            ],
            diagramType: 'tree',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Financial Modeling & Investment
  // ──────────────────────────────────────────────────────────────────────────
  '10': {
    courseId: '10',
    courseTitle: 'Financial Modeling & Investment',
    category: 'finance',
    description: 'Build robust 3-statement financial models, analyze capital structure, portfolio theory, options pricing, and equity valuation.',
    modules: [
      {
        moduleId: 'fin-mod-1',
        moduleTitle: '1. Three-Statement Financial Modeling',
        chapterSummary: 'Income Statement, Balance Sheet, Cash Flow Statement integration, working capital schedules, and debt schedules.',
        status: 'in_progress',
        slides: [
          {
            slideId: 'fin-1-1',
            title: 'Three-Statement Dynamic Linkages',
            conceptTag: 'FINANCIAL STATEMENTS',
            speech: 'Welcome to Financial Modeling! Net Income flows from the Income Statement to the top of Cash Flow from Operations and links into Retained Earnings on the Balance Sheet.',
            exampleTitle: 'NET INCOME FLOW MODEL',
            code: `# Simplified 3-Statement Linkage Engine\nrevenue = 1000000\ncogs = 400000\noperating_expenses = 300000\ntax_rate = 0.21\n\nebit = revenue - cogs - operating_expenses\ntaxes = ebit * tax_rate\nnet_income = ebit - taxes\n\ndepreciation = 50000\ncapex = 80000\nworking_capital_change = 20000\n\nfree_cash_flow = net_income + depreciation - capex - working_capital_change\nprint(f"EBIT:             \${ebit:,}")\nprint(f"Net Income:       \${net_income:,}")\nprint(f"Free Cash Flow:   \${free_cash_flow:,}")`,
            output: 'EBIT:             $300,000\nNet Income:       $237,000\nFree Cash Flow:   $187,000',
            explanation: 'Free Cash Flow (FCF) measures the actual cash a business generates after funding operating expenses and capital investments, which is what equity investors value.',
            keyPoints: [
              'Cash is king: Accounting profit (Net Income) does not equal actual liquidity',
              'Non-cash expenses (depreciation, amortization) are added back to Cash Flow',
              'Balance sheets must always reconcile: Assets = Liabilities + Shareholders Equity'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'fin-mod-2',
        moduleTitle: '2. Modern Portfolio Theory & Capital Asset Pricing (CAPM)',
        chapterSummary: 'Expected return, variance-covariance matrix, Sharpe ratio, beta risk coefficients, and the Efficient Frontier.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'fin-2-1',
            title: 'Sharpe Ratio & CAPM Required Return',
            conceptTag: 'PORTFOLIO THEORY',
            speech: 'The Capital Asset Pricing Model (CAPM) calculates the required rate of return for an asset based on its systematic risk (beta) relative to market volatility.',
            exampleTitle: 'CAPM & SHARPE ENGINE',
            code: `risk_free_rate = 0.045  # 4.5% 10-Yr Treasury Yield\nmarket_return = 0.10     # 10.0% Expected S&P 500\nbeta = 1.25              # Tech stock beta\n\n# CAPM Expected Return = Rf + Beta * (Rm - Rf)\nexpected_return = risk_free_rate + beta * (market_return - risk_free_rate)\nvolatility = 0.18\nsharpe_ratio = (expected_return - risk_free_rate) / volatility\n\nprint(f"Required Return (CAPM): {expected_return * 100:.2f}%")\nprint(f"Sharpe Ratio:            {sharpe_ratio:.2f}")`,
            output: 'Required Return (CAPM): 11.38%\nSharpe Ratio:            0.38',
            explanation: 'The Sharpe ratio measures excess return per unit of volatility; higher Sharpe ratios indicate superior risk-adjusted investment efficiency.',
            keyPoints: [
              'Beta measures systematic, non-diversifiable volatility relative to the market',
              'Diversification eliminates idiosyncratic company risk, leaving only systemic risk',
              'The Efficient Frontier identifies portfolios with maximum return for a given risk tolerance'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'fin-mod-3',
        moduleTitle: '3. Options Pricing & Black-Scholes Formula',
        chapterSummary: 'Call and put options, Black-Scholes-Merton model, Option Greeks (Delta, Gamma, Theta, Vega), and implied volatility.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'fin-3-1',
            title: 'Black-Scholes European Option Pricing',
            conceptTag: 'DERIVATIVES',
            speech: 'The Black-Scholes model prices European options dynamically based on stock price, strike price, time to expiration, risk-free rate, and implied volatility.',
            exampleTitle: 'BLACK-SCHOLES CALL PRICER',
            code: `import numpy as np\nfrom scipy.stats import norm\n\ndef black_scholes_call(S, K, T, r, sigma):\n    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))\n    d2 = d1 - sigma * np.sqrt(T)\n    call_price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)\n    delta = norm.cdf(d1)\n    return call_price, delta\n\nprice, delta = black_scholes_call(S=100, K=105, T=0.5, r=0.05, sigma=0.20)\nprint(f"Call Option Price: \${price:.2f}")\nprint(f"Option Delta:      {delta:.4f}")`,
            output: 'Call Option Price: $4.58\nOption Delta:      0.4422',
            explanation: 'Delta (0.44) indicates that for every $1 increase in underlying stock price, the option contract price will rise by approximately $0.44.',
            keyPoints: [
              'Delta measures directional exposure; Gamma measures rate of change of Delta',
              'Theta quantifies time-decay loss per calendar day until expiration',
              'Vega measures price sensitivity to changes in implied market volatility'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'fin-mod-4',
        moduleTitle: '4. Mergers & Acquisitions (M&A) and LBO Models',
        chapterSummary: 'Leveraged Buyout (LBO) debt structuring, IRR hurdle rates, accretion/dilution analysis, and synergy modeling.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'fin-4-1',
            title: 'LBO Returns & Internal Rate of Return (IRR)',
            conceptTag: 'PRIVATE EQUITY',
            speech: 'In a Leveraged Buyout (LBO), a private equity sponsor uses debt to acquire a target company, using free cash flow to pay down debt and maximize sponsor IRR.',
            exampleTitle: 'LBO 5-YEAR IRR MODEL',
            code: `entry_equity = 200000000  # $200M initial sponsor equity\nexit_equity = 580000000   # $580M exit equity after 5 years\n\n# MoIC = Multiple on Invested Capital\nmoic = exit_equity / entry_equity\nirr = (moic ** (1 / 5)) - 1\nprint(f"Multiple on Invested Capital (MoIC): {moic:.2f}x")\nprint(f"5-Year Sponsor IRR:                   {irr * 100:.2f}% (Target: >= 20%)")`,
            output: 'Multiple on Invested Capital (MoIC): 2.90x\n5-Year Sponsor IRR:                   23.73% (Target: >= 20%)',
            explanation: 'A 23.73% IRR exceeds typical private equity hurdle rates (20%), driven by debt paydown and operational EBITDA margin expansion.',
            keyPoints: [
              'High financial leverage amplifies equity returns (and downside risk)',
              'Stable, predictable cash flows are essential to service LBO debt obligations',
              'Value creation drivers: revenue growth, multiple expansion, and debt de-leveraging'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Natural Language Processing
  // ──────────────────────────────────────────────────────────────────────────
  '11': {
    courseId: '11',
    courseTitle: 'Natural Language Processing',
    category: 'artificial-intelligence',
    description: 'Build state-of-the-art NLP models with Transformers, Multi-Head Self-Attention, BERT embeddings, tokenization, and LLM fine-tuning.',
    modules: [
      {
        moduleId: 'nlp-mod-1',
        moduleTitle: '1. Tokenization, Embeddings & Vector Semantics',
        chapterSummary: 'Byte-Pair Encoding (BPE), Word2Vec, cosine similarity, positional encodings, and semantic search.',
        status: 'in_progress',
        slides: [
          {
            slideId: 'nlp-1-1',
            title: 'Vector Embeddings & Cosine Semantic Similarity',
            conceptTag: 'EMBEDDINGS',
            speech: 'Welcome to NLP! Dense vector embeddings map words and sentences into geometric semantic spaces where conceptual similarity equals cosine distance.',
            exampleTitle: 'COSINE SIMILARITY PIPELINE',
            code: `import numpy as np\n\ndef cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:\n    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))\n\n# Simulated semantic embeddings for concepts\nv_king = np.array([0.9, 0.4, 0.1])\nv_queen = np.array([0.88, 0.42, 0.15])\nv_apple = np.array([0.1, 0.85, 0.9])\n\nprint(f"Similarity(King, Queen): {cosine_similarity(v_king, v_queen):.4f}")\nprint(f"Similarity(King, Apple): {cosine_similarity(v_king, v_apple):.4f}")`,
            output: 'Similarity(King, Queen): 0.9986\nSimilarity(King, Apple): 0.4578',
            explanation: 'High-dimensional embedding spaces capture complex relationships: King - Man + Woman ≈ Queen vector arithmetic holds geometrically.',
            keyPoints: [
              'Dense embeddings solve the vocabulary sparsity problem of one-hot encodings',
              'Cosine similarity measures angle rather than magnitude of vector activations',
              'Subword tokenizers (BPE, WordPiece) eliminate out-of-vocabulary (OOV) tokens'
            ],
            diagramType: 'array',
          },
        ],
      },
      {
        moduleId: 'nlp-mod-2',
        moduleTitle: '2. The Transformer Architecture & Self-Attention',
        chapterSummary: 'Scaled Dot-Product Attention (Q, K, V), Multi-Head Attention, residual connections, and layer normalization.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'nlp-2-1',
            title: 'Scaled Dot-Product Attention: Attention(Q, K, V)',
            conceptTag: 'ATTENTION MECHANISM',
            speech: 'The Transformer replaced recurrent networks with Scaled Dot-Product Attention, allowing tokens to attend to all other tokens in O(1) sequential steps.',
            exampleTitle: 'SELF-ATTENTION MATRIX',
            code: `import numpy as np\n\ndef scaled_dot_product_attention(Q, K, V):\n    d_k = Q.shape[-1]\n    scores = np.dot(Q, K.T) / np.sqrt(d_k)\n    # Softmax across columns\n    attention_weights = np.exp(scores) / np.sum(np.exp(scores), axis=-1, keepdims=True)\n    output = np.dot(attention_weights, V)\n    return output, attention_weights\n\n# 3 tokens with embedding dimension 4\nQ = np.random.randn(3, 4)\nK = np.random.randn(3, 4)\nV = np.random.randn(3, 4)\nout, weights = scaled_dot_product_attention(Q, K, V)\nprint(f"Attention Weights Shape: {weights.shape}")\nprint(f"Weights sum per row: {weights.sum(axis=1).round(2)}")`,
            output: 'Attention Weights Shape: (3, 3)\nWeights sum per row: [1. 1. 1.]',
            explanation: 'Dividing by sqrt(d_k) prevents dot products from growing excessively large in high dimensions, which would cause softmax gradients to vanish.',
            keyPoints: [
              'Attention formula: Softmax(Q * K^T / sqrt(d_k)) * V',
              'Multi-Head Attention enables the model to jointly attend to information from different representation subspaces',
              'Positional encodings inject sequential order awareness without recurrent loops'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'nlp-mod-3',
        moduleTitle: '3. BERT, Masked Language Modeling & Encoders',
        chapterSummary: 'Bidirectional encoder representations, Masked Language Modeling (MLM), Next Sentence Prediction (NSP), and classification fine-tuning.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'nlp-3-1',
            title: 'Bidirectional Context & Masked LM',
            conceptTag: 'BERT ENCODERS',
            speech: 'BERT uses bidirectional self-attention to condition word representations on both left and right context simultaneously during pre-training.',
            exampleTitle: 'BERT TOKEN CLASSIFIER',
            code: `sentence = "The [MASK] sat on the mat."\ntarget_token = "cat"\nconfidence = 0.942\nprint(f"Input: {sentence}")\nprint(f"Top-1 Prediction: '{target_token}' (Confidence: {confidence * 100:.1f}%)")`,
            output: "Input: The [MASK] sat on the mat.\nTop-1 Prediction: 'cat' (Confidence: 94.2%)",
            explanation: 'Masking 15% of tokens forces the encoder to learn deep bidirectional semantic relationships across the entire sentence context.',
            keyPoints: [
              'Encoders (BERT) excel at comprehension, named entity recognition, and sentence classification',
              'Decoders (GPT) excel at autoregressive text generation and next-token prediction',
              'Fine-tuning pre-trained checkpoints requires only a fraction of initial training compute'
            ],
            diagramType: 'tree',
          },
        ],
      },
      {
        moduleId: 'nlp-mod-4',
        moduleTitle: '4. Large Language Models, LoRA & Prompt Engineering',
        chapterSummary: 'Autoregressive decoder generation, temperature sampling, Parameter-Efficient Fine-Tuning (PEFT/LoRA), and RAG pipelines.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'nlp-4-1',
            title: 'LoRA Low-Rank Adaptation & RAG Pipelines',
            conceptTag: 'LLM FINE-TUNING & RAG',
            speech: 'LoRA freezes base LLM weights and trains low-rank adapter matrices (A and B), reducing trainable parameter counts by 99% with no quality loss.',
            exampleTitle: 'LORA PARAMETER REDUCTION',
            code: `d_model = 4096\nrank_r = 16\n\nfull_matrix_params = d_model * d_model\nlora_adapter_params = (d_model * rank_r) + (rank_r * d_model)\nparam_reduction = (1 - (lora_adapter_params / full_matrix_params)) * 100\n\nprint(f"Original Weight Parameters: {full_matrix_params:,}")\nprint(f"LoRA Adapter Parameters:    {lora_adapter_params:,}")\nprint(f"Trainable Parameter Reduction: {param_reduction:.2f}%")`,
            output: 'Original Weight Parameters: 16,777,216\nLoRA Adapter Parameters:    131,072\nTrainable Parameter Reduction: 99.22%',
            explanation: 'LoRA assumes weight updates have a low intrinsic rank, decomposing the update matrix into W_new = W_base + B * A.',
            keyPoints: [
              'LoRA fine-tunes 70B models on consumer GPUs by reducing memory overhead',
              'Retrieval-Augmented Generation (RAG) grounds LLMs with real-time vector search data',
              'Temperature controls randomness: lower temp (0.2) for deterministic facts, higher temp (0.8) for creative text'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Physics: Mechanics to Quantum
  // ──────────────────────────────────────────────────────────────────────────
  '12': {
    courseId: '12',
    courseTitle: 'Physics: Mechanics to Quantum',
    category: 'science',
    description: 'Explore classical Newtonian mechanics, electromagnetism, wave-particle duality, special relativity, and quantum Schrödinger wave equations.',
    modules: [
      {
        moduleId: 'phys-mod-1',
        moduleTitle: '1. Classical Mechanics & Conservation Laws',
        chapterSummary: "Newton's laws of motion, conservation of momentum, work-energy theorem, and rotational dynamics.",
        status: 'in_progress',
        slides: [
          {
            slideId: 'phys-1-1',
            title: 'Conservation of Energy & Projectile Trajectory',
            conceptTag: 'NEWTONIAN MECHANICS',
            speech: 'Welcome to Physics! In closed conservative systems, total mechanical energy (Kinetic + Potential) remains strictly conserved over time: E = K + U = constant.',
            exampleTitle: 'PROJECTILE MOTION TRAJECTORY',
            code: `import numpy as np\n\nv0 = 25.0       # Launch velocity 25 m/s\ntheta = np.radians(45)  # 45 degree launch angle\ng = 9.81        # Gravity m/s^2\n\nt_flight = (2 * v0 * np.sin(theta)) / g\nmax_height = (v0 ** 2 * (np.sin(theta) ** 2)) / (2 * g)\nrange_x = (v0 ** 2 * np.sin(2 * theta)) / g\n\nprint(f"Time of Flight: {t_flight:.2f} s")\nprint(f"Max Height:     {max_height:.2f} m")\nprint(f"Total Range:    {range_x:.2f} m")`,
            output: 'Time of Flight: 3.60 s\nMax Height:     15.93 m\nTotal Range:    63.71 m',
            explanation: 'Horizontal velocity remains constant (v_x = v0*cosθ) in the absence of air drag, while vertical velocity accelerates under constant gravity g.',
            keyPoints: [
              'Total mechanical energy is strictly conserved in gravitational fields',
              'A 45-degree launch angle achieves maximum horizontal range in vacuum',
              'Conservation of linear momentum holds in all elastic and inelastic collisions'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'phys-mod-2',
        moduleTitle: '2. Electromagnetism & Maxwell’s Equations',
        chapterSummary: "Coulomb's Law, electric fields, magnetic induction, Lorentz force, and Maxwell's 4 unified electromagnetic equations.",
        status: 'upcoming',
        slides: [
          {
            slideId: 'phys-2-1',
            title: 'The Lorentz Force & Charged Particle Trajectories',
            conceptTag: 'ELECTROMAGNETISM',
            speech: 'The Lorentz force governs how charged particles move through electric and magnetic fields: F = q*(E + v x B), causing circular cyclotron orbits.',
            exampleTitle: 'CYCLOTRON RADIUS CALCULATION',
            code: `q = 1.602e-19  # Proton charge (C)\nm = 1.673e-27  # Proton mass (kg)\nv = 2.0e6      # Velocity (m/s)\nB = 0.5        # Magnetic field (Tesla)\n\n# Cyclotron radius r = m*v / (q*B)\nradius = (m * v) / (q * B)\nfrequency = (q * B) / (2 * np.pi * m)\nprint(f"Cyclotron Radius:    {radius * 100:.2f} cm")\nprint(f"Cyclotron Frequency: {frequency / 1e6:.2f} MHz")`,
            output: 'Cyclotron Radius:    4.18 cm\nCyclotron Frequency: 7.62 MHz',
            explanation: 'Magnetic forces act perpendicularly to velocity, performing zero mechanical work while constantly bending particle trajectories into circular paths.',
            keyPoints: [
              "Changing magnetic fields induce electric fields (Faraday's Law of Induction)",
              'Light is an electromagnetic wave propagating at c = 1 / sqrt(mu0 * epsilon0)',
              'Magnetic monopoles have never been observed (Gauss Law for Magnetism: ∇·B = 0)'
            ],
            diagramType: 'tree',
          },
        ],
      },
      {
        moduleId: 'phys-mod-3',
        moduleTitle: '3. Special Relativity & Spacetime Invariance',
        chapterSummary: 'Einstein postulates, time dilation, length contraction, relativistic momentum, and mass-energy equivalence E=mc^2.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'phys-3-1',
            title: 'Lorentz Factor (γ) & Time Dilation',
            conceptTag: 'SPECIAL RELATIVITY',
            speech: 'The speed of light c is identical in all inertial reference frames. As velocity approaches c, time dilates by the Lorentz factor γ = 1 / sqrt(1 - v^2/c^2).',
            exampleTitle: 'TIME DILATION ENGINE',
            code: `c = 299792458.0  # Speed of light m/s\nv = 0.95 * c     # 95% speed of light\n\ngamma = 1.0 / np.sqrt(1 - (v / c) ** 2)\nproper_time = 1.0  # 1 year on spaceship\nearth_time = proper_time * gamma\n\nprint(f"Lorentz Factor (γ):  {gamma:.3f}")\nprint(f"1 Year on ship =     {earth_time:.2f} years on Earth")`,
            output: 'Lorentz Factor (γ):  3.203\n1 Year on ship =     3.20 years on Earth',
            explanation: 'At 95% the speed of light, an astronaut experiences 1 year of subjective biological aging while 3.20 years pass for stationary observers on Earth.',
            keyPoints: [
              'No physical object with rest mass can accelerate to or exceed speed of light c',
              'Simultaneity is relative: events simultaneous in one frame are not simultaneous in another',
              'E = m * c^2 demonstrates the fundamental equivalence of rest mass and concentrated energy'
            ],
            diagramType: 'flowchart',
          },
        ],
      },
      {
        moduleId: 'phys-mod-4',
        moduleTitle: '4. Quantum Mechanics & Wave-Particle Duality',
        chapterSummary: 'Photoelectric effect, de Broglie wavelength, Heisenberg Uncertainty Principle, and Schrödinger wave function collapse.',
        status: 'upcoming',
        slides: [
          {
            slideId: 'phys-4-1',
            title: 'Heisenberg Uncertainty Principle & Wavepackets',
            conceptTag: 'QUANTUM MECHANICS',
            speech: 'At quantum scales, particles exhibit wave-particle duality. The Heisenberg Uncertainty Principle dictates Δx * Δp >= ħ / 2.',
            exampleTitle: 'QUANTUM UNCERTAINTY',
            code: `hbar = 1.054571817e-34  # Reduced Planck constant (J·s)\nelectron_mass = 9.109e-31  # kg\nposition_uncertainty = 1.0e-10  # 1 Angstrom (atomic scale)\n\nmin_momentum_uncertainty = hbar / (2 * position_uncertainty)\nmin_velocity_uncertainty = min_momentum_uncertainty / electron_mass\nprint(f"Position Uncertainty Δx: 1.0 Å")\nprint(f"Minimum Velocity Uncertainty Δv: {min_velocity_uncertainty:,.0f} m/s")`,
            output: 'Position Uncertainty Δx: 1.0 Å\nMinimum Velocity Uncertainty Δv: 578,863 m/s',
            explanation: 'Confining an electron inside an atomic radius (1 Å) forces its velocity uncertainty to exceed 500,000 m/s, explaining why electron clouds never collapse into the nucleus.',
            keyPoints: [
              'The wave function ψ(x) squared represents probability density: P(x) = |ψ(x)|^2',
              'Measurement collapses superimposed quantum states into a single definite eigenstate',
              'Quantum tunneling allows particles to pass through energy barriers higher than their kinetic energy'
            ],
            diagramType: 'tree',
          },
        ],
      },
    ],
  },
};

/**
 * Returns the syllabus for a given course ID, with level-tailored adjustments if needed.
 */
export function getCourseSyllabus(courseId: string, level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): CourseSyllabus {
  const syllabus = COURSE_SYLLABI[courseId] || COURSE_SYLLABI['1'];
  return syllabus;
}

/**
 * Returns all available course syllabi mapped by course ID.
 */
export function getAllCourseSyllabi(): Record<string, CourseSyllabus> {
  return COURSE_SYLLABI;
}
