import { CompetencyImportance } from "../constants/enums";

export interface ExtractedSkill {
  name: string;
  requiredLevel: number;
  importance: CompetencyImportance;
  minYearsOfExperience: number;
}

const TECH_SKILLS_TAXONOMY: Array<{ canonical: string; patterns: RegExp[] }> = [
  // AI / ML / Data
  { canonical: "Machine Learning", patterns: [/\bmachine\s+learning\b/i, /\bml\b/i] },
  { canonical: "Generative AI", patterns: [/\bgenerative\s+ai\b/i, /\bgenai\b/i, /\bgen\s+ai\b/i] },
  { canonical: "RAG", patterns: [/\brag\b/i, /\bretrieval[\s-]augmented\s+generation\b/i] },
  { canonical: "LLMs", patterns: [/\bllms?\b/i, /\blarge\s+language\s+models?\b/i] },
  { canonical: "Dataiku", patterns: [/\bdataiku\b/i] },
  { canonical: "NLP", patterns: [/\bnlp\b/i, /\bnatural\s+language\s+processing\b/i] },
  { canonical: "Computer Vision", patterns: [/\bcomputer\s+vision\b/i, /\bcv\b/i] },
  { canonical: "Deep Learning", patterns: [/\bdeep\s+learning\b/i] },
  { canonical: "PyTorch", patterns: [/\bpytorch\b/i] },
  { canonical: "TensorFlow", patterns: [/\btensorflow\b/i] },
  { canonical: "LangChain", patterns: [/\blangchain\b/i] },
  { canonical: "MLOps", patterns: [/\bmlops\b/i] },
  { canonical: "Pandas", patterns: [/\bpandas\b/i] },
  { canonical: "NumPy", patterns: [/\bnumpy\b/i] },
  { canonical: "Scikit-Learn", patterns: [/\bscikit[\s-]learn\b/i, /\bsklearn\b/i] },

  // Programming Languages
  { canonical: "Python", patterns: [/\bpython\b/i] },
  { canonical: "TypeScript", patterns: [/\btypescript\b/i, /\bts\b/i] },
  { canonical: "JavaScript", patterns: [/\bjavascript\b/i, /\bjs\b/i] },
  { canonical: "Java", patterns: [/\bjava\b/i] },
  { canonical: "Go", patterns: [/\bgolang\b/i, /\bgo\b/i] },
  { canonical: "C++", patterns: [/\bc\+\+\b/i] },
  { canonical: "C#", patterns: [/\bc#\b/i, /\b\.net\b/i] },
  { canonical: "Rust", patterns: [/\brust\b/i] },
  { canonical: "PHP", patterns: [/\bphp\b/i] },
  { canonical: "SQL", patterns: [/\bsql\b/i] },

  // Frontend
  { canonical: "React", patterns: [/\breact(?:\.js)?\b/i] },
  { canonical: "Next.js", patterns: [/\bnext(?:\.js)?\b/i] },
  { canonical: "Vue.js", patterns: [/\bvue(?:\.js)?\b/i] },
  { canonical: "Angular", patterns: [/\bangular\b/i] },
  { canonical: "Tailwind CSS", patterns: [/\btailwind(?:\s*css)?\b/i] },
  { canonical: "Redux", patterns: [/\bredux\b/i] },
  { canonical: "GraphQL", patterns: [/\bgraphql\b/i] },
  { canonical: "HTML/CSS", patterns: [/\bhtml\b/i, /\bcss\b/i] },
  { canonical: "Figma", patterns: [/\bfigma\b/i] },

  // Backend & Architecture
  { canonical: "Node.js", patterns: [/\bnode(?:\.js)?\b/i] },
  { canonical: "Express", patterns: [/\bexpress(?:\.js)?\b/i] },
  { canonical: "FastAPI", patterns: [/\bfastapi\b/i] },
  { canonical: "Django", patterns: [/\bdjango\b/i] },
  { canonical: "Flask", patterns: [/\bflask\b/i] },
  { canonical: "Spring Boot", patterns: [/\bspring\s+boot\b/i, /\bspring\b/i] },
  { canonical: "Microservices", patterns: [/\bmicroservices?\b/i] },
  { canonical: "System Design", patterns: [/\bsystem\s+design\b/i] },
  { canonical: "REST API", patterns: [/\brest(?:ful)?\s+apis?\b/i, /\bapis?\b/i] },

  // Databases & Caches
  { canonical: "MongoDB", patterns: [/\bmongodb\b/i, /\bmongo\b/i] },
  { canonical: "PostgreSQL", patterns: [/\bpostgres(?:ql)?\b/i] },
  { canonical: "MySQL", patterns: [/\bmysql\b/i] },
  { canonical: "Redis", patterns: [/\bredis\b/i] },
  { canonical: "Elasticsearch", patterns: [/\belasticsearch\b/i] },
  { canonical: "Kafka", patterns: [/\bkafka\b/i] },
  { canonical: "RabbitMQ", patterns: [/\brabbitmq\b/i] },
  { canonical: "Snowflake", patterns: [/\bsnowflake\b/i] },

  // Cloud & DevOps
  { canonical: "AWS", patterns: [/\baws\b/i, /\bamazon\s+web\s+services\b/i] },
  { canonical: "Docker", patterns: [/\bdocker\b/i, /\bcontainer(?:s|ization)?\b/i] },
  { canonical: "Kubernetes", patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { canonical: "CI/CD", patterns: [/\bci[\/-]?cd\b/i, /\bcontinuous\s+integration\b/i] },
  { canonical: "Terraform", patterns: [/\bterraform\b/i] },
  { canonical: "Linux", patterns: [/\blinux\b/i] },
  { canonical: "Git", patterns: [/\bgit\b/i, /\bgithub\b/i] },
  { canonical: "GCP", patterns: [/\bgcp\b/i, /\bgoogle\s+cloud\b/i] },
  { canonical: "Azure", patterns: [/\bazure\b/i] },
];

export function extractSkillsFromText(title: string, description: string): ExtractedSkill[] {
  const combinedText = `${title} ${description}`.toLowerCase();
  const matched = new Map<string, ExtractedSkill>();

  for (const { canonical, patterns } of TECH_SKILLS_TAXONOMY) {
    const isMatched = patterns.some((p) => p.test(combinedText));
    if (isMatched && !matched.has(canonical)) {
      // If found in title, treat as Critical/High; if only description, Medium
      const inTitle = patterns.some((p) => p.test(title.toLowerCase()));
      matched.set(canonical, {
        name: canonical,
        requiredLevel: inTitle ? 4 : 3,
        importance: inTitle ? CompetencyImportance.CRITICAL : CompetencyImportance.HIGH,
        minYearsOfExperience: inTitle ? 2 : 1,
      });
    }
  }

  // If none matched, provide standard software engineering competency
  if (matched.size === 0) {
    matched.set("Software Engineering", {
      name: "Software Engineering",
      requiredLevel: 3,
      importance: CompetencyImportance.HIGH,
      minYearsOfExperience: 1,
    });
  }

  return Array.from(matched.values());
}
