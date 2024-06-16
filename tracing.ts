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
import opentelemetry, { Tracer } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

const NEWRELIC_APP_NAME = 'electron-opentelemetry-newrelic-app'
const IS_DEVELOPMENT = import.meta.env.DEV

export const registerTracer = (appVersion: string, operatingSystem: string): void => {
  registerInstrumentations({
    instrumentations: [
      getNodeAutoInstrumentations()
      //TODO: Add an instrumentation library here when electron is supported
    ]
  })
  const resource = Resource.default().merge(
    new Resource({
      [SEMRESATTRS_SERVICE_NAME]: NEWRELIC_APP_NAME,
      [SEMRESATTRS_SERVICE_VERSION]: appVersion,
      [SEMRESATTRS_OS_VERSION]: operatingSystem
    })
  )
  const provider = new NodeTracerProvider({
    resource: resource
  })
  const otlpExporter = new OTLPTraceExporter({
    //Jaeger tracing url
    url: 'http://localhost:4318/v1/traces'
  })
  const processor = IS_DEVELOPMENT
    ? new SimpleSpanProcessor(otlpExporter)
    : new BatchSpanProcessor(otlpExporter)
  provider.addSpanProcessor(processor)
  provider.register()
}

export const GetTracer = (): Tracer => {
  return opentelemetry.trace.getTracer(NEWRELIC_APP_NAME)
}
