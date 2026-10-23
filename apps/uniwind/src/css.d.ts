// TypeScript 6 checks side-effect imports (noUncheckedSideEffectImports), so
// `import '../global.css'` needs a module declaration. Uniwind's generated
// types don't provide one.
declare module '*.css';
