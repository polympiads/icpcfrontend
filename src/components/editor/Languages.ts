const languageIdToPrismId: Record<string, string | undefined> = {
  ada: "ada",                  // Ada
  c: "c",                      // C
  cpp: "cpp",                  // C++
  csharp: "csharp",            // C#
  go: "go",                    // Go
  haskell: "haskell",          // Haskell
  java: "java",                // Java
  javascript: "javascript",    // JavaScript
  kotlin: "kotlin",            // Kotlin
  objectivec: "objectivec",    // Objective-C
  pascal: "pascal",            // Pascal
  php: "php",                  // PHP
  prolog: "prolog",            // Prolog
  python2: "python",           // Prism only has "python"
  python3: "python",           // Same as above
  ruby: "ruby",                // Ruby
  rust: "rust",                // Rust
  scala: "scala",              // Scala,
};

export const languageIdToName: Record<string, string> = {
  ada: "Ada",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  go: "Go",
  haskell: "Haskell",
  java: "Java",
  javascript: "JavaScript",
  kotlin: "Kotlin",
  objectivec: "Objective-C",
  pascal: "Pascal",
  php: "PHP",
  prolog: "Prolog",
  python2: "Python 2",
  python3: "Python 3",
  ruby: "Ruby",
  rust: "Rust",
  scala: "Scala",
};

// export const languageIds = [
//   "ada",
//   "c",
//   "cpp",
//   "csharp",
//   "go",
//   "haskell",
//   "java",
//   "javascript",
//   "kotlin",
//   "objectivec",
//   "pascal",
//   "php",
//   "prolog",
//   "python2",
//   "python3",
//   "ruby",
//   "rust",
//   "scala",
// ];

export function languageIdToPrismLanguage(language: string | undefined) {
  if (!language) {
    return undefined
  }
  return language in languageIdToPrismId ? languageIdToPrismId[language] : undefined
}
