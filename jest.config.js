module.exports = {
  preset: '@react-native/jest-preset',
  // The RN preset ignores node_modules for transforms; whitelist the ESM-only
  // packages we added so Jest can compile them.
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?(' +
      '(jest-)?react-native|@react-native(-community)?|' +
      '@react-navigation|react-native-screens|react-native-safe-area-context' +
      ')/)',
  ],
};
