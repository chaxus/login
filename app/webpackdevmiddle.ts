import { type IncomingMessage, type ServerResponse } from "http";
import { type NextHandleFunction } from "connect";
import { type Context } from "koa";
import { type Compiler } from "webpack";
import devMiddleware, { type Options } from "webpack-dev-middleware";

const webpackDevMiddleware = (
  compiler: Compiler,
  options?: Options<IncomingMessage, ServerResponse>
) => {
  const expressMiddleware = devMiddleware(compiler, options);
  async function middleware(context: Context, next: NextHandleFunction) {
    const { locals, req: request, state } = context;
    await expressMiddleware(
      request,
      {
        // @ts-expect-error
        end: (content) => {
          context.body = content;
        },
        getHeader: context.get.bind(context),
        locals: locals || state,
        // @ts-expect-error
        setHeader: context.set.bind(context),
      },
      next
    );
  }
  return middleware;
};

export default webpackDevMiddleware;
