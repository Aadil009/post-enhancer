// next.config.js
module.exports = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com",
            },
          ],
        },
      ];
    },
  };