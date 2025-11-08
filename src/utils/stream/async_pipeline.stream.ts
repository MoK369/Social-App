import { promisify } from "node:util";
import {
  pipeline,
  type PipelineDestination,
  type PipelineSource,
} from "node:stream";
import { ServerException } from "../exceptions/custom.exceptions.ts";

async function asyncPipeline({
  source,
  destination,
}: {
  source: PipelineSource<any>;
  destination: PipelineDestination<typeof source, any>;
}) {
  return promisify(pipeline)(source, destination).catch((error) => {
    throw new ServerException(
      `Stream Pipeline Failed: ${(error as Error).message}`
    );
  });
}

export default asyncPipeline;
