import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: 'info',
  format: format.simple(),
  transports: [
    new transports.Console()
  ]
});

const { combine, timestamp, printf, colorize } = format;

logger.format = combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`;
    })
);

if (process.env.NODE_ENV === 'production') {
    logger.add(new transports.File({ filename: 'app.log', level: 'info' }));
}