// shared/tokens.ts type scale as Tailwind arbitrary values. Arbitrary sizes
// (text-[16px]) are recognised by tailwind-merge as font sizes, so they don't
// knock out the colour classes RNR components set through cn().
export const type = {
  caption: 'text-[13px] leading-[18px]',
  body: 'text-[16px] leading-[22px]',
  label: 'text-[15px] leading-[20px] font-semibold',
  title: 'text-[20px] leading-[26px] font-bold',
  heading: 'text-[28px] leading-[34px] font-bold',
} as const;
