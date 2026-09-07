# GymGPT — Build an APK without Android Studio

This project includes a GitHub Actions workflow that builds a directly installable `GymGPT.apk` in GitHub's cloud.

## Easiest method

1. Create a new **GitHub repository** (a free account is enough).
2. Upload **all files inside this project folder** to the repository. The `.github/workflows/build-apk.yml` file must also be uploaded.
3. Open the repository on GitHub and go to **Actions**.
4. Select **Build GymGPT APK**.
5. Click **Run workflow**.
6. Wait for the workflow to finish (usually several minutes on GitHub's runner).
7. Open the completed workflow run and scroll to **Artifacts**.
8. Download **GymGPT-APK**.
9. Extract it and you will have `GymGPT.apk`.
10. Send the APK to your Android phone, tap it, and install it.

## Important

- Android Studio is **not required** for this workflow.
- The workflow uses GitHub's cloud machine to install Java/Node/Gradle dependencies and build the APK.
- This produces a **debug APK**, suitable for installing/testing on your phone.
- For a Play Store release, a signed release build should be configured separately.
- If GitHub asks about permissions or an Android security setting blocks installation, allow installation from the source you used to open the APK.

## Gemini API key

If GymGPT's AI features require a Gemini API key at runtime, configure the project's environment/API setup separately. Do not commit a real API key into GitHub.
