// Compiler options read by the Metro plugin (withTamagui with no inline options).
// https://tamagui.dev/docs/intro/compiler-install#configuration-with-tamaguibuildts
import type { TamaguiBuildOptions } from 'tamagui'

export default {
  components: ['tamagui'],
  config: './tamagui.config.ts',
} satisfies TamaguiBuildOptions
