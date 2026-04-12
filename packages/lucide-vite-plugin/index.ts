import { parse } from "@babel/parser";
import MagicString from "magic-string";
import type { Plugin } from "vite";

export function lucideImportOptimizer(): Plugin {
  return {
    name: "lucide-solid-optimizer",
    enforce: "pre",

    transform(code, _id) {
      if (!code.includes("lucide-solid")) return;

      const ast = parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });

      const ms = new MagicString(code);
      let changed = false;

      for (const node of ast.program.body) {
        if (
          node.type === "ImportDeclaration" &&
          node.source.value === "lucide-solid"
        ) {
          // Ignore default imports or namespace imports
          if (
            node.specifiers.some(
              (s) =>
                s.type === "ImportDefaultSpecifier" ||
                s.type === "ImportNamespaceSpecifier",
            )
          ) {
            continue;
          }

          // biome-ignore lint/style/noNonNullAssertion: Node positions are provided for jsx and typescript
          const start = node.start!;
          // biome-ignore lint/style/noNonNullAssertion: same as above
          const end = node.end!;

          const indentMatch = code.slice(0, start).match(/(^|\n)([ \t]*)$/);
          const indent = indentMatch ? indentMatch[2] : "";

          const hasSemi = code.slice(start, end).trim().endsWith(";");

          const lines: string[] = [];

          for (const spec of node.specifiers) {
            if (spec.type !== "ImportSpecifier") continue;

            let path: string;
            if (spec.imported.type === "Identifier") {
              path = toKebabCase(spec.imported.name);
            } else {
              path = spec.imported.value;
            }
            const localName = spec.local.name;

            lines.push(
              `${indent}import ${localName} from "lucide-solid/icons/${path}"${
                hasSemi ? ";" : ""
              }`,
            );
          }

          ms.overwrite(start, end, lines.join("\n"));
          changed = true;
        }
      }

      if (!changed) return;

      return {
        code: ms.toString(),
        map: ms.generateMap({ hires: true }),
      };
    },
  };
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
