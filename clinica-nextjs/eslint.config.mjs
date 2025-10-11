import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginQuery from "@tanstack/eslint-plugin-query";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
	// Ignorar carpetas
	{
		ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
	},
	// Extiende configs de Next.js + TypeScript
	...compat.extends("next/core-web-vitals", "next/typescript"),
	// Plugin de react Query
	...pluginQuery.configs["flat/recommended"],
	// Reglas personalizadas y plugin
	{
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unsafe-function-type": "off",
			quotes: "off",
			"react/no-unescaped-entities": "off",
			"@typescript-eslint/no-unused-vars": "off",
		},
	},
];

