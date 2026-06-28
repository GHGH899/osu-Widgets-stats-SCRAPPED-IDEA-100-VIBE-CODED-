import { Server } from "gadget-server";
import { VerifyDiscordRequest } from '../../utils';

export default async function (server) {
  server.addHook('preHandler', (request, reply, done) => {
    // 👇 ADD THIS TO SKIP FOR BROWSER REDIRECTS
    if (request.method === 'GET') {
      done();
      return;
    }

    VerifyDiscordRequest(request, reply, process.env.PUBLIC_KEY);
    done();
  })
}