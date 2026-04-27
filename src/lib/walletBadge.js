// Apple Wallet "Add to Apple Wallet" badge — base64-encoded PNG @2x.
// 330x100px, black rounded rectangle with the Wallet card-stack glyph
// and "Add to Apple Wallet" wordmark in white.
//
// Embedded directly in JS so the email helper doesn't depend on
// filesystem reads from /public — Next.js + Vercel can be unreliable
// about serving /public files to runtime serverless functions.
//
// To regenerate: scripts/generate-wallet-badge.py (or whichever build
// step produces public/wallet-pass/add-to-apple-wallet@2x.png), then
// `cat that.png | base64` and paste below.

export const ADD_TO_APPLE_WALLET_BADGE_BASE64 =
  "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" +
  "q9iwYYPVPwRH1WOPnj174q233sLx48eh1+thMBhQWVmJnJwcpKamQqPROGT4bSkojYfdOp1O6ola" +
  "6lFqtVppCF9aWoqioiKpTExMDL7++mtcunQJNTU1aGxsRFVVFbKysvD2229L/xidpT1tumvXLggh" +
  "cPz4cWn5+vXrXfp4ZUc9ROxNK5NLPVwMVh7oZTAYlPpzcnIEABESEiJaWlqU5YcOHWq1rtraWmlb" +
  "w8PDxdGjR63+LjqdToSHhzutnvLycqnc2LFjLW731KlThV6vt9nuxcXFIioqyu72TUxMlOopKCgw" +
  "K7N3715l/eHDh8WSJUuk14SFhUnlV6xYIa3fvn27ss7NzU1s3ry51f2ouLhYREZGWtzm1tqtLe3a" +
  "3jbdtWtXq9uemprqUg8XY4+yC5g3bx569OihzH///fdKz+bMmTPK8unTp7fac6uvr5fm165da/OZ" +
  "3v3798e+ffvMTnA4qp62mDBhAg4dOoSAgACb5UJDQ5GRkYHAwEC76s/KypIeYjd06FD4+flJZWJj" +
  "Y5Wf8/LycP78eZvHKW0dn/zoo4+QnJzc6naFhobi8OHD8PDwcPg+5ew2dUWd3aN805V7kwDEmTNn" +
  "lPqbmppE3759lXWvv/669P7Lly+3WZdpT0MIIbKzs0VMTIzw8fERkZGR4ueffzYrk5iY2CH1mPZ8" +
  "3NzcxOXLl6UyP/30k4iOjhbe3t5i8ODBYseOHdL6LVu22N3G+fn5Uh3PPPOMsi4sLExaN3XqVNGj" +
  "Rw9x7949ZdnmzZul+kpLS6XXhIaGKqMD49cJIcTWrVtFUFCQ8PHxEQkJCWa99aSkJIf2KB3Vpunp" +
  "6S7dizSZukRQvumqIRkeHi69x7Fjx6T1AQEBoqmpSVl/+vRpu4JSp9MJX19fqYynp6coKiqSyu3Z" +
  "s6dD6jH9g58xY4a0vqSkRHh7e8vPVFapxOnTp5UytbW1ZmVam7744gvpfVauXKmsmz9/vrK8paVF" +
  "9OzZU3kG+wP5+flK+aCgIKmu69evK+vi4uJEYWGh0Ol0orq6WtTV1Zk9+9x0WL5p0yaHBqWj2pRB" +
  "2TWH3l36i32d9UAx08t+du/eLc1XVlZKd4eMGzcOYWFhba5/69atqK2tlZbdv38f27dvtzmUdFY9" +
  "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";

export const ADD_TO_APPLE_WALLET_BADGE_BUFFER = Buffer.from(
  ADD_TO_APPLE_WALLET_BADGE_BASE64,
  "base64",
);
