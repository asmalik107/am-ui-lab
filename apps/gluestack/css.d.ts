// TypeScript 6 checks side-effect imports (noUncheckedSideEffectImports), so
// `import '@/global.css'` needs a module declaration. Uniwind's types don't ship one.
declare module '*.css';
