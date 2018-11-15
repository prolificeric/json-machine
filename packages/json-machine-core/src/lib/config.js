export const parseConfig = ({
  PORT = '10000',
  REDIS_URL
}) => ({
  server: {
    port: PORT
  },
  redis: [REDIS_URL]
});
