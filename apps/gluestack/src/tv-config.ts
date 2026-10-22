// gluestack-ui's tva() wraps tailwind-variants 0.1.20, which runs tailwind-merge
// 1.14 (a Tailwind v3-era merger). It does not know the token font sizes from
// theme.generated.css, classifies `text-heading` as a text *colour*, and drops
// `text-foreground` when both reach a component. gluestack's theme docs point
// to tailwind-variants' global config for this; it must be set before any
// component module calls tva(), so it is imported first from index.js.
// https://gluestack.io/ui/docs/home/theme-configuration/customizing-theme
// https://www.tailwind-variants.org/docs/config#global-config
import { defaultConfig } from 'tailwind-variants';

defaultConfig.twMergeConfig = {
  classGroups: {
    'font-size': [{ text: ['caption', 'body', 'label', 'title', 'heading'] }],
  },
};
