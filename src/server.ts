import net from 'node:net';

export default class FINDS_Server {
  private target: string;
  private server: net.Server;
  private port = 0;

  constructor(target: string) {
    this.target = target;
    this.server = net
      .createServer((socket: net.Socket): void => {
        console.log(`* Connect: ${JSON.stringify(socket.remoteAddress)}`);
        // Send payload
        socket.write(`:FINDS 613 null :${this.target}\r\n`);
        // kill socket after a reasonable 2s
        setTimeout(() => {
          if (!socket.destroyed) {
            socket.destroy();
          }
        }, 2000);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('error', (err: any) => {
        if (Object.hasOwn(err, 'code') && err.code == 'EADDRINUSE') {
          console.log(`ERROR: Port ${this.port} in use, retrying in 5 seconds...`);
          setTimeout(() => {
            const port = this.port;
            this.port = 0;
            this.listen(port);
          }, 5000);
        }
      });
  }

  listen(port: number): void {
    if (this.port !== 0) {
      throw new Error('listen() already called.');
    }
    this.port = port;
    this.server.listen(port, () => {
      console.log(`Server listening on ${JSON.stringify(this.server.address())}`);
    });
  }
}
