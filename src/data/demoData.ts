import { CandidateProfile, JobRequisition, ResumeVersionDiff, GitHubEvidenceProfile } from '../types';

export const DEMO_JOBS: JobRequisition[] = [
  {
    id: 'job-aiml-1',
    title: 'Senior AI / ML Platform Engineer',
    department: 'Machine Learning Infrastructure',
    location: 'San Francisco, CA (Hybrid / Remote Option)',
    workMode: 'Hybrid',
    seniority: 'Senior',
    minExperienceYears: 4,
    salaryRange: '$165,000 - $210,000',
    summary: 'Seeking an experienced AI / ML Platform Engineer to build scalable model serving pipelines, asynchronous inference endpoints, and automated training workflows.',
    requirements: [
      { id: 'req-1', skill: 'Python', type: 'REQUIRED', minYears: 4, importanceWeight: 5, notes: 'Core runtime for all training pipelines and model wrappers' },
      { id: 'req-2', skill: 'FastAPI', type: 'REQUIRED', minYears: 2, importanceWeight: 4, notes: 'High-throughput async model inference APIs' },
      { id: 'req-3', skill: 'Docker', type: 'REQUIRED', minYears: 2, importanceWeight: 4, notes: 'Containerized training environments and reproducible image builds' },
      { id: 'req-4', skill: 'SQL', type: 'REQUIRED', minYears: 3, importanceWeight: 4, notes: 'Feature store extraction and data querying' },
      { id: 'req-5', skill: 'AWS', type: 'REQUIRED', minYears: 2, importanceWeight: 4, notes: 'Cloud deployment via ECS/EKS and S3 model artifact storage' },
      { id: 'req-6', skill: 'PyTorch', type: 'PREFERRED', minYears: 2, importanceWeight: 3, notes: 'Fine-tuning, distributed training, and GPU optimization' },
      { id: 'req-7', skill: 'Kubernetes', type: 'PREFERRED', minYears: 1, importanceWeight: 3, notes: 'Large scale container orchestration and GPU scheduling' },
      { id: 'req-8', skill: 'Redis', type: 'OPTIONAL', minYears: 1, importanceWeight: 2, notes: 'Inference response caching and rate limiting' }
    ],
    responsibilities: [
      'Design, benchmark, and deploy low-latency model inference microservices in Python & FastAPI.',
      'Containerize distributed deep learning pipelines with Docker and deploy to cloud clusters.',
      'Partner with data scientists to optimize feature store SQL queries and batch pipelines.',
      'Monitor model latency, drift, and GPU resource utilization in production.'
    ],
    qualityScore: 94,
    qualityIssues: [],
    createdAt: '2026-08-20'
  },
  {
    id: 'job-fullstack-2',
    title: 'Senior Full-Stack Product Engineer',
    department: 'Product Engineering',
    location: 'New York, NY (Remote)',
    workMode: 'Remote',
    seniority: 'Senior',
    minExperienceYears: 4,
    salaryRange: '$150,000 - $190,000',
    summary: 'Build delightful, high-speed SaaS workflows in React, TypeScript, and modern backend services.',
    requirements: [
      { id: 'fs-1', skill: 'React', type: 'REQUIRED', minYears: 3, importanceWeight: 5 },
      { id: 'fs-2', skill: 'TypeScript', type: 'REQUIRED', minYears: 3, importanceWeight: 5 },
      { id: 'fs-3', skill: 'Next.js', type: 'REQUIRED', minYears: 2, importanceWeight: 4 },
      { id: 'fs-4', skill: 'PostgreSQL', type: 'REQUIRED', minYears: 2, importanceWeight: 4 },
      { id: 'fs-5', skill: 'Node.js', type: 'PREFERRED', minYears: 2, importanceWeight: 3 },
      { id: 'fs-6', skill: 'REST APIs', type: 'PREFERRED', minYears: 2, importanceWeight: 3 },
      { id: 'fs-7', skill: 'AWS', type: 'OPTIONAL', minYears: 1, importanceWeight: 2 }
    ],
    responsibilities: [
      'Architect interactive customer dashboards with React 19, Next.js, and TypeScript.',
      'Design robust relational database schemas and queries in PostgreSQL.',
      'Collaborate with UI/UX designers to implement pixel-perfect, accessible components.'
    ],
    qualityScore: 92,
    createdAt: '2026-08-25'
  },
  {
    id: 'job-devops-3',
    title: 'Lead Cloud & DevOps Infrastructure Architect',
    department: 'Core Infrastructure',
    location: 'Austin, TX (Hybrid)',
    workMode: 'Hybrid',
    seniority: 'Lead',
    minExperienceYears: 5,
    salaryRange: '$175,000 - $225,000',
    summary: 'Lead our multi-region Kubernetes platform, Terraform cloud infrastructure, and zero-downtime CI/CD automation.',
    requirements: [
      { id: 'do-1', skill: 'Kubernetes', type: 'REQUIRED', minYears: 4, importanceWeight: 5 },
      { id: 'do-2', skill: 'AWS', type: 'REQUIRED', minYears: 4, importanceWeight: 5 },
      { id: 'do-3', skill: 'Terraform', type: 'REQUIRED', minYears: 3, importanceWeight: 5 },
      { id: 'do-4', skill: 'Docker', type: 'REQUIRED', minYears: 4, importanceWeight: 4 },
      { id: 'do-5', skill: 'CI/CD Pipelines', type: 'REQUIRED', minYears: 3, importanceWeight: 4 },
      { id: 'do-6', skill: 'Linux', type: 'PREFERRED', minYears: 4, importanceWeight: 3 }
    ],
    responsibilities: [
      'Maintain enterprise Kubernetes clusters with automated self-healing and horizontal pod autoscaling.',
      'Write modular Terraform IaC to provision VPCs, IAM policies, and RDS databases.',
      'Strengthen platform observability with Prometheus, Grafana, and structured telemetry.'
    ],
    qualityScore: 96,
    createdAt: '2026-08-15'
  },
  {
    id: 'job-backend-4',
    title: 'High-Throughput Backend Systems Engineer',
    department: 'Platform Systems',
    location: 'Seattle, WA (Remote)',
    workMode: 'Remote',
    seniority: 'Senior',
    minExperienceYears: 3,
    salaryRange: '$155,000 - $195,000',
    summary: 'Build distributed backend microservices handling 50k+ requests/sec with low latency and rock-solid fault tolerance.',
    requirements: [
      { id: 'be-1', skill: 'Python', type: 'REQUIRED', minYears: 3, importanceWeight: 5 },
      { id: 'be-2', skill: 'FastAPI', type: 'REQUIRED', minYears: 2, importanceWeight: 4 },
      { id: 'be-3', skill: 'PostgreSQL', type: 'REQUIRED', minYears: 3, importanceWeight: 4 },
      { id: 'be-4', skill: 'Redis', type: 'REQUIRED', minYears: 2, importanceWeight: 4 },
      { id: 'be-5', skill: 'Docker', type: 'PREFERRED', minYears: 2, importanceWeight: 3 },
      { id: 'be-6', skill: 'Apache Kafka', type: 'PREFERRED', minYears: 1, importanceWeight: 3 }
    ],
    responsibilities: [
      'Scale asynchronous Python services with FastAPI and asynchronous database pools.',
      'Optimize complex PostgreSQL queries and partition large audit tables.',
      'Implement multi-tier distributed caching with Redis to reduce DB load.'
    ],
    qualityScore: 88,
    createdAt: '2026-09-01'
  },
  {
    id: 'job-data-5',
    title: 'Senior Data & Analytics Engineer',
    department: 'Data Platform',
    location: 'Chicago, IL (Hybrid)',
    workMode: 'Hybrid',
    seniority: 'Senior',
    minExperienceYears: 4,
    salaryRange: '$160,000 - $200,000',
    summary: 'Design batch and streaming ETL pipelines transforming terabytes of operational telemetry into analytics-ready models.',
    requirements: [
      { id: 'de-1', skill: 'Python', type: 'REQUIRED', minYears: 4, importanceWeight: 5 },
      { id: 'de-2', skill: 'SQL', type: 'REQUIRED', minYears: 4, importanceWeight: 5 },
      { id: 'de-3', skill: 'Apache Spark', type: 'REQUIRED', minYears: 2, importanceWeight: 4 },
      { id: 'de-4', skill: 'AWS', type: 'REQUIRED', minYears: 2, importanceWeight: 4 },
      { id: 'de-5', skill: 'Snowflake', type: 'PREFERRED', minYears: 2, importanceWeight: 3 }
    ],
    responsibilities: [
      'Build scalable ETL pipelines with PySpark and Airflow processing raw event logs.',
      'Design clean dimensional data models (star and snowflake schemas).',
      'Optimize query costs and execution times on AWS Athena and cloud data warehouses.'
    ],
    qualityScore: 90,
    createdAt: '2026-08-28'
  }
];

export const DEMO_CANDIDATES: CandidateProfile[] = [
  // Candidate A: Strong match for AI/ML Job
  {
    id: 'cand-alex-1',
    userId: 'u-alex',
    fullName: 'Alex Rivera',
    anonymousId: 'Candidate #A1832',
    title: 'Senior AI & Backend Systems Engineer',
    summary: 'AI platform engineer with 5+ years of experience architecting distributed model serving systems, asynchronous FastAPI endpoints, and cloud container deployments.',
    location: 'San Francisco, CA',
    yearsOfExperience: 5.2,
    education: [
      {
        id: 'edu-alex-1',
        degree: 'B.S. in Computer Science',
        fieldOfStudy: 'Computer Science',
        institution: 'University of California, Berkeley',
        graduationYear: 2021
      }
    ],
    experiences: [
      {
        id: 'exp-alex-1',
        company: 'Synthetix AI Systems',
        title: 'Senior ML Infrastructure Engineer',
        startDate: '2023-01',
        endDate: 'Present',
        location: 'San Francisco, CA',
        description: 'Architected async model serving platform processing 12M inference queries daily with sub-40ms P99 latency.',
        skillsUsed: ['Python', 'FastAPI', 'Docker', 'AWS', 'PyTorch', 'SQL', 'PostgreSQL'],
        keyAchievements: [
          'Rewrote monolithic Flask inference service into asynchronous FastAPI microservice, dropping latency by 54%.',
          'Containerized 14 vision and NLP models with Docker multi-stage builds, reducing image footprint from 8.2GB to 1.4GB.',
          'Configured AWS ECS cluster and S3 artifact caching for zero-downtime model rollouts.'
        ]
      },
      {
        id: 'exp-alex-2',
        company: 'Vanguard Data Labs',
        title: 'Backend Software Engineer',
        startDate: '2021-06',
        endDate: '2022-12',
        location: 'San Jose, CA',
        description: 'Developed backend REST APIs and database query optimization pipelines for financial analytics.',
        skillsUsed: ['Python', 'SQL', 'PostgreSQL', 'Docker', 'Git', 'REST APIs'],
        keyAchievements: [
          'Engineered optimized SQL queries and indexing strategies that improved reporting throughput by 3x.',
          'Built automated CI/CD container tests and linting gates using GitHub Actions.'
        ]
      }
    ],
    projects: [
      {
        id: 'proj-alex-1',
        title: 'VectorServe — Open-Source Asynchronous Inference Gateway',
        description: 'High-throughput async Python gateway serving PyTorch embedding models over FastAPI with dynamic GPU batching.',
        role: 'Creator & Maintainer',
        skillsUsed: ['Python', 'FastAPI', 'Docker', 'PyTorch', 'Redis'],
        repoUrl: 'https://github.com/alexrivera/vectorserve',
        impactSnippet: 'Used by 1,200+ GitHub stars; demonstrates production async queuing and Docker orchestration.'
      }
    ],
    skills: [
      { skill: 'Python', category: 'Programming Languages', confidence: 0.98, source: 'experience', evidence: '5+ years production backend & ML infrastructure engineering', recency: 'recent', depth: 'production', yearsExperience: 5 },
      { skill: 'FastAPI', category: 'Frameworks & Libraries', confidence: 0.96, source: 'experience', evidence: 'Architected 12M req/day inference microservice at Synthetix AI', recency: 'recent', depth: 'production', yearsExperience: 3 },
      { skill: 'Docker', category: 'Cloud & DevOps', confidence: 0.95, source: 'experience', evidence: 'Multi-stage production image packaging for 14 models', recency: 'recent', depth: 'production', yearsExperience: 4 },
      { skill: 'SQL', category: 'Programming Languages', confidence: 0.92, source: 'experience', evidence: 'Complex query tuning and feature extraction on PostgreSQL', recency: 'recent', depth: 'production', yearsExperience: 4 },
      { skill: 'AWS', category: 'Cloud & DevOps', confidence: 0.90, source: 'experience', evidence: 'ECS, S3, IAM, CloudWatch production deployments', recency: 'recent', depth: 'production', yearsExperience: 3 },
      { skill: 'PyTorch', category: 'Machine Learning & AI', confidence: 0.88, source: 'project', evidence: 'Custom embedding model serving & quantization', recency: 'recent', depth: 'production', yearsExperience: 2 },
      { skill: 'PostgreSQL', category: 'Databases & Storage', confidence: 0.90, source: 'experience', evidence: 'Production schema design and connection pooling', recency: 'recent', depth: 'production', yearsExperience: 4 },
      { skill: 'Redis', category: 'Databases & Storage', confidence: 0.85, source: 'project', evidence: 'Response caching and asynchronous queue broker', recency: 'recent', depth: 'project', yearsExperience: 2 }
    ],
    certifications: ['AWS Certified Solutions Architect – Associate (2024)'],
    githubUsername: 'alexrivera'
  },

  // Candidate B: Strong skills but MISSING Docker
  {
    id: 'cand-maya-2',
    userId: 'u-maya',
    fullName: 'Maya Patel',
    anonymousId: 'Candidate #B2411',
    title: 'Machine Learning & Python Backend Developer',
    summary: '4 years experience building algorithmic models, data APIs, and SQL pipelines in Python and FastAPI. Strong math and model architecture background, but limited container DevOps experience.',
    location: 'Austin, TX',
    yearsOfExperience: 4.1,
    education: [
      {
        id: 'edu-maya-1',
        degree: 'M.S. in Computational Statistics',
        fieldOfStudy: 'Data Science',
        institution: 'University of Texas at Austin',
        graduationYear: 2022
      }
    ],
    experiences: [
      {
        id: 'exp-maya-1',
        company: 'OmniAnalytics Corp',
        title: 'Machine Learning Engineer',
        startDate: '2022-07',
        endDate: 'Present',
        location: 'Austin, TX',
        description: 'Trained and deployed predictive gradient boosting and neural models behind internal FastAPI endpoints.',
        skillsUsed: ['Python', 'FastAPI', 'PyTorch', 'SQL', 'PostgreSQL', 'AWS', 'Pandas'],
        keyAchievements: [
          'Developed real-time customer churn model with 89% precision score.',
          'Wrote async FastAPI prediction microservices deployed to AWS EC2 bare VMs.'
        ]
      }
    ],
    projects: [
      {
        id: 'proj-maya-1',
        title: 'DeepForecasting — Time Series Model Suite',
        description: 'Python package for automated feature engineering and neural time-series forecasting.',
        role: 'Lead Author',
        skillsUsed: ['Python', 'PyTorch', 'SQL', 'FastAPI'],
        impactSnippet: 'Production forecasting tool utilized by 3 enterprise clients.'
      }
    ],
    skills: [
      { skill: 'Python', category: 'Programming Languages', confidence: 0.97, source: 'experience', evidence: '4+ years advanced modeling and backend development', recency: 'recent', depth: 'production', yearsExperience: 4 },
      { skill: 'FastAPI', category: 'Frameworks & Libraries', confidence: 0.92, source: 'experience', evidence: 'Built asynchronous prediction endpoints at OmniAnalytics', recency: 'recent', depth: 'production', yearsExperience: 2.5 },
      { skill: 'SQL', category: 'Programming Languages', confidence: 0.90, source: 'experience', evidence: 'Analytical SQL and window functions for feature engineering', recency: 'recent', depth: 'production', yearsExperience: 4 },
      { skill: 'PyTorch', category: 'Machine Learning & AI', confidence: 0.91, source: 'experience', evidence: 'Neural network training and hyperparameter tuning', recency: 'recent', depth: 'production', yearsExperience: 3 },
      { skill: 'AWS', category: 'Cloud & DevOps', confidence: 0.82, source: 'experience', evidence: 'Managed EC2 instances, S3 buckets, and RDS instances', recency: 'recent', depth: 'production', yearsExperience: 2 },
      { skill: 'PostgreSQL', category: 'Databases & Storage', confidence: 0.88, source: 'experience', evidence: 'PostgreSQL database modeling and indexing', recency: 'recent', depth: 'production', yearsExperience: 3 }
    ],
    certifications: [],
    githubUsername: 'mayapatel-ml'
  },

  // Candidate C: Good Transferable Cloud experience (Has Azure instead of AWS)
  {
    id: 'cand-carlos-3',
    userId: 'u-carlos',
    fullName: 'Carlos Mendoza',
    anonymousId: 'Candidate #C3905',
    title: 'Cloud Backend & Data Systems Engineer',
    summary: 'Senior software engineer with 5 years enterprise experience in Python, FastAPI, Docker, and Microsoft Azure cloud architectures.',
    location: 'Chicago, IL',
    yearsOfExperience: 5.0,
    education: [
      {
        id: 'edu-carlos-1',
        degree: 'B.S. in Software Engineering',
        fieldOfStudy: 'Software Engineering',
        institution: 'University of Illinois Urbana-Champaign',
        graduationYear: 2021
      }
    ],
    experiences: [
      {
        id: 'exp-carlos-1',
        company: 'Apex Cloud Solutions',
        title: 'Senior Backend Cloud Engineer',
        startDate: '2022-03',
        endDate: 'Present',
        location: 'Chicago, IL',
        description: 'Built enterprise cloud backend microservices in Python & FastAPI running in Docker on Azure App Services and Azure AKS.',
        skillsUsed: ['Python', 'FastAPI', 'Docker', 'Microsoft Azure', 'SQL', 'PostgreSQL', 'CI/CD Pipelines'],
        keyAchievements: [
          'Migrated legacy monolithic systems to Dockerized Python FastAPI microservices on Azure.',
          'Automated Azure container deployment via CI/CD pipelines with zero downtime.',
          'Tuned SQL queries and database connection pools for PostgreSQL.'
        ]
      }
    ],
    projects: [
      {
        id: 'proj-carlos-1',
        title: 'Azure-FastAPI-Starter',
        description: 'Production-ready starter template for containerized FastAPI on Azure with automated Terraform configuration.',
        role: 'Creator',
        skillsUsed: ['Python', 'FastAPI', 'Docker', 'Microsoft Azure', 'Terraform'],
        impactSnippet: 'Popular enterprise blueprint for Azure cloud containerization.'
      }
    ],
    skills: [
      { skill: 'Python', category: 'Programming Languages', confidence: 0.95, source: 'experience', evidence: '5 years enterprise backend programming', recency: 'recent', depth: 'production', yearsExperience: 5 },
      { skill: 'FastAPI', category: 'Frameworks & Libraries', confidence: 0.93, source: 'experience', evidence: 'Core runtime for enterprise microservices on Azure', recency: 'recent', depth: 'production', yearsExperience: 3 },
      { skill: 'Docker', category: 'Cloud & DevOps', confidence: 0.94, source: 'experience', evidence: 'Containerized all microservices for Azure App Services', recency: 'recent', depth: 'production', yearsExperience: 4 },
      { skill: 'SQL', category: 'Programming Languages', confidence: 0.91, source: 'experience', evidence: 'Relational data modeling and stored procedures', recency: 'recent', depth: 'production', yearsExperience: 5 },
      { skill: 'Microsoft Azure', category: 'Cloud & DevOps', confidence: 0.94, source: 'experience', evidence: 'Azure VMs, App Services, Blob Storage, AKS, Azure SQL', recency: 'recent', depth: 'production', yearsExperience: 4 },
      { skill: 'PostgreSQL', category: 'Databases & Storage', confidence: 0.90, source: 'experience', evidence: 'Production database administration and query tuning', recency: 'recent', depth: 'production', yearsExperience: 4 }
    ],
    certifications: ['Microsoft Certified: Azure Solutions Architect Expert (2023)'],
    githubUsername: 'carlos-mendoza-cloud'
  },

  // Candidate D: Low Match (Frontend JavaScript / CSS, little backend/ML)
  {
    id: 'cand-dylan-4',
    userId: 'u-dylan',
    fullName: 'Dylan Taylor',
    anonymousId: 'Candidate #D4120',
    title: 'Junior Frontend Web Developer',
    summary: 'Junior developer with 1.2 years focused on HTML, CSS, JavaScript, and simple UI styling. Basic exposure to Python scripting.',
    location: 'Denver, CO',
    yearsOfExperience: 1.2,
    education: [
      {
        id: 'edu-dylan-1',
        degree: 'Associate Degree in Web Development',
        fieldOfStudy: 'Web Development',
        institution: 'Colorado Community College',
        graduationYear: 2025
      }
    ],
    experiences: [
      {
        id: 'exp-dylan-1',
        company: 'PixelCraft Digital',
        title: 'Junior Frontend Developer',
        startDate: '2025-06',
        endDate: 'Present',
        location: 'Denver, CO',
        description: 'Built marketing landing pages and client website frontends using JavaScript, HTML, and CSS.',
        skillsUsed: ['JavaScript', 'Git'],
        keyAchievements: ['Developed responsive navigation menus and interactive sliders.']
      }
    ],
    projects: [
      {
        id: 'proj-dylan-1',
        title: 'Personal Portfolio & Blog',
        description: 'Static website built with JavaScript and modern CSS.',
        role: 'Author',
        skillsUsed: ['JavaScript', 'Git']
      }
    ],
    skills: [
      { skill: 'JavaScript', category: 'Programming Languages', confidence: 0.85, source: 'experience', evidence: '1 year building interactive client interfaces', recency: 'recent', depth: 'production', yearsExperience: 1.2 },
      { skill: 'Git', category: 'Tools & Methodologies', confidence: 0.75, source: 'experience', evidence: 'Basic GitHub version control workflow', recency: 'recent', depth: 'production', yearsExperience: 1 }
    ],
    certifications: [],
    githubUsername: 'dylantaylor-web'
  },

  // Candidate E: Strong academic / projects, little professional work tenure
  {
    id: 'cand-elena-5',
    userId: 'u-elena',
    fullName: 'Elena Rostova',
    anonymousId: 'Candidate #E5831',
    title: 'Graduate Machine Learning Researcher',
    summary: 'Recent Master of Science graduate with strong academic publications in neural NLP, PyTorch deep learning, and open-source FastAPI projects, but 9 months total industry internship tenure.',
    location: 'Boston, MA',
    yearsOfExperience: 0.8,
    education: [
      {
        id: 'edu-elena-1',
        degree: 'M.S. in Computer Science (Machine Learning Specialization)',
        fieldOfStudy: 'Computer Science',
        institution: 'Northeastern University',
        graduationYear: 2026
      },
      {
        id: 'edu-elena-2',
        degree: 'B.S. in Applied Mathematics',
        fieldOfStudy: 'Mathematics',
        institution: 'Boston University',
        graduationYear: 2024
      }
    ],
    experiences: [
      {
        id: 'exp-elena-1',
        company: 'Beacon AI Labs',
        title: 'Graduate ML Research Intern',
        startDate: '2025-09',
        endDate: '2026-05',
        location: 'Boston, MA',
        description: 'Trained Transformer language models and developed PyTorch inference pipelines wrapped in FastAPI.',
        skillsUsed: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'SQL'],
        keyAchievements: [
          'Published peer-reviewed paper on low-rank adaptation (LoRA) for model fine-tuning.',
          'Built Dockerized benchmarking container comparing PyTorch vs ONNX runtime latencies.'
        ]
      }
    ],
    projects: [
      {
        id: 'proj-elena-1',
        title: 'FastLoRA — Lightweight Fine-Tuning Toolkit',
        description: 'Open-source PyTorch toolkit for fine-tuning open weights models with FastAPI testing server.',
        role: 'Creator',
        skillsUsed: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
        repoUrl: 'https://github.com/elenarostova/fastlora',
        impactSnippet: 'Featured in AI newsletter; 850 GitHub stars.'
      }
    ],
    skills: [
      { skill: 'Python', category: 'Programming Languages', confidence: 0.94, source: 'experience', evidence: 'Academic research and graduate coursework programming', recency: 'recent', depth: 'project', yearsExperience: 2 },
      { skill: 'PyTorch', category: 'Machine Learning & AI', confidence: 0.96, source: 'experience', evidence: 'Thesis research and graduate publication on Transformer fine-tuning', recency: 'recent', depth: 'project', yearsExperience: 2 },
      { skill: 'FastAPI', category: 'Frameworks & Libraries', confidence: 0.86, source: 'project', evidence: 'Built inference API wrapper in open-source FastLoRA tool', recency: 'recent', depth: 'project', yearsExperience: 1 },
      { skill: 'Docker', category: 'Cloud & DevOps', confidence: 0.84, source: 'project', evidence: 'Created reproducible research containers for ML benchmarks', recency: 'recent', depth: 'project', yearsExperience: 1 },
      { skill: 'SQL', category: 'Programming Languages', confidence: 0.80, source: 'academic', evidence: 'Graduate database systems coursework and lab assignments', recency: 'academic', depth: 'coursework', yearsExperience: 1 }
    ],
    certifications: [],
    githubUsername: 'elenarostova'
  },

  // Candidate F: Senior Full-Stack Engineer (React, Next.js, TypeScript, PostgreSQL)
  {
    id: 'cand-frank-6',
    userId: 'u-frank',
    fullName: 'Frank Kim',
    anonymousId: 'Candidate #F6294',
    title: 'Senior Full-Stack Architect',
    summary: '6+ years building enterprise web applications, React design systems, Next.js portals, and scalable PostgreSQL database schemas.',
    location: 'Seattle, WA',
    yearsOfExperience: 6.4,
    education: [
      {
        id: 'edu-frank-1',
        degree: 'B.S. in Computer Science',
        fieldOfStudy: 'Computer Science',
        institution: 'University of Washington',
        graduationYear: 2020
      }
    ],
    experiences: [
      {
        id: 'exp-frank-1',
        company: 'PulseCloud SaaS',
        title: 'Lead Full-Stack Engineer',
        startDate: '2022-04',
        endDate: 'Present',
        location: 'Seattle, WA',
        description: 'Spearheaded migration from legacy SPA to modern Next.js App Router and TypeScript micro-frontends.',
        skillsUsed: ['React', 'TypeScript', 'Next.js', 'PostgreSQL', 'Node.js', 'Docker', 'AWS'],
        keyAchievements: [
          'Decreased initial page load time by 62% using Next.js server-side streaming.',
          'Designed relational multi-tenant PostgreSQL schema supporting 400k active users.'
        ]
      }
    ],
    projects: [
      {
        id: 'proj-frank-1',
        title: 'React-State-Sync',
        description: 'High-performance React state management synchronization library over WebSockets.',
        role: 'Author',
        skillsUsed: ['React', 'TypeScript', 'Node.js']
      }
    ],
    skills: [
      { skill: 'React', category: 'Frameworks & Libraries', confidence: 0.98, source: 'experience', evidence: '6 years enterprise component architecture', recency: 'recent', depth: 'production', yearsExperience: 6 },
      { skill: 'TypeScript', category: 'Programming Languages', confidence: 0.96, source: 'experience', evidence: 'Strict mode typed frontend and backend codebases', recency: 'recent', depth: 'production', yearsExperience: 5 },
      { skill: 'Next.js', category: 'Frameworks & Libraries', confidence: 0.94, source: 'experience', evidence: 'Production App Router and SSR deployments', recency: 'recent', depth: 'production', yearsExperience: 3 },
      { skill: 'PostgreSQL', category: 'Databases & Storage', confidence: 0.92, source: 'experience', evidence: 'Multi-tenant relational schema design and query tuning', recency: 'recent', depth: 'production', yearsExperience: 5 },
      { skill: 'Node.js', category: 'Frameworks & Libraries', confidence: 0.90, source: 'experience', evidence: 'Server APIs and background worker pipelines', recency: 'recent', depth: 'production', yearsExperience: 5 },
      { skill: 'AWS', category: 'Cloud & DevOps', confidence: 0.85, source: 'experience', evidence: 'S3, CloudFront, Route53, and ECS hosting', recency: 'recent', depth: 'production', yearsExperience: 3 }
    ],
    certifications: [],
    githubUsername: 'frankkim-dev'
  },

  // Candidate G: Senior Data Engineer (Spark, SQL, Python, AWS)
  {
    id: 'cand-grace-7',
    userId: 'u-grace',
    fullName: 'Grace Hopper-Lee',
    anonymousId: 'Candidate #G7109',
    title: 'Staff Data Platform Engineer',
    summary: 'Data engineer with 6 years building petabyte-scale distributed data pipelines with Apache Spark, Python, SQL, and AWS.',
    location: 'Chicago, IL',
    yearsOfExperience: 6.0,
    education: [
      {
        id: 'edu-grace-1',
        degree: 'B.S. in Computer Systems',
        fieldOfStudy: 'Computer Systems',
        institution: 'Purdue University',
        graduationYear: 2020
      }
    ],
    experiences: [
      {
        id: 'exp-grace-1',
        company: 'Transact Data Corp',
        title: 'Senior Data Engineer',
        startDate: '2021-08',
        endDate: 'Present',
        location: 'Chicago, IL',
        description: 'Engineered streaming and batch ingestion pipelines processing 45TB daily transaction data.',
        skillsUsed: ['Python', 'SQL', 'Apache Spark', 'AWS', 'Snowflake'],
        keyAchievements: [
          'Rewrote ETL jobs in PySpark on AWS EMR, reducing cluster operating costs by $180k/year.',
          'Built dimensional star-schema warehouse in Snowflake for executive reporting.'
        ]
      }
    ],
    projects: [],
    skills: [
      { skill: 'Python', category: 'Programming Languages', confidence: 0.95, source: 'experience', evidence: '6 years writing distributed data pipelines and scripts', recency: 'recent', depth: 'production', yearsExperience: 6 },
      { skill: 'SQL', category: 'Programming Languages', confidence: 0.98, source: 'experience', evidence: 'Complex analytical windowing, joins, and indexing', recency: 'recent', depth: 'production', yearsExperience: 6 },
      { skill: 'Apache Spark', category: 'Machine Learning & AI', confidence: 0.94, source: 'experience', evidence: 'PySpark optimization and partition tuning on AWS EMR', recency: 'recent', depth: 'production', yearsExperience: 4 },
      { skill: 'AWS', category: 'Cloud & DevOps', confidence: 0.91, source: 'experience', evidence: 'EMR, S3, Glue, Athena, and IAM architectures', recency: 'recent', depth: 'production', yearsExperience: 4 },
      { skill: 'Snowflake', category: 'Databases & Storage', confidence: 0.88, source: 'experience', evidence: 'Data warehouse architecture and credit optimization', recency: 'recent', depth: 'production', yearsExperience: 3 }
    ],
    certifications: ['AWS Certified Data Engineer – Associate'],
    githubUsername: 'gracehopperlee'
  },

  // Candidate H: Cloud & DevOps Architect (Kubernetes, AWS, Terraform)
  {
    id: 'cand-hassan-8',
    userId: 'u-hassan',
    fullName: 'Hassan Al-Mansoor',
    anonymousId: 'Candidate #H8421',
    title: 'Principal Cloud & DevOps Architect',
    summary: '7+ years architecting enterprise Kubernetes infrastructure, automated CI/CD pipelines, and multi-region AWS cloud foundations in Terraform.',
    location: 'Austin, TX',
    yearsOfExperience: 7.5,
    education: [
      {
        id: 'edu-hassan-1',
        degree: 'B.S. in Electrical & Computer Engineering',
        fieldOfStudy: 'Engineering',
        institution: 'Texas A&M University',
        graduationYear: 2019
      }
    ],
    experiences: [
      {
        id: 'exp-hassan-1',
        company: 'KubeScale Enterprise',
        title: 'Lead Platform Architect',
        startDate: '2021-02',
        endDate: 'Present',
        location: 'Austin, TX',
        description: 'Designed multi-tenant AWS EKS clusters hosting 180 microservices with GitOps automation.',
        skillsUsed: ['Kubernetes', 'AWS', 'Terraform', 'Docker', 'CI/CD Pipelines', 'Linux'],
        keyAchievements: [
          'Automated complete cloud environment bootstrapping in Terraform in under 18 minutes.',
          'Achieved 99.99% infrastructure uptime across 3 AWS geographic regions.'
        ]
      }
    ],
    projects: [],
    skills: [
      { skill: 'Kubernetes', category: 'Cloud & DevOps', confidence: 0.98, source: 'experience', evidence: 'Enterprise EKS cluster architecture, CNI networking, and Helm', recency: 'recent', depth: 'production', yearsExperience: 5 },
      { skill: 'AWS', category: 'Cloud & DevOps', confidence: 0.98, source: 'experience', evidence: 'Multi-account AWS Organizations, Transit Gateways, EKS', recency: 'recent', depth: 'production', yearsExperience: 7 },
      { skill: 'Terraform', category: 'Cloud & DevOps', confidence: 0.96, source: 'experience', evidence: 'Reusable modular IaC blueprints across 12 product teams', recency: 'recent', depth: 'production', yearsExperience: 5 },
      { skill: 'Docker', category: 'Cloud & DevOps', confidence: 0.95, source: 'experience', evidence: 'Container standards, security vulnerability scanning', recency: 'recent', depth: 'production', yearsExperience: 6 },
      { skill: 'CI/CD Pipelines', category: 'Cloud & DevOps', confidence: 0.94, source: 'experience', evidence: 'GitOps ArgoCD and GitHub Actions automated deployment', recency: 'recent', depth: 'production', yearsExperience: 5 },
      { skill: 'Linux', category: 'Cloud & DevOps', confidence: 0.96, source: 'experience', evidence: 'Kernel tuning, systemd, and bash automation', recency: 'recent', depth: 'production', yearsExperience: 7 }
    ],
    certifications: ['Certified Kubernetes Administrator (CKA)', 'AWS Certified Solutions Architect – Professional'],
    githubUsername: 'hassan-cloud'
  },

  // Candidate I: Junior Backend Developer (Python, FastAPI, SQL)
  {
    id: 'cand-isabella-9',
    userId: 'u-isabella',
    fullName: 'Isabella Chen',
    anonymousId: 'Candidate #I9230',
    title: 'Junior Backend Developer',
    summary: 'Junior developer with 1.5 years experience writing clean Python APIs with FastAPI and PostgreSQL. Fast learner with strong computer science fundamentals.',
    location: 'San Jose, CA',
    yearsOfExperience: 1.5,
    education: [
      {
        id: 'edu-isabella-1',
        degree: 'B.S. in Computer Science',
        fieldOfStudy: 'Computer Science',
        institution: 'San Jose State University',
        graduationYear: 2025
      }
    ],
    experiences: [
      {
        id: 'exp-isabella-1',
        company: 'AppStart Studio',
        title: 'Junior Software Engineer',
        startDate: '2025-03',
        endDate: 'Present',
        location: 'San Jose, CA',
        description: 'Built customer-facing REST endpoints in Python with FastAPI and PostgreSQL.',
        skillsUsed: ['Python', 'FastAPI', 'PostgreSQL', 'SQL', 'Git'],
        keyAchievements: ['Developed user authentication and profile management endpoints with JWT tokens.']
      }
    ],
    projects: [
      {
        id: 'proj-isabella-1',
        title: 'BookFlow API',
        description: 'RESTful API for library loan management written in FastAPI with SQLAlchemy and SQLite/Postgres.',
        role: 'Creator',
        skillsUsed: ['Python', 'FastAPI', 'SQL', 'PostgreSQL']
      }
    ],
    skills: [
      { skill: 'Python', category: 'Programming Languages', confidence: 0.88, source: 'experience', evidence: '1.5 years professional and project experience', recency: 'recent', depth: 'production', yearsExperience: 1.5 },
      { skill: 'FastAPI', category: 'Frameworks & Libraries', confidence: 0.86, source: 'experience', evidence: 'Built REST API endpoints at AppStart Studio', recency: 'recent', depth: 'production', yearsExperience: 1.2 },
      { skill: 'SQL', category: 'Programming Languages', confidence: 0.84, source: 'experience', evidence: 'Relational table design and CRUD queries', recency: 'recent', depth: 'production', yearsExperience: 1.5 },
      { skill: 'PostgreSQL', category: 'Databases & Storage', confidence: 0.82, source: 'experience', evidence: 'Database migrations and basic indexing', recency: 'recent', depth: 'production', yearsExperience: 1.2 },
      { skill: 'Git', category: 'Tools & Methodologies', confidence: 0.85, source: 'experience', evidence: 'Branching, PRs, and code review workflows', recency: 'recent', depth: 'production', yearsExperience: 2 }
    ],
    certifications: [],
    githubUsername: 'isabellachen-dev'
  },

  // Candidate J: NLP & GenAI Specialist
  {
    id: 'cand-james-10',
    userId: 'u-james',
    fullName: 'James Sterling',
    anonymousId: 'Candidate #J1058',
    title: 'NLP & Generative AI Engineer',
    summary: '3.5 years experience specializing in Large Language Model (LLM) RAG systems, PyTorch NLP fine-tuning, Python APIs, and vector databases.',
    location: 'New York, NY',
    yearsOfExperience: 3.5,
    education: [
      {
        id: 'edu-james-1',
        degree: 'B.S. in Computer Science & Cognitive Science',
        fieldOfStudy: 'Computer Science',
        institution: 'Columbia University',
        graduationYear: 2023
      }
    ],
    experiences: [
      {
        id: 'exp-james-1',
        company: 'Lexicon AI Labs',
        title: 'NLP Engineer',
        startDate: '2023-08',
        endDate: 'Present',
        location: 'New York, NY',
        description: 'Engineered retrieval-augmented generation (RAG) pipelines over legal and financial corpora.',
        skillsUsed: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'SQL', 'Large Language Models (LLMs)', 'Natural Language Processing (NLP)'],
        keyAchievements: [
          'Built semantic retrieval search engine utilizing vector embeddings and pgvector in PostgreSQL.',
          'Deployed low-latency token streaming endpoints using FastAPI WebSockets.'
        ]
      }
    ],
    projects: [
      {
        id: 'proj-james-1',
        title: 'OpenRAG-Benchmark',
        description: 'Benchmarking suite for comparing chunking strategies and embedding model retrieval accuracies.',
        role: 'Maintainer',
        skillsUsed: ['Python', 'FastAPI', 'PyTorch'],
        repoUrl: 'https://github.com/jamessterling/openrag-benchmark'
      }
    ],
    skills: [
      { skill: 'Python', category: 'Programming Languages', confidence: 0.95, source: 'experience', evidence: '3.5 years production Python NLP and backend services', recency: 'recent', depth: 'production', yearsExperience: 3.5 },
      { skill: 'FastAPI', category: 'Frameworks & Libraries', confidence: 0.91, source: 'experience', evidence: 'High-speed streaming endpoints for LLM generations', recency: 'recent', depth: 'production', yearsExperience: 2.5 },
      { skill: 'PyTorch', category: 'Machine Learning & AI', confidence: 0.92, source: 'experience', evidence: 'Fine-tuning transformer embeddings and quantization', recency: 'recent', depth: 'production', yearsExperience: 3 },
      { skill: 'Docker', category: 'Cloud & DevOps', confidence: 0.88, source: 'experience', evidence: 'Containerized inference models for production deployment', recency: 'recent', depth: 'production', yearsExperience: 2.5 },
      { skill: 'SQL', category: 'Programming Languages', confidence: 0.87, source: 'experience', evidence: 'SQL queries and pgvector similarity retrieval', recency: 'recent', depth: 'production', yearsExperience: 3 },
      { skill: 'Large Language Models (LLMs)', category: 'Machine Learning & AI', confidence: 0.95, source: 'experience', evidence: 'RAG architectures, prompt optimization, and embeddings', recency: 'recent', depth: 'production', yearsExperience: 2.5 }
    ],
    certifications: [],
    githubUsername: 'jamessterling-ai'
  }
];

export const DEMO_RESUME_VERSIONS: Record<string, ResumeVersionDiff[]> = {
  'cand-alex-1': [
    {
      versionId: 'ver-alex-v2',
      candidateId: 'cand-alex-1',
      versionName: 'Resume v2 (Current - AI Platform Focus)',
      uploadDate: '2026-08-10',
      skillsAdded: ['PyTorch', 'Redis', 'AWS Certified Solutions Architect'],
      skillsRemoved: ['Legacy Java', 'jQuery'],
      evidenceExpansions: [
        'Added specific 12M req/day scale metric to Synthetix AI role',
        'Quantified 54% latency drop after migrating from Flask to async FastAPI',
        'Included open-source VectorServe GitHub repository with 1,200+ stars'
      ],
      targetRoleAlignmentScore: 95,
      clarityImprovementScore: 92
    },
    {
      versionId: 'ver-alex-v1',
      candidateId: 'cand-alex-1',
      versionName: 'Resume v1 (Initial - General Backend)',
      uploadDate: '2025-06-15',
      skillsAdded: ['Python', 'SQL', 'FastAPI', 'Docker'],
      skillsRemoved: [],
      evidenceExpansions: [
        'General bullet points describing backend coding without architectural throughput metrics'
      ],
      targetRoleAlignmentScore: 78,
      clarityImprovementScore: 74
    }
  ]
};

export const DEMO_GITHUB_PROFILES: Record<string, GitHubEvidenceProfile> = {
  'cand-alex-1': {
    username: 'alexrivera',
    totalPublicRepos: 18,
    primaryLanguages: [
      { language: 'Python', percentage: 74 },
      { language: 'Dockerfile', percentage: 14 },
      { language: 'TypeScript', percentage: 8 },
      { language: 'Shell', percentage: 4 }
    ],
    verifiedRepositories: [
      {
        name: 'vectorserve',
        language: 'Python',
        stars: 1240,
        description: 'Asynchronous model inference gateway in FastAPI with dynamic batching and Redis caching.',
        verifiedSkills: ['Python', 'FastAPI', 'Docker', 'Redis', 'PyTorch'],
        commitFrequency: 'High',
        lastPushed: '2 days ago'
      },
      {
        name: 'fastapi-ecs-template',
        language: 'Python',
        stars: 310,
        description: 'Reference architecture for deploying production FastAPI microservices to AWS ECS with Fargate.',
        verifiedSkills: ['FastAPI', 'Docker', 'AWS'],
        commitFrequency: 'Moderate',
        lastPushed: '3 weeks ago'
      }
    ],
    evidenceStrength: 'Strong',
    supportingSummary: 'Documented repository code directly substantiates claimed proficiencies in Python 3.11, FastAPI async request handling, Docker multi-stage image builds, and AWS deployment automation.'
  },
  'cand-maya-2': {
    username: 'mayapatel-ml',
    totalPublicRepos: 12,
    primaryLanguages: [
      { language: 'Python', percentage: 88 },
      { language: 'Jupyter Notebook', percentage: 10 },
      { language: 'SQL', percentage: 2 }
    ],
    verifiedRepositories: [
      {
        name: 'deep-forecasting',
        language: 'Python',
        stars: 185,
        description: 'Neural time-series forecasting suite using PyTorch and FastAPI.',
        verifiedSkills: ['Python', 'PyTorch', 'FastAPI', 'SQL'],
        commitFrequency: 'Moderate',
        lastPushed: '1 month ago'
      }
    ],
    evidenceStrength: 'Strong',
    supportingSummary: 'Confirmed strong Python and PyTorch model implementations; no Dockerfile or container configuration files found across public repositories.'
  }
};
