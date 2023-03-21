import moment from "moment";
import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

// error < warn < info < verbose < debug
const logLevel: string = process.env.LOG_LEVEL ?? "info";
const version = process.env.npm_package_version ?? "";

const { combine, timestamp: timestampFunc, label: labelFunc, printf } = format;
const theFormat = combine(
    labelFunc({ label: `Explorer ${version}` }),
    timestampFunc({
        format: () => (moment().format("DD-MM-YYYY HH:mm:ss.SSSZ"))
    }),
    printf(({ level, message, label, timestamp }) => `[${timestamp}] [${label}] ${level}: ${message}`)
);

const logger = createLogger({
    level: logLevel,
    format: format.json(),
    defaultMeta: { service: `Explorer ${version}` },
    transports: [
        new transports.DailyRotateFile({
            filename: "logs/app-%DATE%.log",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d"
        })
    ]
});

if (process.env.NODE_ENV !== "production") {
    logger.add(new transports.Console({
        level: logLevel,
        format: combine(
            format.colorize(),
            theFormat
        )
    }));
}

export default logger;

