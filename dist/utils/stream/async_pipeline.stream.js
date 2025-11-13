import { promisify } from "node:util";
import { pipeline, } from "node:stream";
import { ServerException } from "../exceptions/custom.exceptions.js";
async function asyncPipeline({ source, destination, }) {
    return promisify(pipeline)(source, destination).catch((error) => {
        throw new ServerException(`Stream Pipeline Failed: ${error.message}`);
    });
}
export default asyncPipeline;
