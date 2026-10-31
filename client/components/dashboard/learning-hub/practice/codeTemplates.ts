export type SupportedLanguage = 'javascript' | 'typescript' | 'python';

export interface CodeProblemPreset {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Open';
  description: string;
  starterCode: Record<SupportedLanguage, string>;
}

export const CODE_PROBLEM_PRESETS: CodeProblemPreset[] = [
  {
    id: 'two-sum',
    title: 'Two Sum (Hash Map)',
    category: 'Arrays & Hash Maps',
    difficulty: 'Easy',
    description:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Each input has exactly one solution, and you may not use the same element twice.',
    starterCode: {
      javascript: `/**
 * Two Sum Problem
 * Time Complexity Target: O(n)
 * Space Complexity Target: O(n)
 */
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}

// === Verification Test Cases ===
console.log("--- Running Two Sum Tests ---");
console.log("Test 1: [2, 7, 11, 15], target = 9");
console.log("Result:", twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]

console.log("\\nTest 2: [3, 2, 4], target = 6");
console.log("Result:", twoSum([3, 2, 4], 6)); // Expected: [1, 2]

console.log("\\nTest 3: [3, 3], target = 6");
console.log("Result:", twoSum([3, 3], 6)); // Expected: [0, 1]
`,
      typescript: `/**
 * Two Sum Problem (TypeScript)
 * Time Complexity Target: O(n)
 * Space Complexity Target: O(n)
 */
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }

  return [];
}

// === Verification Test Cases ===
console.log("--- Running Two Sum (TS) Tests ---");
console.log("Test 1:", twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
console.log("Test 2:", twoSum([3, 2, 4], 6));       // Expected: [1, 2]
`,
      python: `"""
Two Sum Problem (Python 3)
Time Complexity Target: O(n)
Space Complexity Target: O(n)
"""
def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# === Verification Test Cases ===
print("--- Running Two Sum (Python) Tests ---")
print("Test 1: [2, 7, 11, 15], target = 9")
print("Result:", two_sum([2, 7, 11, 15], 9)) # Expected: [0, 1]

print("\\nTest 2: [3, 2, 4], target = 6")
print("Result:", two_sum([3, 2, 4], 6))       # Expected: [1, 2]
`,
    },
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome (Two Pointers)',
    category: 'Strings & Two Pointers',
    difficulty: 'Easy',
    description:
      'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    starterCode: {
      javascript: `/**
 * Valid Palindrome
 * Two-pointer approach with O(1) auxiliary space
 */
function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

// === Verification Test Cases ===
console.log("--- Running Valid Palindrome Tests ---");
console.log("Test 1: 'A man, a plan, a canal: Panama'");
console.log("Result:", isPalindrome("A man, a plan, a canal: Panama")); // Expected: true

console.log("\\nTest 2: 'race a car'");
console.log("Result:", isPalindrome("race a car")); // Expected: false

console.log("\\nTest 3: ' ' (empty string)");
console.log("Result:", isPalindrome(" ")); // Expected: true
`,
      typescript: `/**
 * Valid Palindrome (TypeScript)
 */
function isPalindrome(s: string): boolean {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}

console.log("--- Running Palindrome (TS) Tests ---");
console.log("Test 1:", isPalindrome("Was it a car or a cat I saw?")); // Expected: true
console.log("Test 2:", isPalindrome("hello world"));                   // Expected: false
`,
      python: `"""
Valid Palindrome (Python 3)
"""
import re

def is_palindrome(s: str) -> bool:
    cleaned = re.sub(r'[^a-zA-Z0-9]', '', s).lower()
    return cleaned == cleaned[::-1]

print("--- Running Palindrome (Python) Tests ---")
print("Test 1:", is_palindrome("A man, a plan, a canal: Panama")) # Expected: True
print("Test 2:", is_palindrome("race a car"))                    # Expected: False
`,
    },
  },
  {
    id: 'fibonacci-memo',
    title: 'Fibonacci Sequence (Memoization)',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    description:
      'Compute the nth Fibonacci number efficiently using dynamic programming / memoization to achieve O(n) time complexity instead of exponential O(2^n).',
    starterCode: {
      javascript: `/**
 * Fibonacci with Memoization
 * O(n) Time Complexity, O(n) Space Complexity
 */
function fibonacci(n, memo = new Map()) {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  if (memo.has(n)) {
    return memo.get(n);
  }

  const result = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  memo.set(n, result);
  return result;
}

// === Benchmark & Verification ===
console.log("--- Running Fibonacci Tests ---");
console.log("fib(10):", fibonacci(10)); // Expected: 55
console.log("fib(20):", fibonacci(20)); // Expected: 6765

console.time("fib(45) calculation");
const fib45 = fibonacci(45);
console.timeEnd("fib(45) calculation");
console.log("fib(45):", fib45); // Expected: 1134903170
`,
      typescript: `/**
 * Fibonacci with Memoization (TypeScript)
 */
function fibonacci(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (memo.has(n)) return memo.get(n)!;

  const result = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  memo.set(n, result);
  return result;
}

console.log("fib(10):", fibonacci(10)); // Expected: 55
console.log("fib(30):", fibonacci(30)); // Expected: 832040
`,
      python: `"""
Fibonacci with Memoization (Python 3)
"""
from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n: int) -> int:
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)

print("--- Running Fibonacci (Python) Tests ---")
print("fib(10):", fibonacci(10)) # Expected: 55
print("fib(35):", fibonacci(35)) # Expected: 9227465
`,
    },
  },
  {
    id: 'debounce-utility',
    title: 'Debounce Utility Function',
    category: 'Full-Stack JavaScript',
    difficulty: 'Medium',
    description:
      'Implement a production-grade debounce utility that delays invoking the target callback until after wait milliseconds have elapsed since the last invocation.',
    starterCode: {
      javascript: `/**
 * Debounce Function
 * Ensures function is not called again until after wait milliseconds.
 */
function debounce(fn, wait) {
  let timeoutId = null;

  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, wait);
  };
}

// === Verification ===
console.log("--- Testing Debounce Function ---");
let triggerCount = 0;
const logMessage = debounce((msg) => {
  triggerCount++;
  console.log(\`[DEBOUNCED CALLBACK \${triggerCount}]: \${msg}\`);
}, 100);

// Rapid-fire triggers (only the last one will fire after 100ms)
logMessage("Call 1");
logMessage("Call 2");
logMessage("Call 3 - Final Payload");

setTimeout(() => {
  console.log("Total executions after delay:", triggerCount);
}, 200);
`,
      typescript: `/**
 * Debounce Function (TypeScript)
 */
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | number | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId as any);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, wait);
  };
}

console.log("Debounce initialized successfully.");
`,
      python: `"""
Debounce / Rate Limiter Utility (Python 3)
"""
import time

def rate_limit_demo():
    print("--- Simulating Rate-Limited Function ---")
    calls = []
    
    for i in range(5):
        timestamp = time.time()
        calls.append(f"Request {i+1} received at {timestamp:.3f}")
        time.sleep(0.05)
    
    for c in calls:
        print(c)
    print("All requests processed.")

rate_limit_demo()
`,
    },
  },
  {
    id: 'blank-scratchpad',
    title: 'Blank Scratchpad',
    category: 'Open Playground',
    difficulty: 'Open',
    description:
      'Freeform sandbox. Write and test arbitrary algorithms, data structures, or prototype code.',
    starterCode: {
      javascript: `// SKILLEZO.AI Code Playground
// Write your JavaScript code below and press "Run Code" (or Ctrl + Enter)

function main() {
  console.log("Welcome to SKILLEZO Interactive Code Sandbox! 🚀");
  console.log("Current Time:", new Date().toLocaleTimeString());

  const skills = ["React", "TypeScript", "Next.js", "Python", "Node.js"];
  console.log("Verified Candidate Skills:", skills.join(" • "));
  
  return { status: "ready", count: skills.length };
}

main();
`,
      typescript: `// SKILLEZO.AI TypeScript Playground
interface CandidateProfile {
  name: string;
  role: string;
  score: number;
}

const candidate: CandidateProfile = {
  name: "Skillezo Developer",
  role: "Full-Stack Engineer",
  score: 95
};

console.log("Candidate Profile:", candidate);
`,
      python: `# SKILLEZO.AI Python 3 Playground
def greeting(name: str) -> str:
    return f"Hello, {name}! Welcome to the Skillezo Python Sandbox."

print(greeting("Engineer"))

numbers = [x**2 for x in range(1, 11)]
print("Squares 1..10:", numbers)
`,
    },
  },
];

