type LogLevel = 'info' | 'warn' | 'error';

const emit = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const serialized = JSON.stringify(payload);
  if (level === 'error') {
    console.error(serialized);
  } else if (level === 'warn') {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
};

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
};

export default logger;

