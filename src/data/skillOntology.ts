import { CanonicalSkill, LearningDistanceLevel, SkillCategory } from '../types';

export const CANONICAL_SKILLS: CanonicalSkill[] = [
  // Programming Languages
  {
    id: 'lang-python',
    name: 'Python',
    category: 'Programming Languages',
    aliases: ['python', 'py', 'python3', 'python 3'],
    description: 'General-purpose, high-level language widely used in backend, data engineering, and machine learning.',
    childSkills: ['FastAPI', 'Flask', 'Django', 'Pandas', 'PyTorch']
  },
  {
    id: 'lang-typescript',
    name: 'TypeScript',
    category: 'Programming Languages',
    aliases: ['typescript', 'ts'],
    description: 'Typed superset of JavaScript providing compile-time type safety for web and server applications.',
    childSkills: ['React', 'Next.js', 'Node.js', 'NestJS']
  },
  {
    id: 'lang-javascript',
    name: 'JavaScript',
    category: 'Programming Languages',
    aliases: ['javascript', 'js', 'es6', 'ecmascript'],
    description: 'Dynamic scripting language standard for web browsers and Node.js environments.'
  },
  {
    id: 'lang-golang',
    name: 'Go',
    category: 'Programming Languages',
    aliases: ['golang', 'go lang', 'go'],
    description: 'Statically typed, compiled language developed by Google optimized for concurrency and microservices.'
  },
  {
    id: 'lang-java',
    name: 'Java',
    category: 'Programming Languages',
    aliases: ['java', 'jdk', 'jvm'],
    description: 'Object-oriented programming language designed for platform-independent enterprise systems.',
    childSkills: ['Spring Boot']
  },
  {
    id: 'lang-rust',
    name: 'Rust',
    category: 'Programming Languages',
    aliases: ['rust', 'rustlang'],
    description: 'Systems programming language focused on memory safety without garbage collection.'
  },
  {
    id: 'lang-sql',
    name: 'SQL',
    category: 'Programming Languages',
    aliases: ['sql', 'structured query language', 'ansi sql'],
    description: 'Standard language for storing, manipulating and retrieving data in relational databases.'
  },
  {
    id: 'lang-cplusplus',
    name: 'C++',
    category: 'Programming Languages',
    aliases: ['c++', 'cpp'],
    description: 'High-performance general-purpose programming language widely used in systems and high-throughput engines.'
  },

  // Frameworks & Libraries
  {
    id: 'fw-react',
    name: 'React',
    category: 'Frameworks & Libraries',
    aliases: ['react', 'reactjs', 'react.js'],
    description: 'Declarative, component-based frontend library for building modern user interfaces.',
    parentSkills: ['TypeScript', 'JavaScript'],
    childSkills: ['Next.js']
  },
  {
    id: 'fw-nextjs',
    name: 'Next.js',
    category: 'Frameworks & Libraries',
    aliases: ['nextjs', 'next.js', 'next'],
    description: 'React framework enabling server-side rendering, static site generation, and full-stack routing.',
    parentSkills: ['React', 'TypeScript']
  },
  {
    id: 'fw-fastapi',
    name: 'FastAPI',
    category: 'Frameworks & Libraries',
    aliases: ['fastapi', 'fast-api'],
    description: 'Modern, high-performance web framework for building APIs with Python based on standard type hints.',
    parentSkills: ['Python', 'REST APIs']
  },
  {
    id: 'fw-django',
    name: 'Django',
    category: 'Frameworks & Libraries',
    aliases: ['django', 'django rest framework', 'drf'],
    description: 'High-level Python web framework that encourages rapid development and clean design.',
    parentSkills: ['Python']
  },
  {
    id: 'fw-flask',
    name: 'Flask',
    category: 'Frameworks & Libraries',
    aliases: ['flask', 'flask-restful'],
    description: 'Micro web framework written in Python for lightweight microservices.',
    parentSkills: ['Python']
  },
  {
    id: 'fw-nodejs',
    name: 'Node.js',
    category: 'Frameworks & Libraries',
    aliases: ['nodejs', 'node.js', 'node'],
    description: 'JavaScript runtime built on Chrome V8 engine for asynchronous server execution.'
  },
  {
    id: 'fw-vue',
    name: 'Vue.js',
    category: 'Frameworks & Libraries',
    aliases: ['vue', 'vuejs', 'vue.js', 'vue3'],
    description: 'Progressive JavaScript framework for building user interfaces.'
  },
  {
    id: 'fw-express',
    name: 'Express.js',
    category: 'Frameworks & Libraries',
    aliases: ['express', 'expressjs', 'express.js'],
    description: 'Minimalist web framework for Node.js.'
  },
  {
    id: 'fw-spring',
    name: 'Spring Boot',
    category: 'Frameworks & Libraries',
    aliases: ['springboot', 'spring boot', 'spring framework'],
    description: 'Enterprise Java framework for building stand-alone production-grade microservices.',
    parentSkills: ['Java']
  },

  // Databases & Storage
  {
    id: 'db-postgresql',
    name: 'PostgreSQL',
    category: 'Databases & Storage',
    aliases: ['postgresql', 'postgres', 'postgre sql', 'pg'],
    description: 'Open-source object-relational database system with strong reliability, ACID compliance, and pgvector support.',
    parentSkills: ['SQL']
  },
  {
    id: 'db-mysql',
    name: 'MySQL',
    category: 'Databases & Storage',
    aliases: ['mysql', 'my-sql'],
    description: 'Widely used relational database management system.',
    parentSkills: ['SQL']
  },
  {
    id: 'db-redis',
    name: 'Redis',
    category: 'Databases & Storage',
    aliases: ['redis', 'redis cache', 'valkey'],
    description: 'In-memory data structure store used as a distributed cache, message broker, and streaming engine.'
  },
  {
    id: 'db-mongodb',
    name: 'MongoDB',
    category: 'Databases & Storage',
    aliases: ['mongodb', 'mongo', 'mongo db'],
    description: 'Document-oriented NoSQL database for flexible, JSON-like document modeling.'
  },
  {
    id: 'db-cassandra',
    name: 'Apache Cassandra',
    category: 'Databases & Storage',
    aliases: ['cassandra', 'apache cassandra'],
    description: 'Distributed NoSQL database designed to handle large amounts of data across multiple commodity servers.'
  },
  {
    id: 'db-elasticsearch',
    name: 'Elasticsearch',
    category: 'Databases & Storage',
    aliases: ['elasticsearch', 'elastic search', 'opensearch'],
    description: 'Distributed search and analytics engine for full-text and log search.'
  },
  {
    id: 'db-snowflake',
    name: 'Snowflake',
    category: 'Databases & Storage',
    aliases: ['snowflake', 'snowflake data warehouse'],
    description: 'Cloud-based data storage and analytics service.'
  },

  // Cloud & DevOps
  {
    id: 'cloud-aws',
    name: 'AWS',
    category: 'Cloud & DevOps',
    aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
    description: 'Comprehensive cloud computing platform offering compute, storage, databases, and AI services.'
  },
  {
    id: 'cloud-gcp',
    name: 'Google Cloud Platform (GCP)',
    category: 'Cloud & DevOps',
    aliases: ['gcp', 'google cloud', 'google cloud platform', 'cloud run', 'gke'],
    description: 'Cloud suite running on Google infrastructure offering compute, BigQuery, and Vertex AI.'
  },
  {
    id: 'cloud-azure',
    name: 'Microsoft Azure',
    category: 'Cloud & DevOps',
    aliases: ['azure', 'microsoft azure', 'azure devops'],
    description: 'Enterprise cloud services platform by Microsoft for building, testing, and deploying applications.'
  },
  {
    id: 'devops-docker',
    name: 'Docker',
    category: 'Cloud & DevOps',
    aliases: ['docker', 'containerization', 'containers'],
    description: 'Platform for developing, shipping, and running applications in lightweight isolated containers.',
    childSkills: ['Kubernetes']
  },
  {
    id: 'devops-kubernetes',
    name: 'Kubernetes',
    category: 'Cloud & DevOps',
    aliases: ['kubernetes', 'k8s', 'kube'],
    description: 'Production-grade container orchestration system for automating application deployment, scaling, and operations.',
    parentSkills: ['Docker']
  },
  {
    id: 'devops-terraform',
    name: 'Terraform',
    category: 'Cloud & DevOps',
    aliases: ['terraform', 'iac', 'infrastructure as code'],
    description: 'Open-source infrastructure as code software tool created by HashiCorp.'
  },
  {
    id: 'devops-cicd',
    name: 'CI/CD Pipelines',
    category: 'Cloud & DevOps',
    aliases: ['cicd', 'ci/cd', 'github actions', 'gitlab ci', 'jenkins'],
    description: 'Continuous Integration and Continuous Deployment automation for software delivery.'
  },
  {
    id: 'devops-linux',
    name: 'Linux',
    category: 'Cloud & DevOps',
    aliases: ['linux', 'unix', 'bash', 'shell scripting'],
    description: 'Open-source Unix-like operating system family underlying modern cloud servers.'
  },

  // Machine Learning & AI
  {
    id: 'ml-pytorch',
    name: 'PyTorch',
    category: 'Machine Learning & AI',
    aliases: ['pytorch', 'torch'],
    description: 'Deep learning framework facilitating transition from research prototyping to production deployment.',
    parentSkills: ['Python']
  },
  {
    id: 'ml-tensorflow',
    name: 'TensorFlow',
    category: 'Machine Learning & AI',
    aliases: ['tensorflow', 'tf', 'keras'],
    description: 'End-to-end open source machine learning platform by Google.',
    parentSkills: ['Python']
  },
  {
    id: 'ml-scikit',
    name: 'scikit-learn',
    category: 'Machine Learning & AI',
    aliases: ['scikit-learn', 'sklearn', 'scikit learn'],
    description: 'Machine learning library featuring classification, regression, and clustering algorithms.',
    parentSkills: ['Python']
  },
  {
    id: 'ml-llm',
    name: 'Large Language Models (LLMs)',
    category: 'Machine Learning & AI',
    aliases: ['llm', 'llms', 'genai', 'generative ai', 'prompt engineering', 'rag'],
    description: 'Generative AI architectures, RAG pipelines, fine-tuning, and prompt optimization.'
  },
  {
    id: 'ml-nlp',
    name: 'Natural Language Processing (NLP)',
    category: 'Machine Learning & AI',
    aliases: ['nlp', 'text processing', 'spacy', 'nltk', 'huggingface', 'transformers'],
    description: 'Techniques for processing, analyzing, and generating human language data.'
  },
  {
    id: 'ml-pandas',
    name: 'Pandas',
    category: 'Machine Learning & AI',
    aliases: ['pandas', 'numpy'],
    description: 'Fast, powerful, flexible open source data analysis and manipulation tool.',
    parentSkills: ['Python']
  },
  {
    id: 'ml-spark',
    name: 'Apache Spark',
    category: 'Machine Learning & AI',
    aliases: ['spark', 'apache spark', 'pyspark'],
    description: 'Unified analytics engine for large-scale data processing and distributed computing.'
  },

  // Architecture & APIs
  {
    id: 'arch-rest',
    name: 'REST APIs',
    category: 'Architecture & APIs',
    aliases: ['rest', 'restful', 'rest api', 'rest apis', 'http apis'],
    description: 'Architectural style for distributed hypermedia systems using standard HTTP methods.'
  },
  {
    id: 'arch-graphql',
    name: 'GraphQL',
    category: 'Architecture & APIs',
    aliases: ['graphql', 'apollo graphql'],
    description: 'Query language for APIs and runtime for fulfilling queries with existing data.'
  },
  {
    id: 'arch-microservices',
    name: 'Microservices',
    category: 'Architecture & APIs',
    aliases: ['microservices', 'distributed systems', 'service oriented architecture'],
    description: 'Architectural approach where applications are arranged as a collection of loosely coupled services.'
  },
  {
    id: 'arch-kafka',
    name: 'Apache Kafka',
    category: 'Architecture & APIs',
    aliases: ['kafka', 'apache kafka', 'event streaming'],
    description: 'Distributed event store and stream-processing platform for high-throughput pipelines.'
  },

  // Tools & Methodologies
  {
    id: 'tool-git',
    name: 'Git',
    category: 'Tools & Methodologies',
    aliases: ['git', 'github', 'version control'],
    description: 'Distributed version control system for tracking changes in source code during development.'
  },
  {
    id: 'tool-agile',
    name: 'Agile / Scrum',
    category: 'Tools & Methodologies',
    aliases: ['agile', 'scrum', 'kanban'],
    description: 'Iterative approach to project management and software development.'
  }
];

export interface TransferabilityRule {
  sourceSkill: string;
  targetSkill: string;
  transferScore: number; // 0.0 to 1.0 (typically 0.70 to 0.90)
  rationale: string;
}

export const TRANSFERABILITY_RULES: TransferabilityRule[] = [
  // Cloud providers
  {
    sourceSkill: 'Microsoft Azure',
    targetSkill: 'AWS',
    transferScore: 0.88,
    rationale: 'Core cloud primitives (Azure VMs/App Services, Blob Storage, CosmosDB, Azure IAM) directly map to AWS EC2, S3, DynamoDB, and AWS IAM.'
  },
  {
    sourceSkill: 'Google Cloud Platform (GCP)',
    targetSkill: 'AWS',
    transferScore: 0.86,
    rationale: 'Documented production architecture in GCP (Compute Engine, Cloud Run, GCS) translates quickly to AWS equivalents.'
  },
  {
    sourceSkill: 'AWS',
    targetSkill: 'Google Cloud Platform (GCP)',
    transferScore: 0.88,
    rationale: 'AWS distributed architecture experience transfers smoothly to Google Cloud abstractions.'
  },
  {
    sourceSkill: 'AWS',
    targetSkill: 'Microsoft Azure',
    transferScore: 0.88,
    rationale: 'AWS infrastructure knowledge translates directly to enterprise Azure resource management.'
  },

  // Deep Learning Frameworks
  {
    sourceSkill: 'PyTorch',
    targetSkill: 'TensorFlow',
    transferScore: 0.85,
    rationale: 'Both share computational graph concepts, autograd mechanics, tensor operations, and layer abstractions.'
  },
  {
    sourceSkill: 'TensorFlow',
    targetSkill: 'PyTorch',
    transferScore: 0.85,
    rationale: 'Deep neural network design and training experience translates across PyTorch and TensorFlow seamlessly.'
  },

  // Frontend Frameworks
  {
    sourceSkill: 'React',
    targetSkill: 'Vue.js',
    transferScore: 0.82,
    rationale: 'Component lifecycle, reactive state management, virtual DOM, and SPA routing principles are shared.'
  },
  {
    sourceSkill: 'Vue.js',
    targetSkill: 'React',
    transferScore: 0.82,
    rationale: 'Component architecture, one-way data flow, and modern composables translate to React hooks.'
  },

  // Backend Python Frameworks
  {
    sourceSkill: 'FastAPI',
    targetSkill: 'Flask',
    transferScore: 0.92,
    rationale: 'Both are lightweight WSGI/ASGI Python microframeworks utilizing routing, request/response models, and middleware.'
  },
  {
    sourceSkill: 'Flask',
    targetSkill: 'FastAPI',
    transferScore: 0.90,
    rationale: 'Flask API developers transition rapidly to FastAPI by adding Python type hints and Pydantic validation.'
  },
  {
    sourceSkill: 'Django',
    targetSkill: 'FastAPI',
    transferScore: 0.85,
    rationale: 'Strong Python backend fundamentals, ORM usage, and REST API design carry over cleanly.'
  },

  // Relational Databases
  {
    sourceSkill: 'PostgreSQL',
    targetSkill: 'MySQL',
    transferScore: 0.92,
    rationale: 'Standard ANSI SQL syntax, index optimization, foreign key constraints, and relational schema modeling apply equally.'
  },
  {
    sourceSkill: 'MySQL',
    targetSkill: 'PostgreSQL',
    transferScore: 0.90,
    rationale: 'Relational query optimization, transaction management, and indexing translate directly to PostgreSQL.'
  },

  // Container to Orchestration
  {
    sourceSkill: 'Docker',
    targetSkill: 'Kubernetes',
    transferScore: 0.72,
    rationale: 'Solid container lifecycle and networking fundamentals provide the mandatory foundation for Kubernetes pod and deployment concepts.'
  },

  // Languages
  {
    sourceSkill: 'TypeScript',
    targetSkill: 'JavaScript',
    transferScore: 1.0,
    rationale: 'TypeScript developers have full native command of JavaScript and modern ES syntax.'
  },
  {
    sourceSkill: 'Java',
    targetSkill: 'Go',
    transferScore: 0.75,
    rationale: 'Strong typed object-oriented and concurrent systems background aids fast ramp-up on Go concurrency and microservices.'
  }
];

/**
 * Normalizes an arbitrary skill string to canonical form
 */
export function normalizeSkill(rawSkill: string): CanonicalSkill | null {
  if (!rawSkill) return null;
  const cleaned = rawSkill.trim().toLowerCase();

  for (const skill of CANONICAL_SKILLS) {
    if (skill.name.toLowerCase() === cleaned) return skill;
    if (skill.aliases.some(alias => alias.toLowerCase() === cleaned)) return skill;
  }

  // Substring matching for edge cases (e.g. "python 3.10" -> "Python")
  for (const skill of CANONICAL_SKILLS) {
    for (const alias of skill.aliases) {
      if (cleaned.startsWith(alias) || cleaned.includes(alias)) {
        return skill;
      }
    }
  }

  return null;
}

/**
 * Checks for a transferable skill relationship
 */
export function checkTransferability(
  candidateSkills: string[],
  targetSkill: string
): { hasTransfer: boolean; sourceSkill?: string; transferScore?: number; rationale?: string } {
  const normTarget = normalizeSkill(targetSkill);
  const targetName = normTarget ? normTarget.name : targetSkill;

  for (const candSkill of candidateSkills) {
    const normCand = normalizeSkill(candSkill);
    const candName = normCand ? normCand.name : candSkill;

    const rule = TRANSFERABILITY_RULES.find(
      r => r.sourceSkill.toLowerCase() === candName.toLowerCase() &&
           r.targetSkill.toLowerCase() === targetName.toLowerCase()
    );

    if (rule) {
      return {
        hasTransfer: true,
        sourceSkill: rule.sourceSkill,
        transferScore: rule.transferScore,
        rationale: rule.rationale
      };
    }
  }

  return { hasTransfer: false };
}

/**
 * Computes Skill Learning Distance
 */
export function calculateLearningDistance(
  missingSkill: string,
  candidateSkills: string[]
): { level: LearningDistanceLevel; rationale: string } {
  const transfer = checkTransferability(candidateSkills, missingSkill);
  if (transfer.hasTransfer) {
    return {
      level: 'LOW',
      rationale: `Candidate has documented competence in ${transfer.sourceSkill}. With ~${Math.round((transfer.transferScore || 0.8) * 100)}% conceptual overlap, learning distance to ${missingSkill} is minimal (est. 2–3 weeks ramp-up).`
    };
  }

  const normTarget = normalizeSkill(missingSkill);
  const targetCategory = normTarget ? normTarget.category : null;

  // Check if candidate has skills in the exact same category
  const sameCategorySkills = candidateSkills
    .map(s => normalizeSkill(s))
    .filter((s): s is CanonicalSkill => s !== null && s.category === targetCategory);

  if (sameCategorySkills.length >= 2) {
    return {
      level: 'MEDIUM',
      rationale: `Candidate has foundational domain experience in ${targetCategory} (${sameCategorySkills.map(s => s.name).slice(0, 2).join(', ')}), providing prerequisite conceptual context.`
    };
  }

  return {
    level: 'HIGH',
    rationale: `Candidate lacks adjacent capabilities or prerequisite foundational tooling in ${targetCategory || 'this domain'}. Transitioning to ${missingSkill} requires foundational upskilling.`
  };
}
