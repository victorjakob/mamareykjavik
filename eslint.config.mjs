import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...nextCoreWebVitals,
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "_tmp_*/**",
    ],
  },
];
