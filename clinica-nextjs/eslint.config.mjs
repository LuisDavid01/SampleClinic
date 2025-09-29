// .eslintrc.cjs / eslint config usando FlatCompat
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [{
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}, ...compat.extends("next/core-web-vitals", "next/typescript"), {
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-function-type": "off",

        // desactivar la regla de comillas - permite usar cualquier tipo
        "quotes": "off",

        "react/no-unescaped-entities": "off",
        "@typescript-eslint/no-unused-vars": "off",
    },
}];

export default eslintConfig;
