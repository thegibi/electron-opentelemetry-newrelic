import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Resource } from '@opentelemetry/resources'
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_OS_VERSION
} from '@opentelemetry/semantic-conventions'
import { NodeTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

export const registerAppInstrumentations = (
  appVersion: string,
  operatingSystem: string,
  appName: string
): void => {
  registerInstrumentations({
    instrumentations: [getNodeAutoInstrumentations()]
  })

  const resource = Resource.default().merge(
    new Resource({
      [SEMRESATTRS_SERVICE_NAME]: appName,
      [SEMRESATTRS_SERVICE_VERSION]: appVersion,
      [SEMRESATTRS_OS_VERSION]: operatingSystem
    })
  )

  const provider = new NodeTracerProvider({
    resource: resource
  })

  const otlpTracerExporter = new OTLPTraceExporter({
    url: import.meta.env.VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    headers: {
      'api-key': import.meta.env.VITE_OTEL_EXPORTER_OTLP_API_KEY
    }
  })

  const processor = import.meta.env.DEV
    ? new SimpleSpanProcessor(otlpTracerExporter)
    : new BatchSpanProcessor(otlpTracerExporter)

  provider.addSpanProcessor(processor)
  provider.register()
}
