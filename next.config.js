/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: ['api.sejm.gov.pl'],
    },
}

module.exports = nextConfig
