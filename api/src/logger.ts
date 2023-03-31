import moment from "moment";
import { createLogger, format, transports } from "winston";

// error < warn < info < verbose < debug
const logLevel: string = process.env.LOG_LEVEL ?? "info";
const version = process.env.npm_package_version ? ` ${process.env.npm_package_version}` : "";

const { combine, timestamp: timestampFunc, label: labelFunc, printf } = format;
const theFormat = combine(
    labelFunc({ label: `Explorer${version}` }),
    timestampFunc({
        format: () => (moment().format("DD-MM-YYYY HH:mm:ss.SSSZ"))
    }),
    printf(({ level, message, label, timestamp }) => `[${timestamp}] [${label}] ${level}: ${message}`)
);

const loggerFormat = process.env.NODE_ENV === "development" ? combine(format.colorize(), theFormat) : theFormat;

const logger = createLogger({
    level: logLevel,
    format: format.json(),
    defaultMeta: { service: `Explorer${version}` },
    transports: [
        new transports.Console({
            level: logLevel,
            format: loggerFormat
        })
    ]
});

export default logger;

