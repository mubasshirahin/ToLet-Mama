# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Firebase social auth

Google and Facebook sign-in use Firebase Authentication.

1. Create a Firebase project and add a Web app.
2. In Firebase Console > Authentication > Sign-in method, enable Google and Facebook.
3. Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values from your Firebase Web app config.
4. For Facebook, also add your Facebook App ID/secret in Firebase's Facebook provider settings.
5. Restart the Vite dev server after changing `.env`.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
# This file was updated to trigger PR close for remaining issues
